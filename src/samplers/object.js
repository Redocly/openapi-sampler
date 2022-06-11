import { traverse } from '../traverse';
import {MARKED_FOR_REMOVAL} from '../utils';

export function sampleObject(schema, options = {}, spec, context, markForRemoval = false) {
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
        if(markForRemoval) {
          res[propertyName] = MARKED_FOR_REMOVAL;
        }
        return;
      }

      const sample = traverse(schema.properties[propertyName], options, spec, { propertyName, depth: depth + 1 }, markForRemoval);

      if (options.skipReadOnly && sample.readOnly) {
        if(markForRemoval) {
          res[propertyName] = MARKED_FOR_REMOVAL;
        }
        return;
      }

      if (options.skipWriteOnly && sample.writeOnly) {
        if(markForRemoval) {
          res[propertyName] = MARKED_FOR_REMOVAL;
        }
        return;
      }
      res[propertyName] = sample.value;
    });
  }

  if (schema && typeof schema.additionalProperties === 'object') {
    const propertyName = schema.additionalProperties['x-additionalPropertiesName'] || 'property';
    res[`${String(propertyName)}1`] = traverse(schema.additionalProperties, options, spec, {depth: depth + 1 }, markForRemoval).value;
    res[`${String(propertyName)}2`] = traverse(schema.additionalProperties, options, spec, {depth: depth + 1 }, markForRemoval).value;
  }
  return res;
}
