'use strict';

import JsonPointer from 'json-pointer';
import { inferType } from './infer';

export const SKIP_SYMBOL = Symbol('skip');

function pad(number) {
  if (number < 10) {
    return '0' + number;
  }
  return number;
}

export function toRFCDateTime(date, omitTime, omitDate, milliseconds) {
  var res = omitDate ? '' : (date.getUTCFullYear() +
    '-' + pad(date.getUTCMonth() + 1) +
    '-' + pad(date.getUTCDate()));
  if (!omitTime) {
    res += 'T' + pad(date.getUTCHours()) +
      ':' + pad(date.getUTCMinutes()) +
      ':' + pad(date.getUTCSeconds()) +
      (milliseconds ? '.' + (date.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) : '') +
      'Z';
  }
  return res;
};

export function ensureMinLength(sample, min) {
  if (min > sample.length) {
    return sample.repeat(Math.trunc(min / sample.length) + 1).substring(0, min);
  }
  return sample;
}

export function mergeDeep(...objects) {
  const isObject = obj => obj && typeof obj === 'object';

  return objects.reduce((prev, obj) => {
    Object.keys(obj || {}).forEach(key => {
      const pVal = prev[key];
      const oVal = obj[key];

      if (isObject(pVal) && isObject(oVal)) {
        prev[key] = mergeDeep(pVal, oVal);
      } else {
        prev[key] = oVal;
      }
    });

    return prev;
  }, Array.isArray(objects[objects.length - 1]) ? [] : {});
}

// deterministic UUID sampler

export function uuid(str) {
  var hash = hashCode(str);
  var random = jsf32(hash, hash, hash, hash);
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    var r = (random() * 16) % 16 | 0;
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}

export function getResultForCircular(type) {
  return {
    value: type === 'object' ?
      {}
      : type === 'array' ? [] : undefined
  };
}

export function popSchemaStack(seenSchemasStack, context) {
  if (context) seenSchemasStack.pop();
}

const STRUCTURAL_KEYWORDS = [
  '$ref', '$dynamicRef', 'properties', 'patternProperties', 'additionalProperties',
  'items', 'prefixItems', 'allOf', 'oneOf', 'anyOf',
];

function hasOwnValue(schema) {
  return schema.example !== undefined || schema.const !== undefined || schema.default !== undefined
    || !!schema.examples?.length || !!schema.enum?.length;
}

function isAnnotationOnly(schema) {
  return !!schema && typeof schema === 'object' && !hasOwnValue(schema)
    && !STRUCTURAL_KEYWORDS.some(keyword => schema[keyword] !== undefined);
}

function isSingleRefAllOf(allOf) {
  if (!Array.isArray(allOf)) return false;
  const refs = allOf.filter(child => child?.$ref);
  return refs.length === 1 && allOf.every(child => child?.$ref || isAnnotationOnly(child));
}

export function isAnnotatedRef(schema) {
  return !!schema && isSingleRefAllOf(schema.allOf) && schema.xml === undefined
    && isAnnotationOnly({ ...schema, allOf: undefined });
}

// traverse() samples a schema as an array when its first type, or the type inferred from its keywords, is array
export function isSampledAsArray(schema) {
  return !!schema && typeof schema === 'object' && inferType(schema) === 'array';
}

// `type: "array"`, which makes `none` the default nodeType; a list of types is sampled as its first
export function isArraySchema(schema) {
  const type = schema?.type;
  return (Array.isArray(type) ? type[0] : type) === 'array';
}

// Copies only the objects it removes something from, so examples from the spec are never written to
export function stripSkipped(value) {
  if (!value || typeof value !== 'object') {
    return value;
  }
  let result = value;
  for (const [key, child] of Object.entries(value)) {
    const stripped = child === SKIP_SYMBOL ? child : stripSkipped(child);
    if (stripped === child && child !== SKIP_SYMBOL) {
      continue;
    }
    if (result === value) {
      result = Array.isArray(value) ? [...value] : { ...value };
    }
    if (child === SKIP_SYMBOL) {
      delete result[key];
    } else {
      result[key] = stripped;
    }
  }
  return result;
}

