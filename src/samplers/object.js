import { traverse } from '../traverse';
export function sampleObject(schema, options = {}, spec, context) {
  let res = {};
  const depth = (context && context.depth || 1);

  if (schema && typeof schema.properties === 'object') {
    let requiredKeys = (Array.isArray(schema.required) ? schema.required : []);
    let requiredKeyDict = requiredKeys.reduce((dict, key) => {
      dict[key] = true;
      return dict;
    }, {});

    Object.keys(schema.properties).forEach(propertyName => {
      // skip before traverse that could be costly
      if (options.skipNonRequired && !requiredKeyDict.hasOwnProperty(propertyName)) {
        return;
      }

      const sample = traverse(schema.properties[propertyName], options, spec, { propertyName, depth: depth + 1 });
      if (options.skipReadOnly && sample.readOnly) {
        return;
      }

      if (options.skipWriteOnly && sample.writeOnly) {
        return;
      }
      res[propertyName] = sample.value;
    });
  }

  if (schema && typeof schema.additionalProperties === 'object') {
    const propertyName = schema.additionalProperties['x-additionalPropertiesName'] || 'property';
    res[`${String(propertyName)}1`] = traverse(schema.additionalProperties, options, spec, {depth: depth + 1 }).value;
    res[`${String(propertyName)}2`] = traverse(schema.additionalProperties, options, spec, {depth: depth + 1 }).value;
  }

  // Strictly enforce maxProperties constraint
  if (schema && typeof schema.properties === 'object' && schema.maxProperties !== undefined && Object.keys(res).length > schema.maxProperties) {
    let filteredResult = {};
    let propertiesAdded = 0;

    // Always include required properties first, if present
    const requiredProperties = (Array.isArray(schema.required) ? schema.required : []);
    requiredProperties.forEach(propName => {
        if (res[propName] !== undefined) {
            filteredResult[propName] = res[propName];
            propertiesAdded++;
        }
    });

    // Add other properties until maxProperties is reached
    Object.keys(res).forEach(propName => {
        if (propertiesAdded < schema.maxProperties && !filteredResult.hasOwnProperty(propName)) {
            filteredResult[propName] = res[propName];
            propertiesAdded++;
        }
    });

    res = filteredResult;
  }

  return res;
}
