---
"openapi-sampler": patch
---

Fixed XML samples (`format: 'xml'`) that were not well-formed, threw, or dropped data. The root schema's `xml.name` now names the document element, `example` and `default` arrays name their items like sampled arrays, and an `allOf` or `oneOf` property renders as one element.
