import { _samplers } from './json-schema-sampler';
import { allOfSample } from './allOf';
import { inferType } from './infer';
import { getResultForCircular, mergeDeep, popSchemaStack } from './utils';
import JsonPointer from 'json-pointer';

let $refCache = {};
// for circular JS references we use additional array and not object as we need to compare entire schemas and not strings
let seenSchemasStack = [];

export function clearCache() {
  $refCache = {};
  seenSchemasStack = [];
}

export function traverse(schema, options, doc, context) {
  // checking circular JS references by checking context
  // because context is passed only when traversing through nested objects happens
  if (context) {
    if (seenSchemasStack.includes(schema)) return getResultForCircular(inferType(schema));
    seenSchemasStack.push(schema);
  }


  if (context && context.depth > options.maxSampleDepth) {
    popSchemaStack(seenSchemasStack, context);
    return getResultForCircular(inferType(schema));
  }

  if (schema.$ref) {
    let ref = decodeURIComponent(schema.$ref);
    if (ref.startsWith('#')) {
      ref = ref.substring(1);
    }

    const referenced = JsonPointer.get(doc, ref);

    let result;

    if ($refCache[ref] !== true) {
      $refCache[ref] = true;
      result = traverse(referenced, options, doc, context);
      $refCache[ref] = false;
    } else {
      const referencedType = inferType(referenced);
      result = getResultForCircular(referencedType);
    }
    popSchemaStack(seenSchemasStack, context);
    return result;
  }

  if (schema.example !== undefined) {
    popSchemaStack(seenSchemasStack, context);
    return {
      value: schema.example,
      readOnly: schema.readOnly,
      writeOnly: schema.writeOnly,
      type: schema.type,
    };
  }

  if (schema.allOf !== undefined) {
    popSchemaStack(seenSchemasStack, context);
    return allOfSample(
      { ...schema, allOf: undefined },
      schema.allOf,
      options,
      doc,
      context,
    );
  }

  if (schema.oneOf && schema.oneOf.length) {
    if (schema.anyOf) {
      if (!options.quiet) console.warn('oneOf and anyOf are not supported on the same level. Skipping anyOf');
    }
    popSchemaStack(seenSchemasStack, context);
    return traverse(schema.oneOf[0], options, doc, context);
  }

  if (schema.anyOf && schema.anyOf.length) {
    popSchemaStack(seenSchemasStack, context);
    return traverse(schema.anyOf[0], options, doc, context);
  }

  if (schema.if && schema.then) {
    return traverse(mergeDeep(schema.if, schema.then), options, doc, context);
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
    if (Array.isArray(type) && schema.type.length > 0) {
      type = schema.type[0];
    }
    if (!type) {
      type = inferType(schema);
    }
    let sampler = _samplers[type];
    if (sampler) {
      example = sampler(schema, options, doc, context);
    }
  }

  popSchemaStack(seenSchemasStack, context);
  return {
    value: example,
    readOnly: schema.readOnly,
    writeOnly: schema.writeOnly,
    type: type
  };
}
