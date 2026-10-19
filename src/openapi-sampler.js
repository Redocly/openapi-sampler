import { traverse, clearCache } from './traverse';
import { sampleArray, sampleBoolean, sampleNumber, sampleObject, sampleString } from './samplers/index';
import { XMLBuilder } from 'fast-xml-parser';
import { getXMLAttributes, isAnnotatedRef, isArraySchema, nameLiteralItems, prefixed, refXml, withNamespace } from './utils';

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
  const isComposed = !!rootSchema?.allOf && !isAnnotatedRef(rootSchema);
  const xmlSource = isComposed && !rootSchema.xml?.name ? firstRefXml(rootSchema.allOf, spec) : rootSchema;
  const { name, prefix, namespace } = getXMLAttributes(xmlSource);
  const nodeType = rootSchema?.xml?.nodeType;
  const isPrimitive = typeof obj !== 'object';
  const isArray = isArraySchema(rootSchema);
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
  const [value] = Object.values(obj);
  return Array.isArray(value) && value.length > 1;
}

function firstRefXml(allOf, spec) {
  const ref = allOf.find(child => child?.$ref);
  // Without a spec, traverse() did not resolve the $ref: the root's example, default, const or enum was used
  if (!ref || !spec) return null;
  return { xml: refXml(ref, spec) };
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
