import { traverse } from '../traverse';
export function sampleArray(schema, options = {}, spec, context) {
  const depth = (context && context.depth || 1);

  let arrayLength = Math.min(schema.maxItems != undefined ? schema.maxItems : Infinity, schema.minItems || 1);
  // for the sake of simplicity, we're treating `contains` in a similar way to `items`
  const items = schema.items || schema.contains;
  if (Array.isArray(items)) {
    arrayLength = Math.max(arrayLength, items.length);
  }

  const itemSchemaGetter = itemNumber => {
    if (Array.isArray(schema.items)) {
      return items[itemNumber] || {};
    }
    return items || {};
  };

  let res = [];
  if (!items) return res;

  for (let i = 0; i < arrayLength; i++) {
    let { value: sample } = traverse(itemSchemaGetter(i), options, spec, {depth: depth + 1});
    res.push(sample);
  }

  if (!options.omissible || res.some(item => item !== null)) {
    return res;
  }

  return null;
}
