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


    it('should repsect readOnly from schemas in allOf', () => {
      const schema = {
        allOf: [
          {
            type: 'object',
            properties: {
              a: { type: 'string' },
              b: { type: 'integer' },
            },
          },
          {
            properties: {
              b: { readOnly: true },
            },
          }
        ],
      };
      const result = sample(schema, { skipReadOnly: true });
      expect(result).toEqual({
        a: 'string',
      });
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
        properties: { top: { type: 'number' } },
        if: { properties: { foo: { type: 'string', format: 'email' } } },
        then: { properties: { bar: { type: 'string' } } },
        else: { properties: { baz: { type: 'number' } } },
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
        if: { properties: { foo: { type: 'string', format: 'email' } } },
        then: { properties: { bar: { type: 'string' } } },
        else: { properties: { baz: { type: 'number' } } },
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

  describe('xml', () => {
    const options = {
      format: 'xml',
    };

    it('should build XML for an array with nested array', () => {
      const schema = {
        type: 'object',
        properties: {
          name: {
            type: 'array',
            items: {
              type: 'string',
              example: ['John', 'Smith'],
            }
          }
        }
      };
      const result = sample(schema, options, {});

      expect(result.trim()).toMatchInlineSnapshot(`
"<name>
  <0>John</0>
  <1>Smith</1>
</name>"
`);
    });

    it('should build XML for an array with wrapped elements without examples', () => {
      const schema = {
        type: 'object',
        properties: {
          books: {
            type: 'array',
            items: { type: 'string', xml: { name: 'book' } },
            xml: { wrapped: true, name: 'booksLibrary' },
          },
        },
      };
      const result = sample(schema, options, {});

      expect(result.trim()).toMatchInlineSnapshot(`
  "<booksLibrary>
    <book>string</book>
  </booksLibrary>"
  `);
    });

    it('should build XML for an array with unwrapped elements without examples', () => {
      const schema = {
        type: 'object',
        properties: {
          books: {
            type: 'array',
            items: { type: 'string', xml: { name: 'book' } },
            xml: { wrapped: false },
          },
        },
      };

      const result = sample(schema, options, {});

      expect(result.trim()).toMatchInlineSnapshot('"<book>string</book>"');
    });

    it('should build XML for an array with wrapped parent name and undefined item name', () => {
      const schema = {
        type: 'object',
        properties: {
          books: {
            type: 'array',
            items: { type: 'string' },
            xml: { wrapped: true, name: 'booksLibrary' },
            example: ['test1', 'test2'],
          },
        },
      };

      const result = sample(schema, options, {});

      expect(result.trim()).toMatchInlineSnapshot(`
  "<booksLibrary>
    <booksLibrary>test1</booksLibrary>
    <booksLibrary>test2</booksLibrary>
  </booksLibrary>"
  `);
    });

    it('should build XML for an array with wrapped parent and defined item name', () => {
      const schema = {
        type: 'object',
        properties: {
          books: {
            type: 'array',
            items: { type: 'string', xml: { name: 'book' } },
            xml: { wrapped: true, name: 'booksLibrary' },
            example: ['test1', 'test2'],
          },
        },
      };

      const result = sample(schema, options, {});
      expect(result.trim()).toMatchInlineSnapshot(`
  "<booksLibrary>
    <booksLibrary>test1</booksLibrary>
    <booksLibrary>test2</booksLibrary>
  </booksLibrary>"
  `);
    });

    it('should build XML for an array with undefined parent and item names', () => {
      const schema = {
        type: 'object',
        properties: {
          books: {
            type: 'array',
            items: { type: 'string' },
            xml: { wrapped: true },
            example: ['test1', 'test2'],
          },
        },
      };

      const result = sample(schema, options, {});

      expect(result.trim()).toMatchInlineSnapshot(`
  "<books>
    <books>test1</books>
    <books>test2</books>
  </books>"
  `);
    });

    it('should build XML for an array with undefined parent name and defined item name', () => {
      const schema = {
        type: 'object',
        properties: {
          books: {
            type: 'array',
            items: { type: 'string', xml: { name: 'book' } },
            xml: { wrapped: true },
            example: ['test1', 'test2'],
          },
        },
      };

      const result = sample(schema, options, {});
      expect(result.trim()).toMatchInlineSnapshot(`
  "<books>
    <books>test1</books>
    <books>test2</books>
  </books>"
  `);
    });

    it('should build XML for an array with defined parent and undefined item names', () => {
      const schema = {
        type: 'object',
        properties: {
          books: {
            type: 'array',
            items: { type: 'string' },
            xml: { name: 'booksLibrary' }, // it is ignored because wrapped is false by default
            example: ['test1', 'test2'],
          },
        },
      };

      const result = sample(schema, options, {});

      expect(result).toMatchInlineSnapshot(`
  "<root>
    <0>test1</0>
    <1>test2</1>
  </root>
  "
  `);
    });

    it('should build XML for an array with defined parent and item names', () => {
      const schema = {
        type: 'object',
        properties: {
          books: {
            type: 'array',
            items: { type: 'string', xml: { name: 'book' } },
            xml: { name: 'booksLibrary' },
            example: ['test1', 'test2'],
          },
        },
      };

      const result = sample(schema, options, {});

      expect(result).toMatchInlineSnapshot(`
  "<book>test1</book>
  <book>test2</book>
  "
  `);
    });

    it('should build XML for an array with undefined parent and defined item names without wrapper', () => {
      const schema = {
        type: 'object',
        properties: {
          books: {
            type: 'array',
            items: { type: 'string', xml: { name: 'book' } },
            example: ['test1', 'test2'],
          },
        },
      };

      const result = sample(schema, options, {});

      expect(result).toMatchInlineSnapshot(`
  "<book>test1</book>
  <book>test2</book>
  "
  `);
    });

    it('should build XML for an array with correct item prefix logic', () => {
      const schema = {
        type: 'object',
        properties: {
          books: {
            type: 'array',
            items: { type: 'string', xml: { prefix: 'child' } },
            xml: {
              wrapped: true,
              name: 'booksLibrary',
              prefix: 'parent',
            },
          },
        },
      };
      const result = sample(schema, options, {});

      expect(result).toMatchInlineSnapshot(`
"<parent:booksLibrary>
  <child:books>string</child:books>
</parent:booksLibrary>
"
`);
    });

    it('should build XML for an nested object', () => {
      const schema = {
        type: 'object',
        properties: {
          location: {
            type: 'object',
            properties: {
              city: {
                type: 'string',
                xml: {
                  name: 'eventCity',
                  prefix: 'loc',
                },
                example: 'Atlantis',
              },
              index: {
                type: 'integer',
                xml: {
                  name: 'id',
                  prefix: 'index',
                },
                example: '123',
              },
              places: {
                type: 'array',
                items: {
                  type: 'string',
                  xml: {
                    name: 'eventPlaces',
                  },
                },
                example: ['place1', 'place2'],
              },
            },
            xml: {
              name: 'eventLocation',
              prefix: 'loc',
            },
          },
        },
      };

      const result = sample(schema, options, {});

      expect(result).toMatchInlineSnapshot(`
  "<loc:eventLocation>
    <loc:eventCity>Atlantis</loc:eventCity>
    <index:id>123</index:id>
    <eventPlaces>place1</eventPlaces>
    <eventPlaces>place2</eventPlaces>
  </loc:eventLocation>
  "
  `);
    });

    it('should build XML for an nested object without examples', () => {
      const schema = {
        type: 'object',
        properties: {
          location: {
            type: 'object',
            properties: {
              city: {
                type: 'string',
                xml: {
                  name: 'eventCity',
                  prefix: 'loc',
                },
              },
              index: {
                type: 'integer',
                xml: {
                  name: 'id',
                  prefix: 'index',
                },
              },
              places: {
                type: 'array',
                items: {
                  type: 'string',
                  xml: {
                    name: 'eventPlaces',
                  },
                },
              },
            },
            xml: {
              name: 'eventLocation',
              prefix: 'loc',
            },
          },
        },
      };

      const result = sample(schema, options, {});

      expect(result).toMatchInlineSnapshot(`
  "<loc:eventLocation>
    <loc:eventCity>string</loc:eventCity>
    <index:id>0</index:id>
    <eventPlaces>string</eventPlaces>
  </loc:eventLocation>
  "
  `);
    });

    it('should build XML for an nested object with namespace', () => {
      const schema = {
        type: 'object',
        properties: {
          location: {
            type: 'object',
            properties: {
              city: {
                type: 'string',
                xml: {
                  name: 'eventCity',
                  prefix: 'c',
                  namespace: 'http://example.com/city',
                },
                example: 'Atlantis',
              },
            },
            xml: {
              name: 'eventLocation',
              prefix: 'l',
              namespace: 'http://example.com/location',
            },
          },
        },
      };

      const result = sample(schema, options, {});

      expect(result).toMatchInlineSnapshot(`
  "<l:eventLocation xmlns:l="http://example.com/location">
    <c:eventCity xmlns:c="http://example.com/city">Atlantis</c:eventCity>
  </l:eventLocation>
  "
  `);
    });

    it('should build XML for an nested object when all properties are attributes', () => {
      const schema = {
        type: 'object',
        properties: {
          location: {
            type: 'object',
            properties: {
              coordinates: {
                type: 'object',
                properties: {
                  lat: {
                    type: 'number',
                    xml: {
                      name: 'latitude',
                      prefix: 'loc',
                      attribute: true,
                    },
                    example: 12.345,
                  },
                  long: {
                    type: 'number',
                    xml: {
                      attribute: true,
                      name: 'longitude',
                      prefix: 'loc',
                    },
                    example: 67.89,
                  },
                },
                xml: {
                  name: 'geoCoordinates',
                  prefix: 'geo',
                },
              },
            },
            xml: {
              name: 'eventLocation',
              prefix: 'loc',
            },
          },
        },
      };

      const result = sample(schema, options, {});

      expect(result).toMatchInlineSnapshot(`
  "<loc:eventLocation>
    <geo:geoCoordinates loc:latitude="12.345" loc:longitude="67.89"></geo:geoCoordinates>
  </loc:eventLocation>
  "
  `);
    });

    it('should build XML for an nested object when one of the property is attribute', () => {
      const schema = {
        type: 'object',
        properties: {
          location: {
            type: 'object',
            properties: {
              coordinates: {
                type: 'object',
                properties: {
                  lat: {
                    type: 'number',
                    xml: {
                      name: 'latitude',
                      prefix: 'loc',
                      attribute: true,
                    },
                    example: 12.345,
                  },
                  long: {
                    type: 'number',
                    xml: {
                      attribute: false,
                      name: 'longitude',
                      prefix: 'loc',
                    },
                    example: 67.89,
                  },
                },
                xml: {
                  name: 'geoCoordinates',
                  prefix: 'geo',
                },
              },
            },
            xml: {
              name: 'eventLocation',
              prefix: 'loc',
            },
          },
        },
      };

      const result = sample(schema, options, {});

      expect(result).toMatchInlineSnapshot(`
  "<loc:eventLocation>
    <geo:geoCoordinates loc:latitude="12.345">
      <loc:longitude>67.89</loc:longitude>
    </geo:geoCoordinates>
  </loc:eventLocation>
  "
  `);
    });
  });

  describe('xml document root', () => {
    const options = {
      format: 'xml',
    };

    it('should use the root schema xml.name as the root element when it has a single property', () => {
      const schema = {
        type: 'object',
        xml: { name: 'Thing' },
        properties: {
          foo: { type: 'string' },
        },
      };

      expect(sample(schema, options, {})).toMatchInlineSnapshot(`
"<Thing>
  <foo>string</foo>
</Thing>
"
`);
    });

    it('should apply the root schema xml.prefix and xml.namespace to the root element', () => {
      const schema = {
        type: 'object',
        xml: { name: 'Pet', prefix: 'p', namespace: 'http://example.com/ns' },
        properties: {
          a: { type: 'string' },
          b: { type: 'string' },
        },
      };

      expect(sample(schema, options, {})).toMatchInlineSnapshot(`
"<p:Pet xmlns:p="http://example.com/ns">
  <a>string</a>
  <b>string</b>
</p:Pet>
"
`);
    });

    it('should apply the root schema xml.namespace without a prefix', () => {
      const schema = {
        type: 'object',
        xml: { name: 'Pet', namespace: 'http://example.com/schema' },
        properties: {
          name: { type: 'string', example: 'Guru' },
          lang: { type: 'string', example: 'en', xml: { attribute: true } },
        },
      };

      expect(sample(schema, options, {})).toMatchInlineSnapshot(`
"<Pet lang="en" xmlns="http://example.com/schema">
  <name>Guru</name>
</Pet>
"
`);
    });

    it('should keep the existing root for a schema without xml.name', () => {
      const schema = {
        type: 'object',
        properties: {
          foo: { type: 'string' },
          bar: { type: 'string' },
        },
      };

      expect(sample(schema, options, {})).toMatchInlineSnapshot(`
"<root>
  <foo>string</foo>
  <bar>string</bar>
</root>
"
`);
    });

    it.each([
      ['integer', { type: 'integer' }, '<root>0</root>'],
      ['boolean', { type: 'boolean' }, '<root>true</root>'],
      ['empty string', { type: 'string', example: '' }, '<root></root>'],
      ['single-character string', { type: 'string', example: 'a' }, '<root>a</root>'],
      ['named string', { type: 'string', xml: { name: 'Message' } }, '<Message>string</Message>'],
    ])('should build XML for a root %s', (_label, schema, expected) => {
      expect(sample(schema, options, {}).trim()).toBe(expected);
    });

    it('should not split a root array of strings into characters', () => {
      const schema = {
        type: 'array',
        items: { type: 'string' },
      };

      expect(sample(schema, options, {})).toMatchInlineSnapshot(`
"<root>string</root>
"
`);
    });

    it('should name root array items after the array xml.name', () => {
      const schema = {
        type: 'array',
        minItems: 2,
        items: { type: 'string', example: 'tag' },
        xml: { name: 'Tags', wrapped: true },
      };

      expect(sample(schema, options, {})).toMatchInlineSnapshot(`
"<Tags>
  <Tags>tag</Tags>
  <Tags>tag</Tags>
</Tags>
"
`);
    });
  });

  describe('xml root arrays', () => {
    const options = {
      format: 'xml',
    };
    const spec = {
      components: {
        schemas: {
          Pet: {
            type: 'object',
            xml: { name: 'Animal', prefix: 'p', namespace: 'http://example.com/pet' },
            properties: { name: { type: 'string' } },
          },
        },
      },
    };

    it('should wrap a nullable root array once', () => {
      const schema = {
        type: ['array', 'null'],
        xml: { name: 'Pets', wrapped: true },
        items: { $ref: '#/components/schemas/Pet' },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<Pets>
  <p:Animal xmlns:p="http://example.com/pet">
    <name>string</name>
  </p:Animal>
</Pets>
"
`);
    });

    it('should treat a root schema with items but no type as an array', () => {
      const schema = {
        xml: { name: 'Tags' },
        items: { type: 'string' },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<Tags>string</Tags>
"
`);
    });

    it('should keep a single root element for several unnamed scalar items', () => {
      const schema = {
        type: 'array',
        minItems: 2,
        items: { type: 'string' },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<root>
  <root>string</root>
  <root>string</root>
</root>
"
`);
    });
  });

  describe('xml allOf', () => {
    const options = {
      format: 'xml',
    };
    const spec = {
      components: {
        schemas: {
          Base: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 7 },
            },
          },
          Tag: {
            type: 'object',
            xml: { name: 'Tag' },
            properties: {
              label: { type: 'string', example: 'cute' },
            },
          },
        },
      },
    };

    it('should merge a $ref into the root allOf instead of wrapping it', () => {
      const schema = {
        allOf: [
          { $ref: '#/components/schemas/Base' },
          { type: 'object', properties: { name: { type: 'string' } } },
        ],
        xml: { name: 'Merged' },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<Merged>
  <id>7</id>
  <name>string</name>
</Merged>
"
`);
    });

    it('should keep a composed allOf property in its own element', () => {
      const schema = {
        type: 'object',
        properties: {
          pet: {
            allOf: [
              { $ref: '#/components/schemas/Base' },
              { type: 'object', properties: { name: { type: 'string' } } },
            ],
          },
          owner: { type: 'string' },
        },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<root>
  <pet>
    <id>7</id>
    <name>string</name>
  </pet>
  <owner>string</owner>
</root>
"
`);
    });

    it('should keep an inline allOf property in its own element', () => {
      const schema = {
        type: 'object',
        properties: {
          pet: {
            allOf: [{ type: 'object', properties: { name: { type: 'string' } } }],
            xml: { name: 'Animal' },
          },
          owner: { type: 'string' },
        },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<root>
  <Animal>
    <name>string</name>
  </Animal>
  <owner>string</owner>
</root>
"
`);
    });

    it('should keep naming a property that wraps a single $ref in allOf after the referenced schema', () => {
      const schema = {
        type: 'object',
        properties: {
          tag: {
            allOf: [{ $ref: '#/components/schemas/Tag' }],
            description: 'A tag',
          },
          owner: { type: 'string' },
        },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<root>
  <Tag>
    <label>cute</label>
  </Tag>
  <owner>string</owner>
</root>
"
`);
    });
  });

  describe('xml annotated $ref and oneOf properties', () => {
    const options = {
      format: 'xml',
    };
    const spec = {
      components: {
        schemas: {
          Base: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 7 },
            },
          },
          Pet: {
            type: 'object',
            xml: { name: 'Animal', prefix: 'p', namespace: 'http://example.com/pet' },
            properties: { name: { type: 'string' } },
          },
          Account: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 7 },
              secret: { type: 'string', readOnly: true },
            },
          },
        },
      },
    };

    it('should name a root allOf of a $ref and an annotation like the $ref', () => {
      const schema = {
        allOf: [{ $ref: '#/components/schemas/Pet' }, { description: 'A pet' }],
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<p:Animal xmlns:p="http://example.com/pet">
  <name>string</name>
</p:Animal>
"
`);
    });

    it('should name an allOf property of a $ref and an annotation like the $ref', () => {
      const schema = {
        type: 'object',
        properties: {
          pet: { allOf: [{ $ref: '#/components/schemas/Pet' }, { nullable: true }] },
          owner: { type: 'string' },
        },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<root>
  <p:Animal xmlns:p="http://example.com/pet">
    <name>string</name>
  </p:Animal>
  <owner>string</owner>
</root>
"
`);
    });

    it('should skip readOnly properties of an allOf $ref without throwing', () => {
      const schema = {
        type: 'object',
        properties: {
          account: { allOf: [{ $ref: '#/components/schemas/Account' }] },
          owner: { type: 'string' },
        },
      };

      expect(sample(schema, { ...options, skipReadOnly: true }, spec)).toMatchInlineSnapshot(`
"<root>
  <account>
    <id>7</id>
  </account>
  <owner>string</owner>
</root>
"
`);
    });

    it('should keep a oneOf property whose variant is a composed allOf in its own element', () => {
      const schema = {
        type: 'object',
        properties: {
          pet: {
            oneOf: [
              {
                allOf: [
                  { $ref: '#/components/schemas/Base' },
                  { type: 'object', properties: { name: { type: 'string' } } },
                ],
              },
            ],
          },
          owner: { type: 'string' },
        },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<root>
  <pet>
    <id>7</id>
    <name>string</name>
  </pet>
  <owner>string</owner>
</root>
"
`);
    });

    it('should keep a oneOf property whose variant is an inline object in its own element', () => {
      const schema = {
        type: 'object',
        properties: {
          pet: { oneOf: [{ type: 'object', properties: { name: { type: 'string' } } }] },
          owner: { type: 'string' },
        },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<root>
  <pet>
    <name>string</name>
  </pet>
  <owner>string</owner>
</root>
"
`);
    });

    it('should keep a oneOf property whose variant is a scalar', () => {
      const schema = {
        type: 'object',
        properties: {
          code: { oneOf: [{ type: 'string' }, { type: 'integer' }] },
          owner: { type: 'string' },
        },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<root>
  <code>string</code>
  <owner>string</owner>
</root>
"
`);
    });

    it('should keep naming a oneOf property whose variant is a $ref after the referenced schema', () => {
      const schema = {
        type: 'object',
        properties: {
          pet: { oneOf: [{ $ref: '#/components/schemas/Pet' }] },
          owner: { type: 'string' },
        },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<root>
  <p:Animal xmlns:p="http://example.com/pet">
    <name>string</name>
  </p:Animal>
  <owner>string</owner>
</root>
"
`);
    });
  });

  describe('xml nodeType', () => {
    const options = {
      format: 'xml',
    };

    describe('nodeType: "attribute"', () => {
      it('should render property as XML attribute using nodeType: attribute', () => {
        const schema = {
          type: 'object',
          properties: {
            person: {
              type: 'object',
              properties: {
                id: {
                  type: 'integer',
                  xml: {
                    nodeType: 'attribute',
                  },
                  example: 123,
                },
                name: {
                  type: 'string',
                  example: 'Alice',
                },
              },
              xml: {
                name: 'person',
              },
            },
          },
        };
        const result = sample(schema, options, {});

        expect(result.trim()).toMatchInlineSnapshot(`
"<person id="123">
  <name>Alice</name>
</person>"
`);
      });

      it('should render nodeType: attribute with prefix and namespace (spec example: Person)', () => {
        const spec = {
          components: {
            schemas: {
              Person: {
                type: 'object',
                properties: {
                  id: {
                    type: 'integer',
                    format: 'int32',
                    xml: {
                      nodeType: 'attribute',
                    },
                    example: 123,
                  },
                  name: {
                    type: 'string',
                    xml: {
                      namespace: 'https://example.com/schema/sample',
                      prefix: 'sample',
                    },
                    example: 'example',
                  },
                },
              },
            },
          },
        };

        const schema = { $ref: '#/components/schemas/Person' };
        const result = sample(schema, options, spec);

        expect(result.trim()).toMatchInlineSnapshot(`
"<Person id="123">
  <sample:name xmlns:sample="https://example.com/schema/sample">example</sample:name>
</Person>"
`);
      });

      it('should produce identical output for nodeType: attribute and legacy attribute: true', () => {
        const schemaNodeType = {
          type: 'object',
          properties: {
            item: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  xml: { nodeType: 'attribute', name: 'itemId' },
                  example: 42,
                },
              },
              xml: { name: 'item' },
            },
          },
        };

        const schemaLegacy = {
          type: 'object',
          properties: {
            item: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  xml: { attribute: true, name: 'itemId' },
                  example: 42,
                },
              },
              xml: { name: 'item' },
            },
          },
        };

        const resultNodeType = sample(schemaNodeType, options, {});
        const resultLegacy = sample(schemaLegacy, options, {});
        expect(resultNodeType).toEqual(resultLegacy);
      });
    });

    describe('nodeType: "element"', () => {
      it('should render a basic element', () => {
        const schema = {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              xml: {
                nodeType: 'element',
                name: 'fullName',
              },
              example: 'Alice',
            },
          },
          xml: { name: 'person' },
        };
        const result = sample(schema, options, {});

        expect(result.trim()).toMatchInlineSnapshot(`
"<person>
  <fullName>Alice</fullName>
</person>"
`);
      });

      it('should wrap array when nodeType: element is set (spec example)', () => {
        const schema = {
          type: 'object',
          xml: { name: 'document' },
          properties: {
            animals: {
              type: 'array',
              xml: { nodeType: 'element' },
              items: {
                type: 'string',
                xml: { name: 'animal' },
              },
            },
          },
        };
        const result = sample(schema, options, {});

        expect(result.trim()).toMatchInlineSnapshot(`
"<document>
  <animals>
    <animal>string</animal>
  </animals>
</document>"
`);
      });

      it('should wrap array with nodeType: element and custom wrapper name', () => {
        const schema = {
          type: 'object',
          xml: { name: 'document' },
          properties: {
            animals: {
              type: 'array',
              xml: { name: 'aliens', nodeType: 'element' },
              items: {
                type: 'string',
                xml: { name: 'animal' },
              },
            },
          },
        };
        const result = sample(schema, options, {});

        expect(result.trim()).toMatchInlineSnapshot(`
"<document>
  <aliens>
    <animal>string</animal>
  </aliens>
</document>"
`);
      });

      it('should produce identical output for nodeType: element and legacy wrapped: true on arrays', () => {
        const schemaNodeType = {
          type: 'object',
          properties: {
            books: {
              type: 'array',
              items: { type: 'string', xml: { name: 'book' } },
              xml: { nodeType: 'element', name: 'booksLibrary' },
            },
          },
        };

        const schemaLegacy = {
          type: 'object',
          properties: {
            books: {
              type: 'array',
              items: { type: 'string', xml: { name: 'book' } },
              xml: { wrapped: true, name: 'booksLibrary' },
            },
          },
        };

        const resultNodeType = sample(schemaNodeType, options, {});
        const resultLegacy = sample(schemaLegacy, options, {});
        expect(resultNodeType).toEqual(resultLegacy);
      });
    });

    describe('nodeType: "text"', () => {
      it('should render property as text node inside an element', () => {
        const schema = {
          type: 'object',
          properties: {
            item: {
              type: 'object',
              properties: {
                kind: {
                  type: 'string',
                  xml: { nodeType: 'attribute' },
                  example: 'Cat',
                },
                name: {
                  type: 'string',
                  xml: { nodeType: 'text' },
                  example: 'Fluffy',
                },
              },
              xml: { name: 'animal' },
            },
          },
        };
        const result = sample(schema, options, {});

        expect(result.trim()).toMatchInlineSnapshot('"<animal kind="Cat">Fluffy</animal>"');
      });

      it('should ignore xml.name for nodeType: text', () => {
        const schema = {
          type: 'object',
          properties: {
            wrapper: {
              type: 'object',
              properties: {
                content: {
                  type: 'string',
                  xml: { nodeType: 'text', name: 'ignoredName' },
                  example: 'Hello world',
                },
              },
              xml: { name: 'greeting' },
            },
          },
        };
        const result = sample(schema, options, {});

        expect(result.trim()).toMatchInlineSnapshot('"<greeting>Hello world</greeting>"');
      });
    });

    describe('nodeType: "cdata"', () => {
      it('should render property as CDATA section', () => {
        const schema = {
          type: 'object',
          properties: {
            item: {
              type: 'object',
              properties: {
                content: {
                  type: 'string',
                  xml: { nodeType: 'cdata' },
                  example: '<html>bold</html>',
                },
              },
              xml: { name: 'note' },
            },
          },
        };
        const result = sample(schema, options, {});

        expect(result.trim()).toMatchInlineSnapshot(`
"<note>
  <![CDATA[<html>bold</html>]]>
</note>"
`);
      });

      it('should ignore xml.name for nodeType: cdata', () => {
        const schema = {
          type: 'object',
          properties: {
            item: {
              type: 'object',
              properties: {
                body: {
                  type: 'string',
                  xml: { nodeType: 'cdata', name: 'shouldBeIgnored' },
                  example: 'raw content',
                },
              },
              xml: { name: 'message' },
            },
          },
        };
        const result = sample(schema, options, {});

        expect(result.trim()).toMatchInlineSnapshot(`
"<message>
  <![CDATA[raw content]]>
</message>"
`);
      });

      it('should render element with attribute and CDATA content', () => {
        const schema = {
          type: 'object',
          properties: {
            item: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  xml: { nodeType: 'attribute' },
                  example: 'html',
                },
                body: {
                  type: 'string',
                  xml: { nodeType: 'cdata' },
                  example: '<p>Hello</p>',
                },
              },
              xml: { name: 'content' },
            },
          },
        };
        const result = sample(schema, options, {});

        expect(result.trim()).toMatchInlineSnapshot(`
"<content type="html">
  <![CDATA[<p>Hello</p>]]>
</content>"
`);
      });
    });

    describe('nodeType: "none"', () => {
      it('should default to none for arrays (items inline under parent)', () => {
        const schema = {
          type: 'object',
          xml: { name: 'document' },
          properties: {
            animals: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        };
        const result = sample(schema, options, {});

        expect(result.trim()).toMatchInlineSnapshot(`
"<document>
  <animals>string</animals>
</document>"
`);
      });

      it('should allow explicit nodeType: none on an array', () => {
        const schema = {
          type: 'object',
          xml: { name: 'document' },
          properties: {
            animals: {
              type: 'array',
              xml: { nodeType: 'none', name: 'aliens' },
              items: {
                type: 'string',
                xml: { name: 'animal' },
              },
            },
          },
        };
        const result = sample(schema, options, {});

        expect(result.trim()).toMatchInlineSnapshot(`
"<document>
  <animal>string</animal>
</document>"
`);
      });

      it('should exclude a primitive property with nodeType: none from XML output', () => {
        const schema = {
          type: 'object',
          xml: { name: 'Product' },
          properties: {
            title: {
              type: 'string',
              example: 'Widget',
              xml: { nodeType: 'element' },
            },
            internalCode: {
              type: 'string',
              example: 'INT-7742-X',
              xml: { nodeType: 'none' },
            },
            visible: {
              type: 'boolean',
              example: true,
              xml: { nodeType: 'element' },
            },
          },
        };
        const result = sample(schema, options, {});

        expect(result).not.toContain('internalCode');
        expect(result).not.toContain('INT-7742-X');
        expect(result.trim()).toMatchInlineSnapshot(`
"<Product>
  <title>Widget</title>
  <visible>true</visible>
</Product>"
`);
      });

      it('should exclude a numeric property with nodeType: none from XML output', () => {
        const schema = {
          type: 'object',
          xml: { name: 'Item' },
          properties: {
            name: {
              type: 'string',
              example: 'Test',
            },
            secretScore: {
              type: 'integer',
              example: 42,
              xml: { nodeType: 'none' },
            },
          },
        };
        const result = sample(schema, options, {});

        expect(result).not.toContain('secretScore');
        expect(result).not.toContain('42');
        expect(result.trim()).toMatchInlineSnapshot(`
"<Item>
  <name>Test</name>
</Item>"
`);
      });
    });

    describe('combined nodeTypes (spec-style examples)', () => {
      it('should build XML with attribute + text nodes (Elements With Attributes And Text)', () => {
        const schema = {
          type: 'object',
          properties: {
            pet: {
              type: 'object',
              properties: {
                kind: {
                  type: 'string',
                  xml: { nodeType: 'attribute' },
                  example: 'Cat',
                },
                name: {
                  type: 'string',
                  xml: { nodeType: 'text' },
                  example: 'Fluffy',
                },
              },
              xml: { name: 'animal' },
            },
          },
        };

        const result = sample(schema, options, {});
        expect(result.trim()).toMatchInlineSnapshot('"<animal kind="Cat">Fluffy</animal>"');
      });

      it('should build XML with attribute + cdata nodes', () => {
        const schema = {
          type: 'object',
          properties: {
            entry: {
              type: 'object',
              properties: {
                format: {
                  type: 'string',
                  xml: { nodeType: 'attribute' },
                  example: 'html',
                },
                body: {
                  type: 'string',
                  xml: { nodeType: 'cdata' },
                  example: '<b>important</b>',
                },
              },
              xml: { name: 'entry' },
            },
          },
        };

        const result = sample(schema, options, {});
        expect(result.trim()).toMatchInlineSnapshot(`
"<entry format="html">
  <![CDATA[<b>important</b>]]>
</entry>"
`);
      });

      it('should handle mixed element, attribute and text children', () => {
        const schema = {
          type: 'object',
          properties: {
            item: {
              type: 'object',
              properties: {
                id: {
                  type: 'integer',
                  xml: { nodeType: 'attribute' },
                  example: 1,
                },
                label: {
                  type: 'string',
                  xml: { nodeType: 'element', name: 'label' },
                  example: 'My Item',
                },
                description: {
                  type: 'string',
                  xml: { nodeType: 'text' },
                  example: 'A fine item',
                },
              },
              xml: { name: 'item' },
            },
          },
        };

        const result = sample(schema, options, {});
        expect(result.trim()).toMatchInlineSnapshot(`
"<item id="1">
  <label>My Item</label>
A fine item</item>"
`);
      });

      it('should handle all nodeType values together (Artifact-style schema)', () => {
        const schema = {
          type: 'object',
          xml: { name: 'Artifact' },
          properties: {
            catalogId: {
              type: 'string',
              example: 'ART-2024-001',
              xml: { nodeType: 'attribute' },
            },
            era: {
              type: 'string',
              example: 'Renaissance',
              xml: { name: 'era', nodeType: 'attribute' },
            },
            title: {
              type: 'string',
              example: 'Mona Lisa',
              xml: { nodeType: 'element' },
            },
            description: {
              type: 'string',
              example: 'Portrait painting by Leonardo da Vinci',
              xml: { nodeType: 'text' },
            },
            rawNotes: {
              type: 'string',
              example: '<note>Handle with <b>extreme</b> care</note>',
              xml: { nodeType: 'cdata' },
            },
            internalCode: {
              type: 'string',
              example: 'INT-7742-X',
              xml: { nodeType: 'none' },
            },
          },
        };

        const result = sample(schema, options, {});

        expect(result).not.toContain('internalCode');
        expect(result).not.toContain('INT-7742-X');

        expect(result).toContain('catalogId="ART-2024-001"');
        expect(result).toContain('era="Renaissance"');
        expect(result).toContain('<title>Mona Lisa</title>');
        expect(result).toContain('Portrait painting by Leonardo da Vinci');
        expect(result).toContain('<![CDATA[<note>Handle with <b>extreme</b> care</note>]]>');
      });
    });
  });
});
