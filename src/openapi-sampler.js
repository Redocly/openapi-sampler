import { traverse } from './traverse';
import { sampleArray, sampleBoolean, sampleNumber, sampleObject, sampleString} from './samplers/index';
import { normalize } from './normalize';

export var _samplers = {};

export function sample(schema) {
  return traverse(schema);
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
