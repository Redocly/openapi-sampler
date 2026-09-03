import { sampleNumber } from '../../src/samplers/number.js';

describe('sampleNumber', () => {
  let res;

  it('should return 0 by default', () => {
    res = sampleNumber({});
    expect(res).toBe(0);
  });

  it('should return 0.1 for float type', () => {
    res = sampleNumber({type: 'number', format: 'float'});
    expect(res).toBe(0.1);
  });

  it('should return minimum if both minimum and maximum are specified', () => {
    res = sampleNumber({maximum: 10, minimum: 3});
    expect(res).toBe(3);
  });

  it('should return exclusiveMinimum + 1 if exclusiveMinimum is specified for draft v7', () => {
    res = sampleNumber({exclusiveMinimum: 3});
    expect(res).toBe(4);
  });

  it('should return exclusiveMaximum - 1 if exclusiveMaximum is specified for draft v7', () => {
    res = sampleNumber({exclusiveMaximum: -3});
    expect(res).toBe(-4);
  });

  // (2, 3) -> 2.5
  it('should return middle point if boundary integer is not possible for draft v7', () => {
    res = sampleNumber({exclusiveMinimum: 2, exclusiveMaximum: 3});
    expect(res).toBe(2.5);
  });

  // [2, 3] -> 2
  // (8, 13) -> 9
  it('should return closer to minimum possible int for draft v7', () => {
    res = sampleNumber({minimum: 2, maximum: 3});
    expect(res).toBe(2);
    res = sampleNumber({exclusiveMinimum: 8, exclusiveMaximum: 13});
    expect(res).toBe(9);
  });

  it('should return a value above exclusiveMinimum of 0 for draft v7', () => {
    res = sampleNumber({exclusiveMinimum: 0});
    expect(res).toBe(1);
  });

  it('should return a value below exclusiveMaximum of 0 for draft v7', () => {
    res = sampleNumber({exclusiveMaximum: 0});
    expect(res).toBe(-1);
  });

  it('should return middle point if exclusiveMinimum is 0 and boundary integer is not possible for draft v7', () => {
    res = sampleNumber({exclusiveMinimum: 0, exclusiveMaximum: 1});
    expect(res).toBe(0.5);
  });

  it('should return minimum of 0 if both minimum and maximum are specified', () => {
    res = sampleNumber({minimum: 0, maximum: 10});
    expect(res).toBe(0);
  });

  it('should respect minimum of 0 for float type', () => {
    res = sampleNumber({type: 'number', format: 'float', minimum: 0});
    expect(res).toBe(0);
  });

  it('should respect maximum of 0 for float type', () => {
    res = sampleNumber({type: 'number', format: 'float', maximum: 0});
    expect(res).toBe(0);
  });

  it('should return minimum + 1 if minimum is 0 and exclusiveMinimum is true for draft v4', () => {
    res = sampleNumber({minimum: 0, exclusiveMinimum: true});
    expect(res).toBe(1);
  });

  it('should return maximum - 1 if maximum is 0 and exclusiveMaximum is true for draft v4', () => {
    res = sampleNumber({maximum: 0, exclusiveMaximum: true});
    expect(res).toBe(-1);
  });

  it('should exclude minimum of 0 if maximum is also specified for draft v4', () => {
    res = sampleNumber({minimum: 0, maximum: 10, exclusiveMinimum: true});
    expect(res).toBe(1);
  });

  it('should ignore boundaries that are not finite numbers', () => {
    expect(sampleNumber({exclusiveMinimum: null})).toBe(0);
    expect(sampleNumber({minimum: null})).toBe(0);
    expect(sampleNumber({exclusiveMinimum: NaN})).toBe(0);
  });
});
