import { sampleNumber } from '../../src/samplers/number.js';

describe('sampleNumber', () => {
  let res;
  it('should return 0 by default', () => {
    res = sampleNumber({});
    expect(res).to.equal(0);
  });

  it('should return 0 by default', () => {
    res = sampleNumber({});
    expect(res).to.equal(0);
  });

  it('should return minimum if minimum is specified', () => {
    res = sampleNumber({minimum: 3});
    expect(res).to.equal(3);
  });

  it('should return minimum +1 for exclusiveMinimum', () => {
    res = sampleNumber({minimum: 3, exclusiveMinimum: true});
    expect(res).to.equal(4);
  });

  it('should return minimum +1 for exclusiveMinimum', () => {
    res = sampleNumber({minimum: 3, exclusiveMinimum: true});
    expect(res).to.equal(4);
  });

  it('should return maximum if maximum is negative', () => {
    res = sampleNumber({maximum: -3});
    expect(res).to.equal(-3);
  });

  it('should return maximum -1 if maximum is negative and exclusiveMaximum', () => {
    res = sampleNumber({maximum: -3, exclusiveMaximum: true});
    expect(res).to.equal(-4);
  });

  it('should return maximum -1 if maximum is negative and exclusiveMaximum', () => {
    res = sampleNumber({maximum: -3, exclusiveMaximum: true, minimum: 1, exclusiveMinimum: true});
    expect(res).to.equal(-1);
  });

  it('should return minimum if both minimum and maximum are specified', () => {
    res = sampleNumber({maximum: 10, minimum: 3});
    expect(res).to.equal(3);
  });

  it('should return exclusiveMinimum + 1 if exclusiveMinimum is specified for openapi3.1', () => {
    res = sampleNumber({exclusiveMinimum: 3});
    expect(res).to.equal(4);
  });

  it('should return exclusiveMaximum - 1 if exclusiveMaximum is specified for openapi3.1', () => {
    res = sampleNumber({exclusiveMaximum: -3});
    expect(res).to.equal(-4);
  });

    // (2, 3) -> 2.5
    it('should return middle point if boundary integer is not possible for openapi3.1', () => {
      res = sampleNumber({exclusiveMinimum: 2, exclusiveMaximum: 3});
      expect(res).to.equal(2.5);
    });
  
    // [2, 3] -> 2
    // (8, 13) -> 9
    it('should return closer to minimum possible int for openapi3.1', () => {
      res = sampleNumber({minimum: 2, maximum: 3});
      expect(res).to.equal(2);
      res = sampleNumber({exclusiveMinimum: 8, exclusiveMaximum: 13});
      expect(res).to.equal(9);
    });

    it('should return closer to minimum possible int for openapi3.1', () => {
      res = sampleNumber({minimum: 2, maximum: 3});
      expect(res).to.equal(2);
      res = sampleNumber({exclusiveMinimum: 8, exclusiveMaximum: 13});
      expect(res).to.equal(9);
    });

});
