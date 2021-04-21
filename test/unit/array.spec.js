import { sampleArray } from '../../src/samplers/array.js';

describe('sampleArray', () => {
  var res;

  it('should return empty array by default', () => {
    res = sampleArray({});
    expect(res).to.deep.equal([]);
  });

  it('should return elements of correct type', () => {
    res = sampleArray({items: {type: 'number'}});
    expect(res).to.deep.equal([0]);
    res = sampleArray({contains: {type: 'number'}});
    expect(res).to.deep.equal([0]);
  });

  it('should return correct number of elements based on maxItems', () => {
    res = sampleArray({items: {type: 'number'}, maxItems: 0});
    expect(res).to.deep.equal([]);
  });

  it('should return correct number of elements based on minItems', () => {
    res = sampleArray({items: {type: 'number'}, minItems: 3});
    expect(res).to.deep.equal([0, 0, 0]);
  });

  it('should correctly sample tuples', () => {
    res = sampleArray({items: [{type: 'number'}, {type: 'string'}, {}]});
    expect(res).to.deep.equal([0, 'string', null]);
  });
});
