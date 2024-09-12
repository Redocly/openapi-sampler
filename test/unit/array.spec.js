import { sampleArray } from '../../src/samplers/array.js';

describe('sampleArray', () => {
  let res;

  it('should return empty array by default', () => {
    res = sampleArray({});
    expect(res).toEqual([]);
  });

  it('should return elements of correct type', () => {
    res = sampleArray({items: {type: 'number'}});
    expect(res).toEqual([0]);
    res = sampleArray({contains: {type: 'number'}});
    expect(res).toEqual([0]);
  });

  it('should return correct number of elements based on maxItems', () => {
    res = sampleArray({items: {type: 'number'}, maxItems: 0});
    expect(res).toEqual([]);
  });

  it('should return correct number of elements based on minItems', () => {
    res = sampleArray({items: {type: 'number'}, minItems: 3});
    expect(res).toEqual([0, 0, 0]);
  });

  it('should correctly sample tuples', () => {
    res = sampleArray({items: [{type: 'number'}, {type: 'string'}, {}]});
    expect(res).toEqual([0, 'string', null]);
  });

  it('should correctly sample tuples for 3.1', () => {
    res = sampleArray({prefixItems: [{type: 'number'}, {type: 'string'}, {}]});
    expect(res).toEqual([0, 'string', null]);
  });
});
