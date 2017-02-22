'use strict';

describe('Integration', function() {
  var schema;
  var result;
  var expected;

  describe('Primitives', function() {

    it('should sample string', function() {
      schema = {
        'type': 'string'
      };
      result = OpenAPISampler.sample(schema);
      expected = 'string';
      expect(result).to.deep.equal(expected);
    });

    it('should sample number', function() {
      schema = {
        'type': 'number'
      };
      result = OpenAPISampler.sample(schema);
      expected = 0;
      expect(result).to.deep.equal(expected);
    });

    it('should sample boolean', function() {
      schema = {
        'type': 'boolean'
      };
      result = OpenAPISampler.sample(schema);
      expected = true;
      expect(result).to.deep.equal(expected);
    });

    it('should use default property', function() {
      schema = {
        'type': 'number',
        'default': 100
      };
      result = OpenAPISampler.sample(schema);
      expected = 100;
      expect(result).to.deep.equal(expected);
    });

    it('should use null if type is not specified', function() {
      schema = {
      };
      result = OpenAPISampler.sample(schema);
      expected = null;
      expect(result).to.deep.equal(expected);
    });
  });

  describe('Objects', function() {
    it('should sample object without properties', function() {
      schema = {
        'type': 'object'
      };
      result = OpenAPISampler.sample(schema);
      expected = {};
      expect(result).to.deep.equal(expected);
    });

    it('should sample object with property', function() {
      schema = {
        'type': 'object',
        'properties': {
          'title': {
            'type': 'string',
          }
        }
      };
      result = OpenAPISampler.sample(schema);
      expected = {
        'title': 'string'
      };
      expect(result).to.deep.equal(expected);
    });

    it('should sample object with property with default value', function() {
      schema = {
        'type': 'object',
        'properties': {
          'title': {
            'type': 'string',
            'default': 'Example'
          }
        }
      };
      result = OpenAPISampler.sample(schema);
      expected = {
        'title': 'Example'
      };
      expect(result).to.deep.equal(expected);
    });

    it('should sample object with more than one property', function() {
      schema = {
        'type': 'object',
        'properties': {
          'title': {
            'type': 'string',
            'default': 'Example'
          },
          'amount': {
            'type': 'number',
            'default': 10
          }
        }
      };
      result = OpenAPISampler.sample(schema);
      expected = {
        'title': 'Example',
        'amount': 10
      };
      expect(result).to.deep.equal(expected);
    });

    it('should sample both properties and additionalProperties', function() {
      schema = {
        type: 'object',
        properties: {
          test: {
            type: 'string'
          }
        },
        additionalProperties: {
          type: 'number'
        }
      };
      result = OpenAPISampler.sample(schema);
      expected = {
        test: 'string',
        property1: 0,
        property2: 0
      };
      expect(result).to.deep.equal(expected);
    });
  });

  describe('AllOf', function() {
    it('should sample schema with allOf', function() {
      schema = {
        'allOf': [
          {
            'type': 'object',
            'properties': {
              'title': {
                'type': 'string'
              }
            }
          },
          {
            'type': 'object',
            'properties': {
              'amount': {
                'type': 'number',
                'default': 1
              }
            }
          }
        ]
      };
      result = OpenAPISampler.sample(schema);
      expected = {
        'title': 'string',
        'amount': 1
      };
      expect(result).to.deep.equal(expected);
    });
  });

  describe('Example', function() {
    it('should use example', function() {
      var obj = {
        test: 'test',
        properties: {
          test: {
            type: 'string'
          }
        }
      };
      schema = {
        type: 'object',
        example: obj
      };
      result = OpenAPISampler.sample(schema);
      expected = obj;
      expect(result).to.deep.equal(obj);
    });

    it('should use falsy example', function() {
      schema = {
        type: 'string',
        example: false
      };
      result = OpenAPISampler.sample(schema);
      expected = false;
      expect(result).to.deep.equal(expected);
    });

    it('should use enum', function() {
      schema = {
        type: 'string',
        enum: ['test1', 'test2']
      };
      result = OpenAPISampler.sample(schema);
      expected = 'test1';
      expect(result).to.equal(expected);
    });
  });
});
