import { sampleObject} from '../../src/samplers/object.js';

describe('sampleObject', () => {
  let res;
  it('should return emtpy object by default', () => {
    res = sampleObject({});
    expect(res).to.deep.equal({});
  });

  it('should instantiate all properties', () => {
    res = sampleObject({properties: {
      a: {type: 'string'},
      b: {type: 'integer'}
    }});
    expect(res).to.deep.equal({
      a: 'string',
      b: 0
    });
  });

  it('should skip readonly properties if skipReadOnly=true', () => {
    res = sampleObject({properties: {
      a: {type: 'string'},
      b: {type: 'integer', readOnly: true}
    }}, {skipReadOnly: true});
    expect(res).to.deep.equal({
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
    expect(res).to.deep.equal({
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
    expect(res).to.deep.equal({
      a: 'string',
    });
  });

  it('should skip writeonly properties if writeonly=true', () => {
    res = sampleObject({properties: {
      a: {type: 'string'},
      b: {type: 'integer', writeOnly: true}
    }}, {skipWriteOnly: true});
    expect(res).to.deep.equal({
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
    expect(res).to.deep.equal({
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
     expect(res).to.deep.equal({
       a: 'string',
     });
   });

  it('should should instantiate 2 additionalProperties', () => {
    res = sampleObject({additionalProperties: {type: 'string'}});
    expect(res).to.deep.equal({
      property1: 'string',
      property2: 'string'
    });
  });

  it('should use custom property name when x-additionalPropertiesName is defined', () => {
    res = sampleObject({additionalProperties: {type: 'string', 'x-additionalPropertiesName': 'attribute-name'}});
    expect(res).to.deep.equal({
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
    expect(res).to.deep.equal({
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
    expect(res).to.deep.equal({
      fooId: 'fb4274c7-4fcd-4035-8958-a680548957ff',
      barId: '3c966637-4898-4972-9a9d-baefa6cd6c89'
    });
  })

  it('should generate both items of oneOf', () => {
    res = sampleObject({
      'type': 'object',
      'properties': {
        'my_obj': {
          'type': 'object',
          'properties': {
            'elements': {
              'items': {
                'oneOf': [
                  {
                    'type': 'object',
                    'properties': {
                      'name': {
                        'type': 'string',
                        'description': '',
                        'enum': [
                          'obj_a'
                        ]
                      }
                    },
                    'title': 'obj_a',
                    'required': [
                      'name'
                    ]
                  },
                  {
                    'type': 'object',
                    'properties': {
                      'name': {
                        'type': 'string',
                        'description': '',
                        'enum': [
                          'obj_b'
                        ]
                      }
                    },
                    'title': 'obj_b',
                    'required': [
                      'name'
                    ]
                  }
                ]
              },
              'type': 'array',
              'minItems': 2,
              'maxItems': 2,
              'uniqueItems': true
            }
          },
          'title': '',
          'required': [
            'elements'
          ]
        }
      },
      'required': [
        'my_obj'
      ]
    })

    expect(res).deep.equal({
      'my_obj': {
        'elements': [
          {
            'name': 'obj_a'
          },
          {
            'name': 'obj_b'
          }
        ]
      }
    })
  });
});
