import { isAnnotatedRef, isArraySchema, SKIP_SYMBOL, stripSkipped } from '../../src/utils.js';

describe('utils', () => {
  describe('stripSkipped', () => {
    it('should remove skipped properties nested in objects and arrays', () => {
      const value = {
        keep: 1,
        drop: SKIP_SYMBOL,
        nested: { keep: 'a', drop: SKIP_SYMBOL },
        list: [{ keep: true, drop: SKIP_SYMBOL }, 'text'],
      };

      expect(stripSkipped(value)).toEqual({
        keep: 1,
        nested: { keep: 'a' },
        list: [{ keep: true }, 'text'],
      });
    });
  });

  describe('isArraySchema', () => {
    it('should use the type that is sampled', () => {
      expect(isArraySchema({ type: 'array' })).toBe(true);
      expect(isArraySchema({ type: ['array', 'null'] })).toBe(true);
      expect(isArraySchema({ type: ['string', 'array'] })).toBe(false);
      expect(isArraySchema({ items: { type: 'string' } })).toBe(true);
      expect(isArraySchema({ type: 'object' })).toBe(false);
      expect(isArraySchema(undefined)).toBe(false);
    });
  });

  describe('isAnnotatedRef', () => {
    it('should only accept an allOf of a single $ref that adds nothing of its own', () => {
      const ref = { $ref: '#/components/schemas/Pet' };

      expect(isAnnotatedRef({ allOf: [ref] })).toBe(true);
      expect(isAnnotatedRef({ allOf: [ref, { description: 'A pet' }], nullable: true })).toBe(true);
      expect(isAnnotatedRef({ allOf: [ref], xml: { name: 'Critter' } })).toBe(false);
      expect(isAnnotatedRef({ allOf: [ref], properties: { nick: { type: 'string' } } })).toBe(false);
      expect(isAnnotatedRef({ allOf: [ref, { properties: {} }] })).toBe(false);
      expect(isAnnotatedRef({ allOf: [ref, ref] })).toBe(false);
    });
  });
});
