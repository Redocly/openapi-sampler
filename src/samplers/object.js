import { traverse } from '../traverse';
export function sampleObject(schema, options = {}, spec, context) {
  let res = {};
  const depth = (context && context.depth || 1);

  if (schema && typeof schema.properties === 'object') {
    const requiredKeys = (Array.isArray(schema.required) ? schema.required : []);
    const requiredKeyDict = requiredKeys.reduce((dict, key) => {
      dict[key] = true;
      return dict;
    }, {});

    Object.keys(schema.properties).forEach(propertyName => {
      const isRequired = requiredKeyDict.hasOwnProperty(propertyName);
      // skip before traverse that could be costly
      if (options.skipNonRequired && !isRequired) {
        return;
      }

      const propertyOmissible = options.disableNonRequiredAutoGen && !isRequired;

      const sample = traverse(
        schema.properties[propertyName],
        Object.assign({}, options, { omissible: propertyOmissible }),
        spec,
        { propertyName, depth: depth + 1 }
      );

      if (options.skipReadOnly && sample.readOnly) {
        return;
      }

      if (options.skipWriteOnly && sample.writeOnly) {
        return;
      }

      if (sample.value || !propertyOmissible) {
        res[propertyName] = sample.value;
      }
    });
  }

  if (!options.disableNonRequiredAutoGen && schema && typeof schema.additionalProperties === 'object') {
    res.property1 = traverse(schema.additionalProperties, options, spec, {depth: depth + 1 }).value;
    res.property2 = traverse(schema.additionalProperties, options, spec, {depth: depth + 1 }).value;
  }

  if (Object.keys(res).length > 0 || !options.omissible) {
    return res;
  }

  return null;
}
