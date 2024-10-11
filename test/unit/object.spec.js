import { sampleObject } from '../../src/samplers/object.js';

describe('sampleObject', () => {
  let res;

  it('should return empty object by default', () => {
    res = sampleObject({});
    expect(res).toEqual({});
  });

  it('should instantiate all properties', () => {
    res = sampleObject({properties: {
      a: {type: 'string'},
      b: {type: 'integer'}
    }});
    expect(res).toEqual({
      a: 'string',
      b: 0
    });
  });

  it('should skip readonly properties if skipReadOnly=true', () => {
    res = sampleObject({properties: {
      a: {type: 'string'},
      b: {type: 'integer', readOnly: true}
    }}, {skipReadOnly: true});
    expect(res).toEqual({
      a: 'string'
    });
  });

  it('should skip readonly properties in nested objects if skipReadOnly=true', () => {
    res = sampleObject({properties: {
      a: {type: 'string'},
      b: {type: 'object', properties: {
        b1: { type: 'number', readOnly: true },
        b2: { type: 'number'}
      }}
    }}, {skipReadOnly: true});
    expect(res).toEqual({
      a: 'string',
      b: {
        b2: 0
      }
    });
  });

  it('should skip readonly properties in oneOfs if skipReadOnly=true', () => {
    res = sampleObject(
      {
        properties: {
          a: { type: 'string' },
          b: {
            type: 'object',
            oneOf: [
              {
                type: 'object',
                properties: {
                  c: {
                    type: 'string',
                  },
                },
              },
              {
                type: 'object',
                properties: {
                  d: {
                    type: 'string',
                  },
                },
              },
            ],
            readOnly: true,
          },
        },
      },
      { skipReadOnly: true }
    );
    expect(res).toEqual({
      a: 'string',
    });
  });

  it('should skip writeonly properties if writeonly=true', () => {
    res = sampleObject({properties: {
      a: {type: 'string'},
      b: {type: 'integer', writeOnly: true}
    }}, {skipWriteOnly: true});
    expect(res).toEqual({
      a: 'string'
    });
  });

  it('should skip writeonly properties in nested objects if writeonly=true', () => {
    res = sampleObject({properties: {
      a: {type: 'string'},
      b: {type: 'object', properties: {
        b1: { type: 'number', writeOnly: true },
        b2: { type: 'number'}
      }}
    }}, {skipWriteOnly: true});
    expect(res).toEqual({
      a: 'string',
      b: {
        b2: 0
      }
    });
  });

  it('should skip writeonly properties in oneOfs if skipReadOnly=true', () => {
    res = sampleObject(
      {
        properties: {
          a: { type: 'string' },
          b: {
            type: 'object',
            oneOf: [
              {
                type: 'object',
                properties: {
                  c: {
                    type: 'string',
                  },
                },
              },
              {
                type: 'object',
                properties: {
                  d: {
                    type: 'string',
                  },
                },
              },
            ],
            writeOnly: true,
          },
        },
      },
      { skipWriteOnly: true }
    );
    expect(res).toEqual({
      a: 'string',
    });
  });

  it('should should instantiate 2 additionalProperties', () => {
    res = sampleObject({additionalProperties: {type: 'string'}});
    expect(res).toEqual({
      property1: 'string',
      property2: 'string'
    });
  });

  it('should use custom property name when x-additionalPropertiesName is defined', () => {
    res = sampleObject({additionalProperties: {type: 'string', 'x-additionalPropertiesName': 'attribute-name'}});
    expect(res).toEqual({
      'attribute-name1': 'string',
      'attribute-name2': 'string'
    });
  });

  it('should skip non-required properties if skipNonRequired=true', () => {
    res = sampleObject({
      properties: {
        a: {type: 'string'},
        b: {type: 'integer'}
      },
      required: ['a']
    }, {skipNonRequired: true});
    expect(res).toEqual({
      a: 'string'
    });
  });

  it('should pass propertyName context to samplers', () => {
    res = sampleObject({
      properties: {
        fooId: {type: 'string', format: 'uuid'},
        barId: {type: 'string', format: 'uuid'},
      }
    });
    expect(res).toEqual({
      fooId: 'fb4274c7-4fcd-4035-8958-a680548957ff',
      barId: '3c966637-4898-4972-9a9d-baefa6cd6c89'
    });
  });

  it('respects maxProperties by including no more than 2 properties in the sampled object', () => {
    // Define a schema with four properties and a maxProperties limit of two
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        age: { type: 'integer', minimum: 0 },
        phone: { type: 'string' }
      },
      required: ['name', 'email'], // 'name' and 'email' are required
      maxProperties: 2
    };

    const result = sampleObject(schema);

    expect(Object.keys(result).length).toBeLessThanOrEqual(2);

    // Assert that if 'name' and 'email' are required, they are included
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('email');
  });
});
