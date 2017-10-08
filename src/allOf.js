import { traverse } from './traverse';

export function allOfSample(into, children, options, spec) {
  let res = traverse(into, options, spec);
  const subSamples = [];

  for (let subSchema of children) {
    const { type, readOnly, writeOnly, value } = traverse({ type, ...subSchema }, options, spec);
    if (res.type && type && type !== res.type) {
      throw new Error('allOf: schemas with different types can\'t be merged');
    }
    if (type === 'array') {
      throw new Error(
        'allOf: subschemas with type array are not supported yet',
      );
    }
    res.type = res.type || type;
    res.readOnly = res.readOnly || readOnly;
    res.writeOnly = res.writeOnly || writeOnly;
    if (value) subSamples.push(value);
  }

  if (res.type === 'object') {
    res.value = res.value || {};
    Object.assign(res.value, ...subSamples);
    return res;
  } else {
    res.value = subSamples[subSamples.length - 1];
    return res;
  }
}
