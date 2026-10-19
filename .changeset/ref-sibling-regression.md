---
"openapi-sampler": patch
---

Fixed a regression from 1.7.7: a `$ref` inside `allOf` was sampled as `null`, and `skipReadOnly`/`skipWriteOnly` ignored a `$ref` inside `oneOf` or `anyOf`.
