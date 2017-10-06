import { traverse } from './traverse';

export function allOfSample(into, children) {
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

  let mainSample = traverse({ type, ...into });
  for (let subSchema of children) {
    if (type === 'object') {
      Object.assign(mainSample, traverse({ type, ...subSchema }));
    } else {
      mainSample = traverse({ type, ...subSchema });
    }
  }
  return mainSample;
}
