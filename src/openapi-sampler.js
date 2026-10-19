import { traverse, clearCache } from './traverse';
import { sampleArray, sampleBoolean, sampleNumber, sampleObject, sampleString } from './samplers/index';
import { XMLBuilder } from 'fast-xml-parser';
import { firstRefXml, getXMLAttributes, isArraySchema, isComposedAllOf, isSampledAsArray, nameLiteralItems, prefixed, withNamespace } from './utils';

export var _samplers = {};

const defaults = {
  skipReadOnly: false,
  maxSampleDepth: 15,
};

function convertJsonToXml(obj, schema, spec) {
  if (obj === undefined || obj === null) {
    throw new Error('Unknown format output for building XML.');
  }
  // traverse() has already named the element of a root $ref, after the $ref and its siblings
  const rootSchema = schema?.$ref ? undefined : schema;
  const isComposed = isComposedAllOf(rootSchema);
  const xmlSource = isComposed && !rootSchema.xml?.name ? firstRefXml(rootSchema.allOf, spec) : rootSchema;
  const { name, prefix, namespace } = getXMLAttributes(xmlSource);
  const nodeType = rootSchema?.xml?.nodeType;
  const isPrimitive = typeof obj !== 'object';
  const isArray = isSampledAsArray(rootSchema);
  if (Array.isArray(obj)) {
    obj = literalArrayToXml(obj, rootSchema, spec);
  }
  if (name && !isArray && (!nodeType || nodeType === 'element')) {
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
  const [key, value] = Object.entries(obj)[0] || [];
  return Array.isArray(value) && value.length > 1 && !key.startsWith('#') && !key.startsWith('$');
}

function literalArrayToXml(values, schema, spec) {
  const array = getXMLAttributes(schema);
  const items = nameLiteralItems(values, schema, spec, array.name ? prefixed(array.name, array.prefix) : 'root');
  const value = { [items.name]: items.values };
  const nodeType = schema?.xml?.nodeType || (schema?.xml?.wrapped === true ? 'element' : 'none');
  if (isArraySchema(schema) && array.name && nodeType === 'element') {
    return { [prefixed(array.name, array.prefix)]: withNamespace(value, array.prefix, array.namespace) };
  }
  return value;
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
