import { traverse } from './traverse';
import { isAnnotatedRef, mergeDeep, SKIP_SYMBOL, stripSkipped } from './utils';


export function allOfSample(into, children, options, spec, context) {
  let res = traverse(into, options, spec);
  const subSamples = [];

  // In XML, a $ref is normally wrapped in an element named after it. The children of a
  // composed allOf describe one element together, so their properties are merged flat.
  // A lone $ref keeps its wrapper, so it is named like a plain $ref would be, unless the
  // schema adds properties or its own xml to it: then it is composed like any other allOf.
  const flattenXmlRefs = options.format === 'xml' && !isAnnotatedRef({ ...into, allOf: children });

  for (let subSchema of children) {
    const childSchema = subSchema.$ref ? subSchema : { type: res.type, ...subSchema };
    const { type, readOnly, writeOnly, value } = traverse(childSchema, options, spec, {
      ...context,
      isAllOfChild: true,
      ...(flattenXmlRefs && { flattenXmlRef: true }),
    });
    if (res.type && type && type !== res.type) {
      console.warn('allOf: schemas with different types can\'t be merged');
      res.type = type;
    }
    res.type = res.type || type;
    res.readOnly = res.readOnly || readOnly;
    res.writeOnly = res.writeOnly || writeOnly;
    if (value != null) subSamples.push(value);
  }

  if (res.type === 'object') {
    res.value = mergeDeep(res.value || {}, ...subSamples.filter(sample => typeof sample === 'object'));
    for (const key in res.value) {
      if (res.value[key] === SKIP_SYMBOL) {
        delete res.value[key];
      }
    }
    if (options.format === 'xml') {
      // An XML $ref wrapper nests the skipped properties one level down
      stripSkipped(res.value);
    }
    return res;
  } else {
    if (res.type === 'array') {
      // TODO: implement arrays
      if (!options.quiet) console.warn('OpenAPI Sampler: found allOf with "array" type. Result may be incorrect');
    }
    const lastSample = subSamples[subSamples.length - 1];
    res.value = lastSample != null ? lastSample : res.value;
    return res;
  }
}
