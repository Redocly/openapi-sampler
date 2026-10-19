---
"openapi-sampler": patch
---

Fixed a regression from 1.7.8 where a recursive `$ref` inside `allOf` was sampled as `null` instead of an empty object.
