import { traverse, clearCache } from './traverse';
import { sampleArray, sampleBoolean, sampleNumber, sampleObject, sampleString } from './samplers/index';
import {removeForRemovalMarkedProperties} from './utils';

export var _samplers = {};

const defaults = {
  skipReadOnly: false,
  maxSampleDepth: 15,
};

export function sample(schema, options, spec) {
  let opts = Object.assign({}, defaults, options);
  clearCache();

  let traverseResult = traverse(schema, opts, spec, null, true);
  return removeForRemovalMarkedProperties(traverseResult.value);
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
