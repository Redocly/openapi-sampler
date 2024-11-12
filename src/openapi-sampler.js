import { traverse, clearCache } from './traverse';
import { sampleArray, sampleBoolean, sampleNumber, sampleObject, sampleString } from './samplers/index';
import { XMLBuilder } from 'fast-xml-parser';

const builder = new XMLBuilder({
  ignoreAttributes : false,
  format: true,
  attributeNamePrefix: '$',
  textNodeName: '#text',
});

export var _samplers = {};

const defaults = {
  skipReadOnly: false,
  maxSampleDepth: 15,
};

export function sample(schema, options, spec) {
  let opts = Object.assign({}, defaults, options);
  clearCache();
  let result = traverse(schema, opts, spec).value;
  if (opts.format === 'xml') {
    if (Object.keys(result).length > 1) {
      result = { [schema?.xml?.name || 'root']: result };
    }
    return builder.build(result);
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
