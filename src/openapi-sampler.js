import { traverse, clearCache } from './traverse';
import { sampleArray, sampleBoolean, sampleNumber, sampleObject, sampleString } from './samplers/index';
import { XMLBuilder } from 'fast-xml-parser';
import { getXMLAttributes, isArraySchema } from './utils';

export var _samplers = {};

const defaults = {
  skipReadOnly: false,
  maxSampleDepth: 15,
};

function convertJsonToXml(obj, schema) {
  if (obj === undefined || obj === null) {
    throw new Error('Unknown format output for building XML.');
  }
  const { name, prefix, namespace } = getXMLAttributes(schema);
  const nodeType = schema?.xml?.nodeType;
  const isPrimitive = typeof obj !== 'object';
  const isArray = isArraySchema(schema);
  if (name && !isArray && (!nodeType || nodeType === 'element')) {
    // The root schema names the document element, whatever its content is
    obj = { [`${prefix ? prefix + ':' : ''}${name}`]: withNamespace(obj, prefix, namespace) };
  } else if (isPrimitive || Array.isArray(obj) || Object.keys(obj).length > 1) {
    obj = { [name || 'root']: obj }; // XML document must contain one root element
  } else if (isArray && hasRepeatedRootElement(obj)) {
    obj = { root: obj }; // unwrapped root array items would otherwise be sibling root elements
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
    return convertJsonToXml(result, schema);
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
