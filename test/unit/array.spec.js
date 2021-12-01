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

  describe('disableNonRequiredAutoGen', () => {

    it('should return null if omissible=true and primitive type item has no example', () => {
      res = sampleArray({ items: { type: 'string' } }, { omissible: true, disableNonRequiredAutoGen: true });
      expect(res).to.be.null;
    });

    it('should return null if omssible=true and object type item has no example', () => {
      res = sampleArray({
        items: {
          type: 'object',
          properties: {
            a: { type: 'string' },
          },
        }
      }, { omissible: true, disableNonRequiredAutoGen: true });
      expect(res).to.be.null;
    });

    it('should return valid array samples if omissible=false and primitive type item has no example', () => {
      // the sample must be valid to schema and show the array item type when the array is not omitted
      res = sampleArray({ items: { type: 'string' }, minItems: 2 }, { disableNonRequiredAutoGen: true });
      expect(res).to.deep.equal(['string', 'string']);
    });

    it('should return array of empty object if omssible=false and object type item has no example', () => {
      // the sample must be valid to schema and show the array item type when the array is not omitted
      res = sampleArray({
        items: {
          type: 'object',
          properties: {
            a: { type: 'string' },
          },
        }
      }, { disableNonRequiredAutoGen: true });
      expect(res).to.deep.equal([{}]);
    });

  });

});
