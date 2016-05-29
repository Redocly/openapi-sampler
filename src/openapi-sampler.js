import { traverse } from './traverse';
import { sampleArray, sampleBoolean, sampleNumber, sampleObject, sampleString} from './samplers';
import { normalize } from './normalize';

const OpenAPISampler = {

  sample(schema) {
    normalize(schema);
    return traverse(schema);
  },

  _registerSampler(type, sampler) {
    OpenAPISampler._samplers[type] = sampler;
  },

  _samplers: {}

};

OpenAPISampler._registerSampler('array', sampleArray);
OpenAPISampler._registerSampler('boolean', sampleBoolean);
OpenAPISampler._registerSampler('integer', sampleNumber);
OpenAPISampler._registerSampler('number', sampleNumber);
OpenAPISampler._registerSampler('object', sampleObject);
OpenAPISampler._registerSampler('string', sampleString);

export default OpenAPISampler;
