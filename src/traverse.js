import { _samplers } from './openapi-sampler';
import { allOfSample } from './allOf';
import { inferType } from './infer';
import { getResultForCircular } from './utils';
import JsonPointer from 'json-pointer';

let $refCache = {};
//for circular JS references we use additional array and not object as we need to compare entire schemas and not strings
let seenSchemasStack = [];

export function clearCache() {
  $refCache = {};
  seenSchemasStack = [];
}

export function traverse(schema, options, spec, context) {
  // checking circular JS references by checking context 
  // because context is passed only when traversing through nested objects happens
  if (context) {
    if (seenSchemasStack.includes(schema)) return getResultForCircular(inferType(schema));
    seenSchemasStack.push(schema);
  }

  if (schema.$ref) {
    if (!spec) {
      throw new Error('Your schema contains $ref. You must provide full specification in the third parameter.');
    }
    let ref = decodeURIComponent(schema.$ref);
    if (ref.startsWith('#')) {
      ref = ref.substring(1);
    }

    const referenced = JsonPointer.get(spec, ref);

    let result;

    if ($refCache[ref] !== true) {
      $refCache[ref] = true;
      result = traverse(referenced, options, spec);
      $refCache[ref] = false;
    } else {
      const referencedType = inferType(referenced);
      result = getResultForCircular(referencedType);
    }
    return result;
  }

  if (schema.example !== undefined) {
    seenSchemasStack.pop();
    return {
      value: schema.example,
      readOnly: schema.readOnly,
      writeOnly: schema.writeOnly,
      type: schema.type,
    };
  }

  if (schema.allOf !== undefined) {
    return allOfSample(
      { ...schema, allOf: undefined },
      schema.allOf,
      options,
      spec,
    );
  }

  if (schema.oneOf && schema.oneOf.length) {
    if (schema.anyOf) {
      if (!options.quiet) console.warn('oneOf and anyOf are not supported on the same level. Skipping anyOf');
    }
    return traverse(schema.oneOf[0], options, spec);
  }

  if (schema.anyOf && schema.anyOf.length) {
    return traverse(schema.anyOf[0], options, spec);
  }

  let example = null;
  let type = null;
  if (schema.default !== undefined) {
    example = schema.default;
  } else if (schema.const !== undefined) {
    example = schema.const;
  } else if (schema.enum !== undefined && schema.enum.length) {
    example = schema.enum[0];
  } else if (schema.examples !== undefined && schema.examples.length) {
    example = schema.examples[0];
  } else {
    type = schema.type;
    if (!type) {
      type = inferType(schema);
    }
    let sampler = _samplers[type];
    if (sampler) {
      example = sampler(schema, options, spec, context);
    }
  }

  seenSchemasStack.pop();
  return {
    value: example,
    readOnly: schema.readOnly,
    writeOnly: schema.writeOnly,
    type: type
  };
}
