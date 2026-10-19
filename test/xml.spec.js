import { sample } from '../src/openapi-sampler.js';

describe('XML', () => {
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

    it('should wrap the items of a root schema with items but no type in one element', () => {
      // Without `type: "array"`, the nodeType defaults to element, so the array is its own element
      const schema = {
        xml: { name: 'Tags' },
        items: { type: 'string' },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<Tags>
  <Tags>string</Tags>
</Tags>
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

  describe('xml allOf with an xml override or own properties', () => {
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
          Tags: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    };

    it('should name a root allOf of a single $ref after its own xml.name', () => {
      const schema = {
        allOf: [{ $ref: '#/components/schemas/Pet' }],
        xml: { name: 'Doc' },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<Doc>
  <name>string</name>
</Doc>
"
`);
    });

    it('should name a property allOf of a single $ref after its own xml.name', () => {
      const schema = {
        type: 'object',
        properties: {
          pet: { allOf: [{ $ref: '#/components/schemas/Pet' }], xml: { name: 'Critter' } },
          owner: { type: 'string' },
        },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<root>
  <Critter>
    <name>string</name>
  </Critter>
  <owner>string</owner>
</root>
"
`);
    });

    it('should merge a property\'s own properties with its allOf of a single $ref', () => {
      const schema = {
        type: 'object',
        properties: {
          pet: {
            type: 'object',
            properties: { nick: { type: 'string' } },
            allOf: [{ $ref: '#/components/schemas/Base' }],
          },
          owner: { type: 'string' },
        },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<root>
  <pet>
    <nick>string</nick>
    <id>7</id>
  </pet>
  <owner>string</owner>
</root>
"
`);
    });

    it('should merge the root schema\'s own properties with its allOf of a single $ref', () => {
      const schema = {
        type: 'object',
        xml: { name: 'Merged' },
        properties: { nick: { type: 'string' } },
        allOf: [{ $ref: '#/components/schemas/Base' }],
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<Merged>
  <nick>string</nick>
  <id>7</id>
</Merged>
"
`);
    });

    it('should not wrap a composed allOf that is sampled as an array twice', () => {
      const schema = {
        type: 'object',
        properties: {
          tags: {
            allOf: [
              { $ref: '#/components/schemas/Tags' },
              { items: { type: 'string', maxLength: 3 } },
            ],
          },
          owner: { type: 'string' },
        },
      };

      expect(sample(schema, { ...options, quiet: true }, spec)).toMatchInlineSnapshot(`
"<root>
  <tags>str</tags>
  <owner>string</owner>
</root>
"
`);
    });

    it('should keep a property whose first type is not array but lists array', () => {
      const schema = {
        type: 'object',
        properties: {
          value: { type: ['string', 'array'], items: { type: 'string' } },
          owner: { type: 'string' },
        },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<root>
  <value>string</value>
  <owner>string</owner>
</root>
"
`);
    });

    it('should name a root composed allOf without xml.name after its first $ref', () => {
      const schema = {
        allOf: [
          { $ref: '#/components/schemas/Pet' },
          { type: 'object', properties: { age: { type: 'integer' } } },
        ],
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<p:Animal xmlns:p="http://example.com/pet">
  <name>string</name>
  <age>0</age>
</p:Animal>
"
`);
    });

    it('should keep the document element of a root composed allOf that merges into one property', () => {
      const schema = {
        allOf: [
          { $ref: '#/components/schemas/Base' },
          { properties: { id: { maximum: 5 } } },
        ],
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<Base>
  <id>5</id>
</Base>
"
`);
    });

    it('should wrap a root composed allOf without any $ref in root', () => {
      const schema = {
        allOf: [
          { type: 'object', properties: { id: { type: 'integer' } } },
          { type: 'object', properties: { name: { type: 'string' } } },
        ],
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<root>
  <id>0</id>
  <name>string</name>
</root>
"
`);
    });
  });

  describe('xml root examples and edge cases', () => {
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
          User: {
            type: 'object',
            properties: {
              id: { type: 'integer', readOnly: true },
              tenant_id: { type: 'integer' },
              username: { type: 'string' },
            },
          },
          PatchUser: {
            allOf: [
              { $ref: '#/components/schemas/User' },
              { type: 'object', properties: { tenant_id: { readOnly: true } } },
            ],
          },
        },
      },
    };

    it('should keep a root example array under one element', () => {
      const schema = {
        xml: { name: 'Tag' },
        example: ['a', 'b'],
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<Tag>
  <Tag>a</Tag>
  <Tag>b</Tag>
</Tag>
"
`);
    });

    it('should declare the namespace of a root example array on its element', () => {
      const schema = {
        xml: { name: 'Tag', namespace: 'urn:tags' },
        example: ['a', 'b'],
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<Tag xmlns="urn:tags">
  <Tag>a</Tag>
  <Tag>b</Tag>
</Tag>
"
`);
    });

    it('should wrap a wrapped root array example in the array element', () => {
      const schema = {
        type: 'array',
        xml: { name: 'Tags', wrapped: true },
        items: { type: 'string' },
        example: ['a', 'b'],
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<Tags>
  <Tags>a</Tags>
  <Tags>b</Tags>
</Tags>
"
`);
    });

    it('should name the items of a wrapped root array example after the items xml.name', () => {
      const schema = {
        type: 'array',
        xml: { name: 'Tags', nodeType: 'element' },
        items: { type: 'string', xml: { name: 'tag', prefix: 't', namespace: 'urn:tag' } },
        example: ['a', 'b'],
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<Tags>
  <t:tag xmlns:t="urn:tag">a</t:tag>
  <t:tag xmlns:t="urn:tag">b</t:tag>
</Tags>
"
`);
    });

    it('should keep repeated elements of a single root property under one root element', () => {
      const schema = {
        type: 'object',
        properties: {
          tags: { type: 'array', minItems: 2, items: { type: 'string' } },
        },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<root>
  <tags>string</tags>
  <tags>string</tags>
</root>
"
`);
    });

    it('should not wrap an unwrapped nullable array property twice', () => {
      const schema = {
        type: 'object',
        properties: {
          tags: { type: ['array', 'null'], items: { type: 'string' } },
          owner: { type: 'string' },
        },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<root>
  <tags>string</tags>
  <owner>string</owner>
</root>
"
`);
    });

    it('should wrap an untyped array property in its own element', () => {
      // Without `type: "array"`, the nodeType defaults to element
      const schema = {
        type: 'object',
        properties: {
          tags: { items: { type: 'string' } },
          owner: { type: 'string' },
        },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<root>
  <tags>
    <tags>string</tags>
  </tags>
  <owner>string</owner>
</root>
"
`);
    });

    it('should skip a property made readOnly by a composed allOf over a $ref', () => {
      const schema = { $ref: '#/components/schemas/PatchUser' };

      expect(sample(schema, { ...options, skipReadOnly: true }, spec)).toMatchInlineSnapshot(`
"<PatchUser>
  <username>string</username>
</PatchUser>
"
`);
    });

    it('should throw for a root null sample', () => {
      expect(() => sample({ type: 'null' }, options, spec)).toThrow('Unknown format output for building XML.');
    });

    it('should render a oneOf property whose first variant is null as an empty element', () => {
      const schema = {
        type: 'object',
        properties: {
          pet: { oneOf: [{ type: 'null' }, { $ref: '#/components/schemas/Pet' }] },
          owner: { type: 'string' },
        },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<root>
  <pet></pet>
  <owner>string</owner>
</root>
"
`);
    });

    it('should name unnamed scalar items of an array nested in an array root', () => {
      const schema = {
        type: 'array',
        items: { type: 'array', items: { type: 'string' } },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<root>string</root>
"
`);
    });

    it('should name unnamed scalar items of an additionalProperties array root', () => {
      const schema = {
        type: 'object',
        xml: { name: 'Map' },
        additionalProperties: { type: 'array', items: { type: 'string' } },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<Map>
  <property1>
    <root>string</root>
  </property1>
  <property2>
    <root>string</root>
  </property2>
</Map>
"
`);
    });
  });

  describe('xml literal arrays', () => {
    const options = { format: 'xml' };
    const spec = {
      components: {
        schemas: {
          Customer: { type: 'object', properties: { id: { type: 'integer' } } },
          Order: {
            type: 'object',
            xml: { name: 'order', prefix: 'o', namespace: 'urn:o' },
            properties: { id: { type: 'integer' } },
          },
        },
      },
    };

    it('should name the items of a property example array after the property', () => {
      const schema = {
        type: 'object',
        xml: { name: 'Doc' },
        properties: {
          tags: { type: 'array', items: { type: 'string' }, example: ['a', 'b'] },
        },
      };

      expect(sample(schema, options)).toMatchInlineSnapshot(`
"<Doc>
  <tags>a</tags>
  <tags>b</tags>
</Doc>
"
`);
    });

    it('should name the items of a property default array after the property', () => {
      const schema = {
        type: 'object',
        xml: { name: 'Doc' },
        properties: {
          tags: { type: 'array', items: { type: 'string' }, default: ['a', 'b'] },
        },
      };

      expect(sample(schema, options)).toMatchInlineSnapshot(`
"<Doc>
  <tags>a</tags>
  <tags>b</tags>
</Doc>
"
`);
    });

    it('should apply the items prefix and namespace to the items of a property example array', () => {
      const schema = {
        type: 'object',
        xml: { name: 'Doc' },
        properties: {
          tags: {
            type: 'array',
            items: { type: 'string', xml: { name: 'tag', prefix: 't', namespace: 'urn:t' } },
            example: ['a', 'b'],
          },
        },
      };

      expect(sample(schema, options)).toMatchInlineSnapshot(`
"<Doc>
  <t:tag xmlns:t="urn:t">a</t:tag>
  <t:tag xmlns:t="urn:t">b</t:tag>
</Doc>
"
`);
    });

    it('should name the $ref items of a property example array like sampled items', () => {
      const schema = {
        type: 'object',
        xml: { name: 'Doc' },
        properties: {
          customers: {
            type: 'array',
            items: { $ref: '#/components/schemas/Customer' },
            example: [{ id: 1 }, { id: 2 }],
          },
        },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<Doc>
  <Customer>
    <id>1</id>
  </Customer>
  <Customer>
    <id>2</id>
  </Customer>
</Doc>
"
`);
    });

    it('should name the $ref items of a root example array like sampled items', () => {
      const schema = {
        type: 'array',
        items: { $ref: '#/components/schemas/Customer' },
        example: [{ id: 1 }, { id: 2 }],
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<root>
  <Customer>
    <id>1</id>
  </Customer>
  <Customer>
    <id>2</id>
  </Customer>
</root>
"
`);
      expect(sample({ type: 'array', items: { $ref: '#/components/schemas/Customer' } }, options, spec))
        .toMatchInlineSnapshot(`
"<Customer>
  <id>0</id>
</Customer>
"
`);
    });

    it('should use the xml.name, prefix and namespace of $ref items in a root example array', () => {
      const schema = {
        type: 'array',
        items: { $ref: '#/components/schemas/Order' },
        example: [{ id: 1 }, { id: 2 }],
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<root>
  <o:order xmlns:o="urn:o">
    <id>1</id>
  </o:order>
  <o:order xmlns:o="urn:o">
    <id>2</id>
  </o:order>
</root>
"
`);
    });
  });

  describe('xml root $ref with siblings', () => {
    const options = { format: 'xml' };
    const schemas = {
      Customer: { type: 'object', properties: { id: { type: 'integer' } } },
      Documentation: {
        type: 'object',
        xml: { nodeType: 'none' },
        properties: {
          content: { type: 'string', contentMediaType: 'text/html', xml: { nodeType: 'cdata' }, example: '<p>Hi</p>' },
        },
      },
      Pet: {
        type: 'object',
        xml: { name: 'Animal', prefix: 'p', namespace: 'urn:p' },
        properties: { name: { type: 'string' } },
      },
    };
    const spec = { openapi: '3.1.0', components: { schemas } };

    it('should name the document element once from an xml sibling of a root $ref', () => {
      const schema = { $ref: '#/components/schemas/Customer', xml: { name: 'Client' } };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<Client>
  <id>0</id>
</Client>
"
`);
    });

    it('should ignore an xml sibling of a root $ref in OpenAPI 3.0', () => {
      const schema = { $ref: '#/components/schemas/Customer', xml: { name: 'Client' } };

      expect(sample(schema, options, { openapi: '3.0.3', components: { schemas } })).toMatchInlineSnapshot(`
"<Customer>
  <id>0</id>
</Customer>
"
`);
    });

    it('should name a referenced nodeType none schema after the root $ref xml sibling', () => {
      const schema = {
        $ref: '#/components/schemas/Documentation',
        xml: { nodeType: 'element', name: 'StoredDocument' },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<StoredDocument>
  <![CDATA[<p>Hi</p>]]>
</StoredDocument>
"
`);
    });

    it('should name a root composed allOf after the xml sibling of its first $ref', () => {
      const schema = {
        allOf: [
          { $ref: '#/components/schemas/Pet', xml: { name: 'Critter' } },
          { properties: { age: { type: 'integer' } } },
        ],
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<p:Critter xmlns:p="urn:p">
  <name>string</name>
  <age>0</age>
</p:Critter>
"
`);
    });

    it('should name a root composed allOf with an example after its first $ref', () => {
      const schema = {
        allOf: [
          { $ref: '#/components/schemas/Customer' },
          { properties: { note: { type: 'string' } } },
        ],
        example: { id: 1, note: 'n' },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<Customer>
  <id>1</id>
  <note>n</note>
</Customer>
"
`);
    });

    it('should not need a spec for a root composed allOf with an example', () => {
      // traverse() returns the example without resolving the $ref, so no spec is required
      const schema = {
        allOf: [
          { $ref: '#/components/schemas/Customer' },
          { properties: { note: { type: 'string' } } },
        ],
        example: { id: 1, note: 'n' },
      };

      expect(sample(schema, options)).toMatchInlineSnapshot(`
"<root>
  <id>1</id>
  <note>n</note>
</root>
"
`);
    });
  });

  describe('xml compositions with their own value', () => {
    const options = { format: 'xml' };
    const spec = {
      components: {
        schemas: {
          Status: { type: 'string', enum: ['active', 'inactive'] },
          Money: { type: 'object', properties: { amount: { type: 'number' }, currency: { type: 'string' } } },
        },
      },
    };

    it('should keep an allOf $ref property with its own default', () => {
      const schema = {
        type: 'object',
        xml: { name: 'Doc' },
        properties: {
          status: { allOf: [{ $ref: '#/components/schemas/Status' }], default: 'inactive' },
        },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<Doc>
  <status>inactive</status>
</Doc>
"
`);
    });

    it('should keep a oneOf $ref property with its own example', () => {
      const schema = {
        type: 'object',
        xml: { name: 'Doc' },
        properties: {
          status: { oneOf: [{ $ref: '#/components/schemas/Status' }], example: 'inactive' },
        },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<Doc>
  <status>inactive</status>
</Doc>
"
`);
    });

    it('should keep an object example of an allOf $ref property in its own element', () => {
      const schema = {
        type: 'object',
        xml: { name: 'Doc' },
        properties: {
          price: { allOf: [{ $ref: '#/components/schemas/Money' }], example: { amount: 1, currency: 'GBP' } },
        },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<Doc>
  <price>
    <amount>1</amount>
    <currency>GBP</currency>
  </price>
</Doc>
"
`);
    });
  });

  describe('xml spec objects', () => {
    const deepFreeze = value => {
      Object.values(value).forEach(child => child && typeof child === 'object' && deepFreeze(child));
      return Object.freeze(value);
    };
    const spec = {
      components: {
        schemas: {
          Base: { type: 'object', properties: { id: { type: 'string', readOnly: true } } },
        },
      },
    };
    const schema = {
      allOf: [
        { $ref: '#/components/schemas/Base' },
        { type: 'object', example: { meta: { tags: ['a', 'b'] } } },
      ],
    };

    it('should sample a deep-frozen schema and spec', () => {
      expect(sample(deepFreeze(structuredClone(schema)), { format: 'xml', skipReadOnly: true }, deepFreeze(structuredClone(spec))))
        .toMatchInlineSnapshot(`
"<Base>
  <meta>
    <tags>a</tags>
    <tags>b</tags>
  </meta>
</Base>
"
`);
    });

    it('should not modify examples in the schema', () => {
      const ownSchema = structuredClone(schema);
      const { meta } = ownSchema.allOf[1].example;
      const tags = meta.tags;

      sample(ownSchema, { format: 'xml', skipReadOnly: true }, spec);

      expect(ownSchema.allOf[1].example.meta).toBe(meta);
      expect(meta.tags).toBe(tags);
      expect(tags).toEqual(['a', 'b']);
    });
  });

  describe('xml arrays in compositions and unusual values', () => {
    const options = { format: 'xml', quiet: true };
    const spec = {
      openapi: '3.0.3',
      components: {
        schemas: {
          Tags: { type: 'array', items: { type: 'string' }, example: ['a', 'b'] },
          Item: { type: 'object', xml: { name: 'item' }, properties: { id: { type: 'integer' } } },
        },
      },
    };

    it('should name the items of an example array under an allOf $ref with its own xml', () => {
      const schema = {
        type: 'object',
        xml: { name: 'Doc' },
        properties: {
          tags: { allOf: [{ $ref: '#/components/schemas/Tags' }], xml: { name: 'tag' } },
        },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<Doc>
  <tags>a</tags>
  <tags>b</tags>
</Doc>
"
`);
    });

    it('should name the items of an example array whose $ref items cannot be resolved after the property', () => {
      const schema = {
        type: 'object',
        xml: { name: 'Doc' },
        properties: {
          pets: { type: 'array', items: { $ref: '#/components/schemas/Missing' }, example: [{ id: 1 }] },
        },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<Doc>
  <pets>
    <id>1</id>
  </pets>
</Doc>
"
`);
    });

    it('should wrap a root composed allOf with an example and an external $ref in root', () => {
      const schema = {
        allOf: [{ $ref: 'pets.yaml#/Pet' }, { properties: { id: { type: 'integer' } } }],
        example: { id: 1 },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<root>
  <id>1</id>
</root>
"
`);
    });

    it('should keep an empty element for a null array property', () => {
      const schema = {
        type: 'object',
        xml: { name: 'Doc' },
        properties: {
          tags: { type: ['array', 'null'], items: { type: 'string' }, default: null },
        },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<Doc>
  <tags></tags>
</Doc>
"
`);
    });

    it('should name the composed allOf items of a root array after their first $ref', () => {
      const schema = {
        type: 'array',
        minItems: 2,
        items: {
          allOf: [
            { $ref: '#/components/schemas/Item' },
            { type: 'object', properties: { note: { type: 'string' } } },
          ],
        },
      };

      expect(sample(schema, options, spec)).toMatchInlineSnapshot(`
"<root>
  <item>
    <id>0</id>
    <note>string</note>
  </item>
  <item>
    <id>0</id>
    <note>string</note>
  </item>
</root>
"
`);
    });
  });
});