function shouldIgnoreRefSiblings(spec) {
  return String(spec.openapi ?? '').startsWith('3.0') || spec.swagger !== undefined;
}

function mergeRefSiblings(referenced, siblings) {
  const merged = mergeDeep(referenced, siblings);
  // mergeDeep merges arrays by index, which would drop required names of the referenced schema
  if (Array.isArray(referenced.required) && Array.isArray(siblings.required)) {
    merged.required = [...new Set([...referenced.required, ...siblings.required])];
  }
  return merged;
}

function refPointer($ref) {
  const pointer = decodeURIComponent($ref);
  return pointer.startsWith('#') ? pointer.substring(1) : pointer;
}

// The schema a $ref points to, with the keywords next to the $ref merged in
// (except in OpenAPI 3.0 and Swagger 2.0, where they are ignored)
export function resolveRef(schema, spec) {
  if (!spec) {
    throw new Error('Your schema contains $ref. You must provide full specification in the third parameter.');
  }
  const pointer = refPointer(schema.$ref);
  const siblings = Object.fromEntries(
    Object.entries(schema).filter(([key, value]) => key !== '$ref' && value !== undefined),
  );
  const referenced = Object.keys(siblings).length && !shouldIgnoreRefSiblings(spec)
    ? mergeRefSiblings(JsonPointer.get(spec, pointer), siblings)
    : JsonPointer.get(spec, pointer);
  return { pointer, referenced };
}

// The xml of a $ref, named after the referenced component when it has no xml.name.
// traverse() never resolves a $ref under a value it takes as is (example, default, const, enum or examples),
// so here the $ref may be missing or external: then there is no xml to use.
export function refXml(schema, spec) {
  if (!spec || !JsonPointer.has(spec, refPointer(schema.$ref))) {
    return null;
  }
  const { pointer, referenced } = resolveRef(schema, spec);
  return { ...referenced?.xml, name: referenced?.xml?.name || pointer.split('/').pop() };
}

export function isComposedAllOf(schema) {
  return !!schema?.allOf && !isAnnotatedRef(schema);
}

// A composed allOf without a name of its own is named after its first $ref
export function firstRefXml(allOf, spec) {
  const ref = allOf.find(child => child?.$ref);
  const xml = ref && refXml(ref, spec);
  return xml ? { xml } : null;
}

export function prefixed(name, prefix) {
  return prefix ? `${prefix}:${name}` : name;
}

export function withNamespace(value, prefix, namespace) {
  if (!namespace) {
    return value;
  }
  const attribute = `$xmlns${prefix ? ':' + prefix : ''}`;
  if (value !== null && typeof value === 'object') {
    return Object.assign(Array.isArray(value) ? [...value] : { ...value }, { [attribute]: namespace });
  }
  return { [attribute]: namespace, '#text': value };
}

// Names the items of a literal array: by their own xml.name or $ref, else by fallbackName
export function nameLiteralItems(values, schema, spec, fallbackName) {
  const items = schema?.items;
  const itemRefXml = items?.$ref && refXml(items, spec);
  const item = getXMLAttributes(itemRefXml ? { xml: itemRefXml } : items);
  return {
    name: item.name ? prefixed(item.name, item.prefix) : fallbackName,
    values: values.map(value => withNamespace(value, item.prefix, item.namespace)),
  };
}

export function getXMLAttributes(schema) {
  return {
    name: schema?.xml?.name || '',
    prefix: schema?.xml?.prefix || '',
    namespace: schema?.xml?.namespace || null,
    attribute: schema?.xml?.attribute ?? false,
    wrapped: schema?.xml?.wrapped ?? false,
  };
}

