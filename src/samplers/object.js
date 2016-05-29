import { traverse } from '../traverse';
export function sampleObject(schema) {
  let res = {};
  if (schema && typeof schema.properties === 'object') {
    Object.keys(schema.properties).forEach(propertyName => {
      res[propertyName] = traverse(schema.properties[propertyName]);
    });
  }
  return res;

  // TODO: additionalProperties
}
