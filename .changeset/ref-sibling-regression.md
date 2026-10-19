---
"openapi-sampler": patch
---

Fixed a regression where a `$ref` inside `allOf` was sampled as `null`, and a `readOnly` or `writeOnly` `$ref` inside `oneOf` or `anyOf` was no longer skipped by `skipReadOnly` or `skipWriteOnly`.
