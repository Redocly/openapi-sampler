import { traverse } from '../traverse';
export function sampleObject(schema, options = {}, spec) {
  let res = {};
  if (schema && typeof schema.properties === 'object') {
    Object.keys(schema.properties).forEach(propertyName => {
      const sample = traverse(schema.properties[propertyName], options, spec);
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
    res.property1 = traverse(schema.additionalProperties, options, spec).value;
    res.property2 = traverse(schema.additionalProperties, options, spec).value;
  }
  return res;
}
