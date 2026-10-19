---
"openapi-sampler": patch
---

Fixed an issue where keywords next to `$ref` (such as `example`, `examples`, `minimum`) were ignored. They are now applied unless the document is Swagger 2.0 or OpenAPI 3.0.
