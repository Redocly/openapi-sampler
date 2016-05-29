
/*
(2, 3) -> 2.5
(2, 5) -> 3
[2, 3] -> 2
[2, 5] -> 3
(2, 3] -> 3
(2.8, 3.5) -> 3
(2.4, 2.9) -> ?
(2, inf) -> 3
[2, inf) -> 2
(-inf, 100) -> 0
(-inf, 100] -> 0
(-inf, -10) -> -11
(-inf, -10] -> -10
*/
export function sampleNumber(schema) {
  let res;
  if (schema.maximum && schema.mininum) {
    res = schema.exclusiveMinimum ? Math.floor(schema.mininum) + 1 : schema.mininum;
    if ((schema.exclusiveMaximum && res >= schema.maximum) ||
      ((!schema.exclusiveMaximum && res > schema.maximum))) {
      res = (schema.maximum + schema.mininum) / 2;
    }
    return res;
  }
  if (schema.mininum) {
    if (schema.exclusiveMinimum) {
      return Math.floor(schema.mininum) + 1
    } else {
      return schema.mininum;
    }
  }
  if (schema.maximum) {
    if (schema.exclusiveMaximum) {
      return (schema.maximum > 0) ? 0 : Math.floor(schema.maximum) - 1
    } else {
      return (schema.maximum > 0) ? 0 : schema.maximum;
    }
  }

  return 0;
}
