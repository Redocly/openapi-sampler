---
"openapi-sampler": patch
---

Fixed several bugs in XML samples (`format: 'xml'`). JSON samples are unchanged. XML samples change for the schemas below, so documentation that shows them (for example Redoc's XML response samples) will render the corrected XML:

- The root schema's `xml.name`, `xml.prefix` and `xml.namespace` now always name the document element. They were dropped when the object had a single property, unlike the `<document>` examples in the OpenAPI 3.2 specification.
- A root array of strings no longer splits each string into one element per character, and several unnamed root items stay under one root element.
- Repeated elements are always kept under one root element, so a root object whose only property is an unwrapped array, and a root `example` array, now produce well-formed XML. A wrapped root array `example` is wrapped in the array's element, as in the specification's wrapped array examples.
- Arrays are detected with the same type resolution that is used for sampling, so unwrapped nullable arrays (`type: ['array', 'null']`) and arrays with `items` but no `type` are no longer wrapped twice, and a property with `type: ['string', 'array']` is rendered as its first type.
- A `$ref` composed with other schemas in an `allOf` is merged into one element instead of nesting its properties in an extra element. Composed `allOf` properties and array items now get their own element instead of spilling their properties into the parent, unless the composition is sampled as an array. An `allOf` of a single `$ref` (with or without annotation-only siblings such as `description` or `nullable`) is still named like the `$ref`, unless the schema adds its own `xml` or properties: then it is merged and named by the schema.
- A root composed `allOf` without an `xml.name` is named after its first `$ref` (its `xml.name`, prefix and namespace, or the component name), so its document element is no longer lost.
- A `oneOf`/`anyOf` property whose first variant is an inline object, a composed `allOf` or a scalar is now rendered as its own element. Scalar variants were previously dropped, and object variants spilled into the parent.
- `skipReadOnly`/`skipWriteOnly` no longer throw "Cannot convert a Symbol value to a string" for an `allOf` that wraps a `$ref`, including an `allOf` that marks a property of the `$ref` as `readOnly`.
- A root scalar sample is wrapped in a root element. Previously `0` and `""` threw, `true` rendered as an empty string and `"a"` rendered as `<0>a</0>`.
