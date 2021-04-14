export function sampleNumber(schema) {
  if ('minimum' in schema) {
    return schema.minimum;
  }

  let res = 0;
  if ('exclusiveMinimum' in schema) {
    res = schema.exclusiveMinimum + 1;

    if (res === schema.exclusiveMaximum) {
      res = (res + schema.exclusiveMaximum - 1) / 2;
    }
  } else if ('exclusiveMaximum' in schema) {
    res = schema.exclusiveMaximum - 1;
  } else if ('maximum' in schema) {
    res = schema.maximum;
  }

  return res;
}
