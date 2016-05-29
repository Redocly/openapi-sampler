import { _samplers } from './openapi-sampler';

export function traverse(schema) {
  if (schema.example) {
    return schema.example;
  }

  if (schema.default) {
    return schema.default;
  }

  if (schema.enum && schema.enum.length) {
    return schema.enum[0];
  }

  let type = schema.type;
  let sampler = _samplers[type];
  if (sampler) return sampler(schema);
  return {};
}
