---
"openapi-sampler": patch
---

Fixed several bugs in XML samples (`format: 'xml'`):

- The root schema's `xml.name`, `xml.prefix` and `xml.namespace` now always name the document element. They were dropped when the object had a single property, unlike the `<document>` examples in the OpenAPI 3.2 specification.
- A root array of strings no longer splits each string into one element per character, and several unnamed root items stay under one root element.
- Nullable arrays (`type: ['array', 'null']`) and arrays with `items` but no `type` are treated as arrays, so they are no longer wrapped twice.
- A `$ref` composed with other schemas in an `allOf` is merged into one element instead of nesting its properties in an extra element. Composed `allOf` properties and array items now get their own element instead of spilling their properties into the parent. An `allOf` of a single `$ref` (with or without annotation-only siblings such as `description` or `nullable`) is still named like the `$ref`.
- A `oneOf`/`anyOf` property whose first variant is an inline object, a composed `allOf` or a scalar is now rendered as its own element. Scalar variants were previously dropped, and object variants spilled into the parent.
- `skipReadOnly`/`skipWriteOnly` no longer throw "Cannot convert a Symbol value to a string" for an `allOf` that wraps a `$ref`.
- A root scalar sample is wrapped in a root element. Previously `0` and `""` threw, `true` rendered as an empty string and `"a"` rendered as `<0>a</0>`.
