import { sample } from '../src/openapi-sampler.js';

describe('Integration', () => {
  let schema;
  let result;
  let expected;

  describe('Primitives', () => {
    it('should sample string', () => {
      schema = {
        'type': 'string'
      };
      result = sample(schema);
      expected = 'string';
      expect(result).toEqual(expected);
    });

    it('should sample number', () => {
      schema = {
        'type': 'number'
      };
      result = sample(schema);
      expected = 0;
      expect(result).toEqual(expected);
    });

    it('should sample number with format float', () => {
      schema = {
        'type': 'number',
        format: 'float'
      };
      result = sample(schema);
      expected = 0.1;
      expect(result).toEqual(expected);
    });

    it('should sample number with format double', () => {
      schema = {
        'type': 'number',
        format: 'double'
      };
      result = sample(schema);
      expected = 0.1;
      expect(result).toEqual(expected);
    });

    it('should sample boolean', () => {
      schema = {
        'type': 'boolean'
      };
      result = sample(schema);
      expected = true;
      expect(result).toEqual(expected);
    });

    it('should use default property', () => {
      schema = {
        'type': 'number',
        'default': 100
      };
      result = sample(schema);
      expected = 100;
      expect(result).toEqual(expected);
    });

    it('should support type array', () => {
      schema = {
        'type': ['string', 'number']
      };
      result = sample(schema);
      expected = 'string';
      expect(result).toEqual(expected);
    });

    it('should use null for null', () => {
      schema = {
        type: 'null'
      };
      result = sample(schema);
      expected = null;
      expect(result).toEqual(expected);
    });

    it('should use null if type is not specified', () => {
      schema = {
      };
      result = sample(schema);
      expected = null;
      expect(result).toEqual(expected);
    });

    it('should use null if type array is empty', () => {
      schema = {
        type: []
      };
      result = sample(schema);
      expected = null;
      expect(result).toEqual(expected);
    });
  });

  describe('Objects', () => {
    it('should sample object without properties', () => {
      schema = {
        'type': 'object'
      };
      result = sample(schema);
      expected = {};
      expect(result).toEqual(expected);
    });

    it('should sample object with property', () => {
      schema = {
        'type': 'object',
        'properties': {
          'title': {
            'type': 'string',
          }
        }
      };
      result = sample(schema);
      expected = {
        'title': 'string'
      };
      expect(result).toEqual(expected);
    });

    it('should sample object with property with default value', () => {
      schema = {
        'type': 'object',
        'properties': {
          'title': {
            'type': 'string',
            'default': 'Example'
          }
        }
      };
      result = sample(schema);
      expected = {
        'title': 'Example'
      };
      expect(result).toEqual(expected);
    });

    it('should sample object with more than one property', () => {
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
      result = sample(schema);
      expected = {
        'title': 'Example',
        'amount': 10
      };
      expect(result).toEqual(expected);
    });

    it('should sample both properties and additionalProperties', () => {
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
      result = sample(schema);
      expected = {
        test: 'string',
        property1: 0,
        property2: 0
      };
      expect(result).toEqual(expected);
    });
  });

  describe('Arrays', () => {
    it('should sample array', () => {
      schema = {
        'type': 'array',
        'items': {
          'type': 'number'
        }
      };
      result = sample(schema);
      expected = [0];
      expect(result).toEqual(expected);
    });

    it('should sample array with examples', () => {
      schema = {
        'type': 'array',
        'items': {
          'type': 'number'
        },
        'examples': [[1, 2, 3]]
      };
      result = sample(schema);
      expected = [1, 2, 3];
      expect(result).toEqual(expected);
    });

    it('should use default property', () => {
      schema = {
        'type': 'array',
        'items': {
          'type': 'number'
        },
        'default': [5, 6, 7]
      };
      result = sample(schema);
      expected = [5, 6, 7];
      expect(result).toEqual(expected);
    });

    it('should sample array with minItems', () => {
      schema = {
        'type': 'array',
        'items': {
          'type': 'number'
        },
        'minItems': 3
      };
      result = sample(schema);
      expected = [0, 0, 0];
      expect(result).toEqual(expected);
    });
  });

  describe('AllOf', () => {
    it('should sample schema with allOf', () => {
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
      result = sample(schema);
      expected = {
        'title': 'string',
        'amount': 1
      };
      expect(result).toEqual(expected);
    });

    it('should not throw for schemas with allOf with different types', () => {
      schema = {
        'allOf': [
          {
            'type': 'string'
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
      result = sample(schema);
      expected = {
        'amount': 1
      };
      expect(result).toEqual(expected);
    });

    it('deep array', () => {
      schema = {
        'allOf': [
          {
            'type': 'object',
            'properties': {
              'arr': {
                'type': 'array',
                'items': {
                  'type': 'object',
                }
              }
            }
          },
          {
            'type': 'object',
            'properties': {
              'arr': {
                'type': 'array',
                'items': {
                  'type': 'object',
                  'properties': {
                    'name': {
                      'type': 'string'
                    }
                  }
                }
              }
            }
          },
        ]
      };

      expected = {
        arr: [
          {
            name: 'string'
          }
        ]
      };
      const result = sample(schema);
      expect(result).toEqual(expected);
    });

    it('should not be confused by subschema without type', () => {
      schema = {
        'type': 'string',
        'allOf': [
          {
            'description': 'test'
          }
        ]
      };
      result = sample(schema);
      expected = 'string';
      expect(result).toEqual(expected);
    });

    it('should not throw for array allOf', () => {
      schema = {
        'type': 'array',
        'allOf': [
          {
            'type': 'array',
            'items': {
              'type': 'string'
            }
          }
        ]
      };
      result = sample(schema);
      expect(result).toBeInstanceOf(Array);
    });

    it('should sample schema with allOf even if some type is not specified', () => {
      schema = {
        'properties': {
          'title': {
            'type': 'string'
          }
        },
        'allOf': [
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
      result = sample(schema);
      expected = {
        'title': 'string',
        'amount': 1
      };
      expect(result).toEqual(expected);

      schema = {
        'type': 'object',
        'properties': {
          'title': {
            'type': 'string'
          }
        },
        'allOf': [
          {
            'properties': {
              'amount': {
                'type': 'number',
                'default': 1
              }
            }
          }
        ]
      };
      result = sample(schema);
      expected = {
        'title': 'string',
        'amount': 1
      };
      expect(result).toEqual(expected);
    });

    it('should merge deep properties', () => {
      schema = {
        'type': 'object',
        'allOf': [
          {
            'type': 'object',
            'properties': {
              'parent': {
                'type': 'object',
                'properties': {
                  'child1': {
                    'type': 'string'
                  }
                }
              }
            }
          },
          {
            'type': 'object',
            'properties': {
              'parent': {
                'type': 'object',
                'properties': {
                  'child2': {
                    'type': 'number'
                  }
                }
              }
            }
          }
        ]
      };

      expected = {
        parent: {
          child1: 'string',
          child2: 0
        }
      };

      result = sample(schema);

      expect(result).toEqual(expected);
    });
  });

  describe('Inheritance', () => {
    it('should support basic allOf', () => {
      schema = {
        'allOf': [
          {
            'type': 'object',
            'properties': {
              'test': {
                'type': 'string'
              }
            }
          }
        ]
      };
      result = sample(schema);
      expected = {
        'test': 'string'
      };
      expect(result).toEqual(expected);
    });

    it('should merge properties in allOf', () => {
      schema = {
        'allOf': [
          {
            'type': 'object',
            'properties': {
              'test1': {
                'type': 'string'
              }
            }
          },
          {
            'type': 'object',
            'properties': {
              'test2': {
                'type': 'number'
              }
            }
          }
        ]
      };
      result = sample(schema);
      expected = {
        'test1': 'string',
        'test2': 0
      };
      expect(result).toEqual(expected);
    });
  });

  describe('Example', () => {
    it('should use example', () => {
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
      result = sample(schema);
      expected = obj;
      expect(result).toEqual(obj);
    });

    it('should use falsy example', () => {
      schema = {
        type: 'string',
        example: false
      };
      result = sample(schema);
      expected = false;
      expect(result).toEqual(expected);
    });

    it('should use enum', () => {
      schema = {
        type: 'string',
        enum: ['test1', 'test2']
      };
      result = sample(schema);
      expected = 'test1';
      expect(result).toEqual(expected);
    });
  });

  describe('Detection', () => {
    it('should detect autodetect types based on props', () => {
      schema = {
        properties: {
          a: {
            minimum: 10
          },
          b: {
            minLength: 1
          }
        }
      };
      result = sample(schema);
      expected = {
        a: 10,
        b: 'string'
      };
      expect(result).toEqual(expected);
    });
  });

  describe('Compound keywords', () => {
    it('should support basic if/then/else usage', () => {
      schema = {
        type: 'object',
        properties: {top: {type: 'number'}},
        if: {properties: {foo: {type: 'string', format: 'email'}}},
        then: {properties: {bar: {type: 'string'}}},
        else: {properties: {baz: {type: 'number'}}},
      };

      result = sample(schema);
      expected = {
        foo: 'user@example.com',
        bar: 'string',
        top: 0,
      };
      expect(result).toEqual(expected);
    })

    describe('oneOf and anyOf', () => {
      it('should support oneOf', () => {
        schema = {
          oneOf: [
            {
              type: 'string'
            },
            {
              type: 'number'
            }
          ]
        };
        result = sample(schema);
        expected = 'string';
        expect(result).toEqual(expected);
      });

      it('should support anyOf', () => {
        schema = {
          anyOf: [
            {
              type: 'string'
            },
            {
              type: 'number'
            }
          ]
        };
        result = sample(schema);
        expected = 'string';
        expect(result).toEqual(expected);
      });

      it('should prefer oneOf if anyOf and oneOf are on the same level', () => {
        schema = {
          anyOf: [
            {
              type: 'string'
            }
          ],
          oneOf: [
            {
              type: 'number'
            }
          ]
        };
        result = sample(schema);
        expected = 0;
        expect(result).toEqual(expected);
      });

      it('should work with nested circular oneOf', () => {
        result = sample({ $ref: '#/definitions/A' }, {}, {
          definitions: {
            A: {
              properties: {
                a: { type: 'string' }
              },
              oneOf: [
                { $ref: '#/definitions/A' }
              ]
            }
          }
        });
        expected = { a: 'string' }
        expect(result).toEqual(expected);
      });

      it('should work with nested circular anyOf', () => {
        result = sample({ $ref: '#/definitions/A' }, {}, {
          definitions: {
            A: {
              properties: {
                a: { type: 'string' }
              },
              anyOf: [
                { $ref: '#/definitions/A' }
              ]
            }
          }
        });
        expected = { a: 'string' }
        expect(result).toEqual(expected);
      });
    });

    describe('inferring type from root schema', () => {
      const basicSchema = {
        oneOf: [
          {
            type: 'string'
          },
          {
            type: 'number'
          }
        ],
        anyOf: [
          {
            type: 'string'
          },
          {
            type: 'number'
          }
        ],
        allOf: [
          {
            type: 'object',
            properties: {
              title: {
                type: 'string'
              }
            }
          },
          {
            type: 'object',
            properties: {
              amount: {
                type: 'number',
                default: 1
              }
            }
          }
        ],
        if: {properties: {foo: {type: 'string', format: 'email'}}},
        then: {properties: {bar: {type: 'string'}}},
        else: {properties: {baz: {type: 'number'}}},
      };

      it('should infer example from root schema which has defined const keyword', () => {
        schema = {
          ...basicSchema,
          const: 'foobar'
        };
        result = sample(schema);
        expected = 'foobar';
        expect(result).toEqual(expected);
      });

      it('should infer example from root schema which has defined examples keyword', () => {
        schema = {
          ...basicSchema,
          examples: ['foobar']
        };
        result = sample(schema);
        expected = 'foobar';
        expect(result).toEqual(expected);
      });

      it('should infer example from root schema which has defined default keyword', () => {
        schema = {
          ...basicSchema,
          default: 'foobar'
        };
        result = sample(schema);
        expected = 'foobar';
        expect(result).toEqual(expected);
      });

      it('should infer example from root schema which has defined enum keyword', () => {
        schema = {
          ...basicSchema,
          enum: ['foobar']
        };
        result = sample(schema);
        expected = 'foobar';
        expect(result).toEqual(expected);
      });

      it('should infer example from root schema which has defined const and examples keyword (const has higher priority)', () => {
        schema = {
          ...basicSchema,
          const: 'foobar',
          examples: ['barfoo']
        };
        result = sample(schema);
        expected = 'foobar';
        expect(result).toEqual(expected);
      });

      it('should infer example from root schema which has defined examples and enum keyword (examples have higher priority)', () => {
        schema = {
          ...basicSchema,
          enum: ['barfoo'],
          examples: ['foobar']
        };
        result = sample(schema);
        expected = 'foobar';
        expect(result).toEqual(expected);
      });

      it('should infer example from root schema which has defined enum and default keyword (enum have higher priority)', () => {
        schema = {
          ...basicSchema,
          default: 'barfoo',
          enum: ['foobar']
        };
        result = sample(schema);
        expected = 'foobar';
        expect(result).toEqual(expected);
      });

    });
  });

  describe('$ref', () => {
    it('should follow $ref', () => {
      schema = {
        $ref: '#/definitions/Pet'
      };
      const spec = {
        definitions: {
          Pet: {
            type: 'object',
            properties: {
              name: {
                type: 'string'
              }
            }
          }
        }
      };
      result = sample(schema, {}, spec);
      expected = {
        name: 'string'
      };
      expect(result).toEqual(expected);
    });
  });

  describe('discriminator', () => {
    it('should support discriminator', () => {
      schema = {
        oneOf: [
          {
            type: 'object',
            required: ['pet_type'],
            properties: {
              pet_type: {
                type: 'string',
                enum: ['Cat']
              },
              name: {
                type: 'string'
              },
              huntingSkill: {
                type: 'string'
              }
            }
          },
          {
            type: 'object',
            required: ['pet_type'],
            properties: {
              pet_type: {
                type: 'string',
                enum: ['Dog']
              },
              name: {
                type: 'string'
              },
              packSize: {
                type: 'number'
              }
            }
          }
        ],
        discriminator: {
          propertyName: 'pet_type'
        }
      };
      result = sample(schema);
      expected = {
        pet_type: 'Cat',
        name: 'string',
        huntingSkill: 'string'
      };
      expect(result).toEqual(expected);
    });
  });
});
