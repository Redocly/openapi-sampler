import { traverse } from './traverse';
import { sampleArray, sampleBoolean, sampleNumber, sampleObject, sampleString} from './samplers/index';

export var _samplers = {};

const defaults = {
  skipReadOnly: false
};

export function sample(schema, options) {
  let opts = Object.assign({}, defaults, options);
  return traverse(schema, opts);
};

export function _registerSampler(type, sampler) {
  _samplers[type] = sampler;
};

_registerSampler('array', sampleArray);
_registerSampler('boolean', sampleBoolean);
_registerSampler('integer', sampleNumber);
_registerSampler('number', sampleNumber);
_registerSampler('object', sampleObject);
_registerSampler('string', sampleString);
