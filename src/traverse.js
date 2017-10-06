import { _samplers } from './openapi-sampler';
import { allOfSample } from './allOf';
import { inferType } from './infer';
import JsonPointer from 'json-pointer';

let $refCache = {};

export function clearCache() {
  $refCache = {};
}

export function traverse(schema, options, spec) {
  if (schema.$ref) {
    if (!spec) {
      throw new Error('Your schema contains $ref. You must provide specification in the third parameter.');
    }
    let ref = schema.$ref;
    if (ref.startsWith('#')) {
      ref = ref.substring(1);
    }

    const referenced = JsonPointer.get(spec, ref);
    const referencedType = inferType(referenced);
    let result = referencedType === 'object' ?
        {}
      : referencedType === 'array' ?
          []
        : undefined;

    if ($refCache[ref] !== true) {
      $refCache[ref] = true;
      result = traverse(referenced, options, spec);
    }
    $refCache[ref] = false;
    return result;
  }

  if (schema.allOf !== undefined) {
    return allOfSample({ ...schema, allOf: undefined }, schema.allOf, spec);
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
    return sampler(schema, options, spec);
  }

  return null;
}
