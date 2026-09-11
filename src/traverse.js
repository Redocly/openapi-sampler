import { _samplers } from './openapi-sampler';
import { allOfSample } from './allOf';
import { inferType } from './infer';
import { getResultForCircular, mergeDeep, popSchemaStack } from './utils';
import JsonPointer from 'json-pointer';
import { applyXMLAttributes } from './utils';

let $refCache = {};
// for circular JS references we use additional array and not object as we need to compare entire schemas and not strings
let seenSchemasStack = [];

export function clearCache() {
  $refCache = {};
  seenSchemasStack = [];
}

function inferExample(schema) {
  let example;
  if (schema.const !== undefined) {
    example = schema.const;
  } else if (schema.examples !== undefined && schema.examples.length) {
    example = schema.examples[0];
  } else if (schema.enum !== undefined && schema.enum.length) {
    example = schema.enum[0];
  } else if (schema.default !== undefined) {
    example = schema.default;
  }
  return example;
}

function tryInferExample(schema) {
  const example = inferExample(schema);
  // case when we don't infer example from schema but take from `const`, `examples`, `default` or `enum` keywords
  if (example !== undefined) {
    return {
      value: example,
      readOnly: schema.readOnly,
      writeOnly: schema.writeOnly,
      type: null,
    };
  }
  return;
}

function getRequired(schema) {
  return Array.isArray(schema && schema.required) ? schema.required : [];
}

// oneOf is exclusive: a property required only by a sibling alternative would
// make the sample match more than one subschema (see issue #151).
function omitSiblingOneOfRequired(sampleValue, schema, selectedRequired) {
  if (!sampleValue || typeof sampleValue !== 'object' || Array.isArray(sampleValue)) {
    return;
  }

  const keep = {};
  for (const prop of getRequired(schema)) {
    keep[prop] = true;
  }
  for (const prop of selectedRequired) {
    keep[prop] = true;
  }

  for (let i = 1; i < schema.oneOf.length; i++) {
    const altRequired = getRequired(schema.oneOf[i]);
    for (const prop of altRequired) {
      if (!keep[prop]) {
        delete sampleValue[prop];
      }
    }
  }
}

export function traverse(schema, options, spec, context) {
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
      const traverseResult = traverse(referenced, options, spec, context);
      if (options.format === 'xml') {
        const refName = ref.split('/').pop();
        const xmlContext = { ...context, propertyName: context?.propertyName || refName };
        const { propertyName, value } = applyXMLAttributes(traverseResult, referenced, xmlContext);
        result = { ...traverseResult, value: { [propertyName || 'root']: value } };
      } else {
        result = traverseResult;
      }

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
    return tryInferExample(schema) || allOfSample(
      { ...schema, allOf: undefined },
      schema.allOf,
      options,
      spec,
      context,
    );
  }

  if (schema.oneOf && schema.oneOf.length) {
    if (schema.anyOf) {
      if (!options.quiet) console.warn('oneOf and anyOf are not supported on the same level. Skipping anyOf');
    }
    popSchemaStack(seenSchemasStack, context);

    // Make sure to pass down readOnly and writeOnly annotations from the parent
    const firstOneOf = Object.assign({
      readOnly: schema.readOnly,
      writeOnly: schema.writeOnly
    }, schema.oneOf[0]);

    return traverseOneOrAnyOf(schema, firstOneOf)
  }

  if (schema.anyOf && schema.anyOf.length) {
    popSchemaStack(seenSchemasStack, context);

    // Make sure to pass down readOnly and writeOnly annotations from the parent
    const firstAnyOf = Object.assign({
      readOnly: schema.readOnly,
      writeOnly: schema.writeOnly
    }, schema.anyOf[0]);

    return traverseOneOrAnyOf(schema, firstAnyOf)
  }

  if (schema.if && schema.then) {
    popSchemaStack(seenSchemasStack, context);
    const { if: ifSchema, then, ...rest } = schema;
    return traverse(mergeDeep(rest, ifSchema, then), options, spec, context);
  }

  let example = inferExample(schema);
  let type = null;
  if (example === undefined) {
    example = null;
    type = schema.type;
    if (Array.isArray(type) && schema.type.length > 0) {
      type = schema.type[0];
    }
    if (!type) {
      type = inferType(schema);
    }
    let sampler = _samplers[type];
    if (sampler) {
      example = sampler(schema, options, spec, context);
    }
  }

  popSchemaStack(seenSchemasStack, context);
  return {
    value: example,
    readOnly: schema.readOnly,
    writeOnly: schema.writeOnly,
    type: type
  };

  function traverseOneOrAnyOf(schema, selectedSubSchema) {
    const inferred = tryInferExample(schema);
    if (inferred !== undefined) {
      return inferred;
    }

    const rest = { ...schema, oneOf: undefined, anyOf: undefined };
    const selectedRequired = getRequired(selectedSubSchema);

    // Lift required from the selected alternative so skipNonRequired sees it.
    if (schema.oneOf && selectedRequired.length) {
      rest.required = getRequired(rest).concat(selectedRequired);
    }

    const localExample = traverse(rest, options, spec, context);
    const subSchemaExample = traverse(selectedSubSchema, options, spec, context);

    if (typeof localExample.value === 'object' && typeof subSchemaExample.value === 'object') {
      const mergedExample = mergeDeep(localExample.value, subSchemaExample.value);
      if (schema.oneOf) {
        omitSiblingOneOfRequired(mergedExample, schema, selectedRequired);
      }
      return { ...subSchemaExample, value: mergedExample };
    }

    return subSchemaExample;
  }
}
