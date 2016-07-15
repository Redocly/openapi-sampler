# openapi-sampler

[![Travis build status](http://img.shields.io/travis/APIs-guru/openapi-sampler.svg?style=flat)](https://travis-ci.org/APIs-guru/openapi-sampler) [![Code Climate](https://codeclimate.com/github/APIs-guru/openapi-sampler/badges/gpa.svg)](https://codeclimate.com/github/APIs-guru/openapi-sampler) [![Coverage Status](https://coveralls.io/repos/APIs-guru/openapi-sampler/badge.svg?branch=master&service=github)](https://coveralls.io/github/APIs-guru/openapi-sampler?branch=master) [![Dependency Status](https://david-dm.org/APIs-guru/openapi-sampler.svg)](https://david-dm.org/APIs-guru/openapi-sampler) [![devDependency Status](https://david-dm.org/APIs-guru/openapi-sampler/dev-status.svg)](https://david-dm.org/APIs-guru/openapi-sampler#info=devDependencies)

Tool for generation samples based on OpenAPI payload/response schema

## Features
- deterministic (given a particular input, will always produce the same output)
- Supports `allOf`
- Supports `additionalProperties`
- Uses `default`, `example` and `enum` where possible
- Full array support: supports `minItems`, and tuples (`items` as an array)
- Supports `minLength`, `maxLength`, `min`, `max`, `exclusiveMinimum`, `exclusiveMaximum`
- Supports the next `string` formats:
  - email
  - password
  - date-time
  - date
  - ipv4
  - ipv6
  - hostname
  - uri

## Installation
#### Node
Install using [npm](https://docs.npmjs.com/getting-started/what-is-npm)

    npm install openapi-sampler --save

Then require it in your code:

```js
var OpenAPISampler = require('openapi-sampler');
```

#### Web Browsers

Install using [bower](https://bower.io/):

    bower install openapi-sampler

Then reference `openapi-sampler.js` in your HTML:

```html
<script src="bower_components/openapi-sampler/openapi-sampler.js"></script>
```
Then use it via global exposed variable `OpenAPISampler`


## Usage
#### `OpenAPISampler.sample(schema, [options])`
- **schema** (_required_) - `object`
A [OpenAPI Schema Object](http://swagger.io/specification/#schemaObject)
- **options** (_optional_) - `object`
Available options:
  - **skipReadOnly** - `boolean`
  Don't include `readOnly` object properties

## Example
```js
const OpenAPISampler = require('.');
OpenAPISampler.sample({
  type: 'object',
  properties: {
    a: {type: 'integer', minimum: 10},
    b: {type: 'string', format: 'password', minLength: 10},
    c: {type: 'boolean', readOnly: true}
  }
}, {skipReadOnly: true});
// { a: 10, b: 'pa$$word_q' }
```
