import { traverse } from '../traverse';
import { applyXMLAttributes } from '../utils';

export function sampleArray(schema, options = {}, spec, context) {
  const depth = (context && context.depth || 1);

  let arrayLength = Math.min(schema.maxItems != undefined ? schema.maxItems : Infinity, schema.minItems || 1);
  // for the sake of simplicity, we're treating `contains` in a similar way to `items`
  const items = schema.prefixItems || schema.items || schema.contains;
  if (Array.isArray(items)) {
    arrayLength = Math.max(arrayLength, items.length);
  }

  let itemSchemaGetter = itemNumber => {
    if (Array.isArray(items)) {
      return items[itemNumber] || {};
    }
    return items || {};
  };

  let res = [];
  if (!items) return res;

  for (let i = 0; i < arrayLength; i++) {
    let itemSchema = itemSchemaGetter(i);
    let { value: sample } = traverse(itemSchema, options, spec, {depth: depth + 1});
    if (options?.format === 'xml') {
      const { value, propertyName } = applyXMLAttributes({value: sample}, itemSchema);
      if (propertyName) {
        if (!res?.[propertyName]) {
          res = { ...res, [propertyName]: [] };
        }
        res[propertyName].push(value);
      } else {
        res.push(sample);
      }
    } else {
      res.push(sample);
    }
  }
  return res;
}