function resolveNodeType(schema, resultType) {
  const xml = schema?.xml;

  if (xml?.nodeType) {
    return xml.nodeType;
  }

  if (xml?.attribute === true) {
    return 'attribute';
  }

  if (xml?.wrapped === true && isArraySchema(schema)) {
    return 'element';
  }

  if (schema?.$ref || schema?.$dynamicRef || isArraySchema(schema)) {
    return 'none';
  }

  if ((schema?.allOf || schema?.oneOf || schema?.anyOf) && hasOwnValue(schema)) {
    // traverse() takes this value before the subschemas, so no $ref in them names it
    return 'element';
  }

  if (isComposedAllOf(schema)) {
    return resultType === 'array' ? 'none' : 'element';
  }

  const variants = schema?.oneOf || schema?.anyOf;
  if (Array.isArray(variants) && variants.length) {
    // The first variant is the one that gets sampled, so it decides the node type
    return resolveNodeType(variants[0], resultType) === 'element' ? 'element' : 'none';
  }

  if (schema?.oneOf || schema?.anyOf || schema?.allOf) {
    return 'none';
  }

  return 'element';
}

export function applyXMLAttributes(result, schema = {}, context = {}, spec) {
  const { value: oldValue } = result;
  const { propertyName: oldPropertyName } = context;
  // An unnamed composed allOf item, with no property to name it, is named like a root one
  const xmlSource = !schema.xml?.name && !oldPropertyName && isComposedAllOf(schema)
    ? firstRefXml(schema.allOf, spec) || schema
    : schema;
  const { name, prefix, namespace } = getXMLAttributes(xmlSource);
  const effectiveNodeType = resolveNodeType(schema, result.type);

  let propertyName = name || oldPropertyName ? prefixed(name || oldPropertyName, prefix) : null;
  // Sampled arrays are objects by now (unless empty), so an array here is an example, default, etc.
  const isLiteralArray = Array.isArray(oldValue) && (isSampledAsArray(schema) || result.type === 'array');
  // An array property whose value is null or a scalar (e.g. `default: null`) has no items: it stays one element
  const isItemlessArray = isArraySchema(schema) && !!oldPropertyName && (oldValue === null || typeof oldValue !== 'object');

  let value = typeof oldValue === 'object'
    ? Array.isArray(oldValue)
      ? [...oldValue]
      : { ...oldValue }
    : oldValue;

  switch (effectiveNodeType) {
    case 'attribute':
      if (propertyName) {
        propertyName = `$${propertyName}`;
      }
      break;

    case 'text':
      propertyName = '#text';
      break;

    case 'cdata':
      propertyName = '#cdata';
      break;

    case 'none':
      if (isLiteralArray) {
        // An unwrapped array's own xml.name is ignored, so unnamed items are named after the property
        ({ name: propertyName, values: value } = nameLiteralItems(value, schema, spec, oldPropertyName || propertyName));
      } else if (!isItemlessArray) {
        propertyName = null;
      }
      break;

    default:
      if (isLiteralArray) {
        const items = nameLiteralItems(value, schema, spec, propertyName);
        value = { [items.name]: items.values };
      }
      break;
  }

  if (effectiveNodeType !== 'text' && effectiveNodeType !== 'cdata' && effectiveNodeType !== 'none') {
    value = withNamespace(value, prefix, namespace);
  }

  return {
    propertyName,
    value,
  };
}

function hashCode(str) {
  var hash = 0;
  if (str.length == 0) return hash;
  for (var i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

function jsf32(a, b, c, d) {
  return function () {
    a |= 0; b |= 0; c |= 0; d |= 0;
    var t = a - (b << 27 | b >>> 5) | 0;
    a = b ^ (c << 17 | c >>> 15);
    b = c + d | 0;
    c = d + t | 0;
    d = a + t | 0;
    return (d >>> 0) / 4294967296;
  }
}
