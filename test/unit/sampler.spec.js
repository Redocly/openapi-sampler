import { sample } from '../../src/openapi-sampler.js';

const options = {
  format: 'xml',
};

describe('sample', () => {

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

    expect(result.trim()).toMatchInlineSnapshot(`"<book>string</book>"`);
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
  <parent:booksLibrary>string</parent:booksLibrary>
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

