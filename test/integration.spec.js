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
});
