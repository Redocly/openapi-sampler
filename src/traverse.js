import { _samplers } from './openapi-sampler';
import { allOfSample } from './allOf';
import { inferType } from './infer';

export function traverse(schema, options) {
  if (schema.allOf !== undefined) {
    return allOfSample({ ...schema, allOf: undefined }, schema.allOf);
  }

  if (schema.example !== undefined) {
    return schema.example;
  }

  if (schema.default !== undefined) {
    return schema.default;
  }

  if (schema.enum !== undefined && schema.enum.length) {
    return schema.enum[0];
  }

  let type = schema.type;
  if (!type) {
    type = inferType(schema);
  }
  let sampler = _samplers[type];
  if (sampler) {
    return sampler(schema, options);
  }

  return null;
}
