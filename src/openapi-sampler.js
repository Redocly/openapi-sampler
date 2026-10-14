import { traverse, clearCache } from './traverse';
import { sampleArray, sampleBoolean, sampleNumber, sampleObject, sampleString } from './samplers/index';
import { XMLBuilder } from 'fast-xml-parser';
import JsonPointer from 'json-pointer';
import { getXMLAttributes, isAnnotatedRef, isArraySchema } from './utils';

export var _samplers = {};

const defaults = {
  skipReadOnly: false,
  maxSampleDepth: 15,
};

function convertJsonToXml(obj, schema, spec) {
  if (obj === undefined || obj === null) {
    throw new Error('Unknown format output for building XML.');
  }
  const isComposed = !!schema?.allOf && !isAnnotatedRef(schema);
  // A composed allOf merges its $refs into one element, so without a name of its own
  // the document element is named after its first $ref, like that $ref alone would be
  const { name, prefix, namespace } = getXMLAttributes(schema?.xml?.name || !isComposed ? schema : firstRefXml(schema.allOf, spec));
  const nodeType = schema?.xml?.nodeType;
  const isPrimitive = typeof obj !== 'object';
  const isArray = isArraySchema(schema);
  if (Array.isArray(obj)) {
    // A literal array (e.g. an `example`) has no XML item names yet: name them as sampleArray would
    obj = literalArrayToXml(obj, schema);
  }
  if (name && !isArray && (!nodeType || nodeType === 'element')) {
    // The root schema names the document element, whatever its content is
    obj = { [prefixed(name, prefix)]: withNamespace(obj, prefix, namespace) };
  } else if (isPrimitive || isComposed || Object.keys(obj).length > 1) {
    obj = { [name || 'root']: obj }; // XML document must contain one root element
  } else if (hasRepeatedRootElement(obj)) {
    obj = { root: obj }; // repeated (unwrapped array) elements would otherwise be sibling root elements
  }
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true,
    attributeNamePrefix: '$',
    textNodeName: '#text',
    cdataPropName: '#cdata',
  });
  return builder.build(obj);
}

function hasRepeatedRootElement(obj) {
  const [value] = Object.values(obj);
  return Array.isArray(value) && value.length > 1;
}

function prefixed(name, prefix) {
  return `${prefix ? prefix + ':' : ''}${name}`;
}

// The xml of the first $ref in an allOf, named after the referenced component when it has no xml.name
function firstRefXml(allOf, spec) {
  const ref = allOf.find(child => child?.$ref)?.$ref;
  if (!ref || !spec) return null;
  try {
    let pointer = decodeURIComponent(ref);
    if (pointer.startsWith('#')) pointer = pointer.substring(1);
    const xml = JsonPointer.get(spec, pointer)?.xml;
    return { xml: { ...xml, name: xml?.name || pointer.split('/').pop() } };
  } catch (e) {
    return null;
  }
}

function literalArrayToXml(items, schema) {
  const array = getXMLAttributes(schema);
  const item = getXMLAttributes(schema?.items);
  const itemName = item.name ? prefixed(item.name, item.prefix) : array.name ? prefixed(array.name, array.prefix) : 'root';
  const value = { [itemName]: items.map(entry => withNamespace(entry, item.prefix, item.namespace)) };
  const nodeType = schema?.xml?.nodeType || (schema?.xml?.wrapped === true ? 'element' : 'none');
  if (isArraySchema(schema) && array.name && nodeType === 'element') {
    // A wrapped array is its own element: <Tags><Tags>a</Tags><Tags>b</Tags></Tags>
    return { [prefixed(array.name, array.prefix)]: withNamespace(value, array.prefix, array.namespace) };
  }
  return value;
}

function withNamespace(value, prefix, namespace) {
  if (!namespace) {
    return value;
  }
  const attribute = `$xmlns${prefix ? ':' + prefix : ''}`;
  return typeof value === 'object' && !Array.isArray(value)
    ? { ...value, [attribute]: namespace }
    : { [attribute]: namespace, '#text': value };
}

export function sample(schema, options, spec) {
  let opts = Object.assign({}, defaults, options);
  clearCache();
  let result = traverse(schema, opts, spec).value;
  if (opts?.format === 'xml') {
    return convertJsonToXml(result, schema, spec);
  }
  return result;
};

export function _registerSampler(type, sampler) {
  _samplers[type] = sampler;
};

export { inferType } from './infer';

_registerSampler('array', sampleArray);
_registerSampler('boolean', sampleBoolean);
_registerSampler('integer', sampleNumber);
_registerSampler('number', sampleNumber);
_registerSampler('object', sampleObject);
_registerSampler('string', sampleString);
