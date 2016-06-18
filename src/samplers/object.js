import { traverse } from '../traverse';
export function sampleObject(schema, options = {}) {
  let res = {};
  if (schema && typeof schema.properties === 'object') {
    Object.keys(schema.properties).forEach(propertyName => {
      if (options.skipReadOnly && schema.properties[propertyName].readOnly) {
        return;
      }
      res[propertyName] = traverse(schema.properties[propertyName]);
    });
  }
  return res;

  // TODO: additionalProperties
}
