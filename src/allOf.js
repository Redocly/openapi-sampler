import { traverse } from './traverse';

export function allOfSample(into, children, options, spec) {
  let type = into.type;
  const subSamples = [];
  for (let subSchema of children) {
    if (type && subSchema.type && type !== subSchema.type) {
      let errMessage = 'allOf: schemas with different types can\'t be merged';
      throw new Error(errMessage);
    }
    if (into.type === 'array') {
      throw new Error(
        'allOf: subschemas with type array are not supported yet',
      );
    }
    type = type || subSchema.type;
  }

  let mainSample = traverse({ type, ...into }, options, spec);
  for (let subSchema of children) {
    const subSample = traverse({ type, ...subSchema }, options, spec);
    if (type === 'object') {
      Object.assign(mainSample, subSample);
    } else {
      mainSample = subSample;
    }
  }
  return mainSample;
}
