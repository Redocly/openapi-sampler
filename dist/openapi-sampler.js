(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.OpenAPISampler = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

module.exports = function forEach (obj, fn, ctx) {
    if (toString.call(fn) !== '[object Function]') {
        throw new TypeError('iterator must be a function');
    }
    var l = obj.length;
    if (l === +l) {
        for (var i = 0; i < l; i++) {
            fn.call(ctx, obj[i], i, obj);
        }
    } else {
        for (var k in obj) {
            if (hasOwn.call(obj, k)) {
                fn.call(ctx, obj[k], k, obj);
            }
        }
    }
};


},{}],2:[function(require,module,exports){
'use strict';

var each = require('foreach');
module.exports = api;


/**
 * Convenience wrapper around the api.
 * Calls `.get` when called with an `object` and a `pointer`.
 * Calls `.set` when also called with `value`.
 * If only supplied `object`, returns a partially applied function, mapped to the object.
 *
 * @param {Object} obj
 * @param {String|Array} pointer
 * @param value
 * @returns {*}
 */

function api (obj, pointer, value) {
    // .set()
    if (arguments.length === 3) {
        return api.set(obj, pointer, value);
    }
    // .get()
    if (arguments.length === 2) {
        return api.get(obj, pointer);
    }
    // Return a partially applied function on `obj`.
    var wrapped = api.bind(api, obj);

    // Support for oo style
    for (var name in api) {
        if (api.hasOwnProperty(name)) {
            wrapped[name] = api[name].bind(wrapped, obj);
        }
    }
    return wrapped;
}


/**
 * Lookup a json pointer in an object
 *
 * @param {Object} obj
 * @param {String|Array} pointer
 * @returns {*}
 */
api.get = function get (obj, pointer) {
    var refTokens = Array.isArray(pointer) ? pointer : api.parse(pointer);

    for (var i = 0; i < refTokens.length; ++i) {
        var tok = refTokens[i];
        if (!(typeof obj == 'object' && tok in obj)) {
            throw new Error('Invalid reference token: ' + tok);
        }
        obj = obj[tok];
    }
    return obj;
};

/**
 * Sets a value on an object
 *
 * @param {Object} obj
 * @param {String|Array} pointer
 * @param value
 */
api.set = function set (obj, pointer, value) {
    var refTokens = Array.isArray(pointer) ? pointer : api.parse(pointer),
      nextTok = refTokens[0];

    for (var i = 0; i < refTokens.length - 1; ++i) {
        var tok = refTokens[i];
        if (tok === '-' && Array.isArray(obj)) {
          tok = obj.length;
        }
        nextTok = refTokens[i + 1];

        if (!(tok in obj)) {
            if (nextTok.match(/^(\d+|-)$/)) {
                obj[tok] = [];
            } else {
                obj[tok] = {};
            }
        }
        obj = obj[tok];
    }
    if (nextTok === '-' && Array.isArray(obj)) {
      nextTok = obj.length;
    }
    obj[nextTok] = value;
    return this;
};

/**
 * Removes an attribute
 *
 * @param {Object} obj
 * @param {String|Array} pointer
 */
api.remove = function (obj, pointer) {
    var refTokens = Array.isArray(pointer) ? pointer : api.parse(pointer);
    var finalToken = refTokens[refTokens.length -1];
    if (finalToken === undefined) {
        throw new Error('Invalid JSON pointer for remove: "' + pointer + '"');
    }

    var parent = api.get(obj, refTokens.slice(0, -1));
    if (Array.isArray(parent)) {
      var index = +finalToken;
      if (finalToken === '' && isNaN(index)) {
        throw new Error('Invalid array index: "' + finalToken + '"');
      }

      Array.prototype.splice.call(parent, index, 1);
    } else {
      delete parent[finalToken];
    }
};

/**
 * Returns a (pointer -> value) dictionary for an object
 *
 * @param obj
 * @param {function} descend
 * @returns {}
 */
api.dict = function dict (obj, descend) {
    var results = {};
    api.walk(obj, function (value, pointer) {
        results[pointer] = value;
    }, descend);
    return results;
};

/**
 * Iterates over an object
 * Iterator: function (value, pointer) {}
 *
 * @param obj
 * @param {function} iterator
 * @param {function} descend
 */
api.walk = function walk (obj, iterator, descend) {
    var refTokens = [];

    descend = descend || function (value) {
        var type = Object.prototype.toString.call(value);
        return type === '[object Object]' || type === '[object Array]';
    };

    (function next (cur) {
        each(cur, function (value, key) {
            refTokens.push(String(key));
            if (descend(value)) {
                next(value);
            } else {
                iterator(value, api.compile(refTokens));
            }
            refTokens.pop();
        });
    }(obj));
};

/**
 * Tests if an object has a value for a json pointer
 *
 * @param obj
 * @param pointer
 * @returns {boolean}
 */
api.has = function has (obj, pointer) {
    try {
        api.get(obj, pointer);
    } catch (e) {
        return false;
    }
    return true;
};

/**
 * Escapes a reference token
 *
 * @param str
 * @returns {string}
 */
api.escape = function escape (str) {
    return str.toString().replace(/~/g, '~0').replace(/\//g, '~1');
};

/**
 * Unescapes a reference token
 *
 * @param str
 * @returns {string}
 */
api.unescape = function unescape (str) {
    return str.replace(/~1/g, '/').replace(/~0/g, '~');
};

/**
 * Converts a json pointer into a array of reference tokens
 *
 * @param pointer
 * @returns {Array}
 */
api.parse = function parse (pointer) {
    if (pointer === '') { return []; }
    if (pointer.charAt(0) !== '/') { throw new Error('Invalid JSON pointer: ' + pointer); }
    return pointer.substring(1).split(/\//).map(api.unescape);
};

/**
 * Builds a json pointer from a array of reference tokens
 *
 * @param refTokens
 * @returns {string}
 */
api.compile = function compile (refTokens) {
    if (refTokens.length === 0) { return ''; }
    return '/' + refTokens.map(api.escape).join('/');
};

},{"foreach":1}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.allOfSample = allOfSample;

var _traverse2 = require("./traverse");

var _utils = require("./utils");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function allOfSample(into, children, options, spec) {
  var res = (0, _traverse2.traverse)(into, options, spec);
  var subSamples = [];

  var _iterator = _createForOfIteratorHelper(children),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var subSchema = _step.value;

      var _traverse = (0, _traverse2.traverse)(_objectSpread({
        type: type
      }, subSchema), options, spec),
          type = _traverse.type,
          readOnly = _traverse.readOnly,
          writeOnly = _traverse.writeOnly,
          value = _traverse.value;

      if (res.type && type && type !== res.type) {
        console.warn('allOf: schemas with different types can\'t be merged');
        res.type = type;
      }

      res.type = res.type || type;
      res.readOnly = res.readOnly || readOnly;
      res.writeOnly = res.writeOnly || writeOnly;
      if (value != null) subSamples.push(value);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  if (res.type === 'object') {
    res.value = _utils.mergeDeep.apply(void 0, [res.value || {}].concat(_toConsumableArray(subSamples.filter(function (sample) {
      return _typeof(sample) === 'object';
    }))));
    return res;
  } else {
    if (res.type === 'array') {
      // TODO: implement arrays
      if (!options.quiet) console.warn('OpenAPI Sampler: found allOf with "array" type. Result may be incorrect');
    }

    var lastSample = subSamples[subSamples.length - 1];
    res.value = lastSample != null ? lastSample : res.value;
    return res;
  }
}

},{"./traverse":12,"./utils":13}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.inferType = inferType;
var schemaKeywordTypes = {
  multipleOf: 'number',
  maximum: 'number',
  exclusiveMaximum: 'number',
  minimum: 'number',
  exclusiveMinimum: 'number',
  maxLength: 'string',
  minLength: 'string',
  pattern: 'string',
  items: 'array',
  maxItems: 'array',
  minItems: 'array',
  uniqueItems: 'array',
  additionalItems: 'array',
  maxProperties: 'object',
  minProperties: 'object',
  required: 'object',
  additionalProperties: 'object',
  properties: 'object',
  patternProperties: 'object',
  dependencies: 'object'
};

function inferType(schema) {
  if (schema.type !== undefined) {
    return schema.type;
  }

  var keywords = Object.keys(schemaKeywordTypes);

  for (var i = 0; i < keywords.length; i++) {
    var keyword = keywords[i];
    var type = schemaKeywordTypes[keyword];

    if (schema[keyword] !== undefined) {
      return type;
    }
  }

  return null;
}

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sample = sample;
exports._registerSampler = _registerSampler;
Object.defineProperty(exports, "inferType", {
  enumerable: true,
  get: function get() {
    return _infer.inferType;
  }
});
exports._samplers = void 0;

var _traverse = require("./traverse");

var _index = require("./samplers/index");

var _infer = require("./infer");

var _samplers = {};
exports._samplers = _samplers;
var defaults = {
  skipReadOnly: false
};

function sample(schema, options, spec) {
  var opts = Object.assign({}, defaults, options);
  (0, _traverse.clearCache)();
  return (0, _traverse.traverse)(schema, opts, spec).value;
}

;

function _registerSampler(type, sampler) {
  _samplers[type] = sampler;
}

;

_registerSampler('array', _index.sampleArray);

_registerSampler('boolean', _index.sampleBoolean);

_registerSampler('integer', _index.sampleNumber);

_registerSampler('number', _index.sampleNumber);

_registerSampler('object', _index.sampleObject);

_registerSampler('string', _index.sampleString);

},{"./infer":4,"./samplers/index":8,"./traverse":12}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sampleArray = sampleArray;

var _traverse2 = require("../traverse");

function sampleArray(schema) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var spec = arguments.length > 2 ? arguments[2] : undefined;
  var arrayLength = schema.minItems || 1;

  if (Array.isArray(schema.items)) {
    arrayLength = Math.max(arrayLength, schema.items.length);
  }

  var itemSchemaGetter = function itemSchemaGetter(itemNumber) {
    if (Array.isArray(schema.items)) {
      return schema.items[itemNumber] || {};
    }

    return schema.items || {};
  };

  var res = [];
  if (!schema.items) return res;

  for (var i = 0; i < arrayLength; i++) {
    var itemSchema = itemSchemaGetter(i);

    var _traverse = (0, _traverse2.traverse)(itemSchema, options, spec),
        sample = _traverse.value;

    res.push(sample);
  }

  return res;
}

},{"../traverse":12}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sampleBoolean = sampleBoolean;

function sampleBoolean(schema) {
  return true; // let be optimistic :)
}

},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "sampleArray", {
  enumerable: true,
  get: function get() {
    return _array.sampleArray;
  }
});
Object.defineProperty(exports, "sampleBoolean", {
  enumerable: true,
  get: function get() {
    return _boolean.sampleBoolean;
  }
});
Object.defineProperty(exports, "sampleNumber", {
  enumerable: true,
  get: function get() {
    return _number.sampleNumber;
  }
});
Object.defineProperty(exports, "sampleObject", {
  enumerable: true,
  get: function get() {
    return _object.sampleObject;
  }
});
Object.defineProperty(exports, "sampleString", {
  enumerable: true,
  get: function get() {
    return _string.sampleString;
  }
});

var _array = require("./array");

var _boolean = require("./boolean");

var _number = require("./number");

var _object = require("./object");

var _string = require("./string");

},{"./array":6,"./boolean":7,"./number":9,"./object":10,"./string":11}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sampleNumber = sampleNumber;

function sampleNumber(schema) {
  var res;

  if (schema.maximum && schema.minimum) {
    res = schema.exclusiveMinimum ? Math.floor(schema.minimum) + 1 : schema.minimum;

    if (schema.exclusiveMaximum && res >= schema.maximum || !schema.exclusiveMaximum && res > schema.maximum) {
      res = (schema.maximum + schema.minimum) / 2;
    }

    return res;
  }

  if (schema.minimum) {
    if (schema.exclusiveMinimum) {
      return Math.floor(schema.minimum) + 1;
    } else {
      return schema.minimum;
    }
  }

  if (schema.maximum) {
    if (schema.exclusiveMaximum) {
      return schema.maximum > 0 ? 0 : Math.floor(schema.maximum) - 1;
    } else {
      return schema.maximum > 0 ? 0 : schema.maximum;
    }
  }

  return 0;
}

},{}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sampleObject = sampleObject;

var _traverse = require("../traverse");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function sampleObject(schema) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var spec = arguments.length > 2 ? arguments[2] : undefined;
  var res = {};

  if (schema && _typeof(schema.properties) === 'object') {
    var requiredKeys = Array.isArray(schema.required) ? schema.required : [];
    var requiredKeyDict = requiredKeys.reduce(function (dict, key) {
      dict[key] = true;
      return dict;
    }, {});
    Object.keys(schema.properties).forEach(function (propertyName) {
      // skip before traverse that could be costly
      if (options.skipNonRequired && !requiredKeyDict.hasOwnProperty(propertyName)) {
        return;
      }

      var sample = (0, _traverse.traverse)(schema.properties[propertyName], options, spec, {
        propertyName: propertyName
      });

      if (options.skipReadOnly && sample.readOnly) {
        return;
      }

      if (options.skipWriteOnly && sample.writeOnly) {
        return;
      }

      res[propertyName] = sample.value;
    });
  }

  if (schema && _typeof(schema.additionalProperties) === 'object') {
    res.property1 = (0, _traverse.traverse)(schema.additionalProperties, options, spec).value;
    res.property2 = (0, _traverse.traverse)(schema.additionalProperties, options, spec).value;
  }

  return res;
}

},{"../traverse":12}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sampleString = sampleString;

var _utils = require("../utils");

var passwordSymbols = 'qwerty!@#$%^123456';

function emailSample() {
  return 'user@example.com';
}

function passwordSample(min, max) {
  var res = 'pa$$word';

  if (min > res.length) {
    res += '_';
    res += (0, _utils.ensureMinLength)(passwordSymbols, min - res.length).substring(0, min - res.length);
  }

  return res;
}

function commonDateTimeSample(min, max, omitTime) {
  var res = (0, _utils.toRFCDateTime)(new Date('2019-08-24T14:15:22.123Z'), omitTime, false);

  if (res.length < min) {
    console.warn("Using minLength = ".concat(min, " is incorrect with format \"date-time\""));
  }

  if (max && res.length > max) {
    console.warn("Using maxLength = ".concat(max, " is incorrect with format \"date-time\""));
  }

  return res;
}

function dateTimeSample(min, max) {
  return commonDateTimeSample(min, max);
}

function dateSample(min, max) {
  return commonDateTimeSample(min, max, true);
}

function defaultSample(min, max) {
  var res = (0, _utils.ensureMinLength)('string', min);

  if (max && res.length > max) {
    res = res.substring(0, max);
  }

  return res;
}

function ipv4Sample() {
  return '192.168.0.1';
}

function ipv6Sample() {
  return '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
}

function hostnameSample() {
  return 'example.com';
}

function uriSample() {
  return 'http://example.com';
}

function uuidSample(_min, _max, propertyName) {
  return (0, _utils.uuid)(propertyName || 'id');
}

var stringFormats = {
  'email': emailSample,
  'password': passwordSample,
  'date-time': dateTimeSample,
  'date': dateSample,
  'ipv4': ipv4Sample,
  'ipv6': ipv6Sample,
  'hostname': hostnameSample,
  'uri': uriSample,
  'uuid': uuidSample,
  'default': defaultSample
};

function sampleString(schema, options, spec, context) {
  var format = schema.format || 'default';
  var sampler = stringFormats[format] || defaultSample;
  var propertyName = context && context.propertyName;
  return sampler(schema.minLength | 0, schema.maxLength, propertyName);
}

},{"../utils":13}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clearCache = clearCache;
exports.traverse = traverse;

var _openapiSampler = require("./openapi-sampler");

var _allOf = require("./allOf");

var _infer = require("./infer");

var _utils = require("./utils");

var _jsonPointer = _interopRequireDefault(require("json-pointer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var $refCache = {}; //for circular JS references we use additional array and not object as we need to compare entire schemas and not strings

var circleCache = [];

function clearCache() {
  $refCache = {};
  circleCache = [];
}

function traverse(schema, options, spec, context) {
  //checking circular JS references by checking context 
  //because context is passed only when traversing through nested objects happens
  if (context) {
    if (circleCache.includes(schema)) return (0, _utils.getResultForCircular)((0, _infer.inferType)(schema));
    circleCache.push(schema);
  }

  if (schema.$ref) {
    if (!spec) {
      throw new Error('Your schema contains $ref. You must provide full specification in the third parameter.');
    }

    var ref = decodeURIComponent(schema.$ref);

    if (ref.startsWith('#')) {
      ref = ref.substring(1);
    }

    var referenced = _jsonPointer.default.get(spec, ref);

    var result;

    if ($refCache[ref] !== true) {
      $refCache[ref] = true;
      result = traverse(referenced, options, spec);
      $refCache[ref] = false;
    } else {
      var referencedType = (0, _infer.inferType)(referenced);
      result = (0, _utils.getResultForCircular)(referencedType);
    }

    return result;
  }

  if (schema.example !== undefined) {
    return {
      value: schema.example,
      readOnly: schema.readOnly,
      writeOnly: schema.writeOnly,
      type: schema.type
    };
  }

  if (schema.allOf !== undefined) {
    return (0, _allOf.allOfSample)(_objectSpread(_objectSpread({}, schema), {}, {
      allOf: undefined
    }), schema.allOf, options, spec);
  }

  if (schema.oneOf && schema.oneOf.length) {
    if (schema.anyOf) {
      if (!options.quiet) console.warn('oneOf and anyOf are not supported on the same level. Skipping anyOf');
    }

    return traverse(schema.oneOf[0], options, spec);
  }

  if (schema.anyOf && schema.anyOf.length) {
    return traverse(schema.anyOf[0], options, spec);
  }

  var example = null;
  var type = null;

  if (schema.default !== undefined) {
    example = schema.default;
  } else if (schema.const !== undefined) {
    example = schema.const;
  } else if (schema.enum !== undefined && schema.enum.length) {
    example = schema.enum[0];
  } else if (schema.examples !== undefined && schema.examples.length) {
    example = schema.examples[0];
  } else {
    type = schema.type;

    if (!type) {
      type = (0, _infer.inferType)(schema);
    }

    var sampler = _openapiSampler._samplers[type];

    if (sampler) {
      example = sampler(schema, options, spec, context);
    }
  }

  circleCache.pop();
  return {
    value: example,
    readOnly: schema.readOnly,
    writeOnly: schema.writeOnly,
    type: type
  };
}

},{"./allOf":3,"./infer":4,"./openapi-sampler":5,"./utils":13,"json-pointer":2}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toRFCDateTime = toRFCDateTime;
exports.ensureMinLength = ensureMinLength;
exports.mergeDeep = mergeDeep;
exports.uuid = uuid;
exports.getResultForCircular = getResultForCircular;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function pad(number) {
  if (number < 10) {
    return '0' + number;
  }

  return number;
}

function toRFCDateTime(date, omitTime, milliseconds) {
  var res = date.getUTCFullYear() + '-' + pad(date.getUTCMonth() + 1) + '-' + pad(date.getUTCDate());

  if (!omitTime) {
    res += 'T' + pad(date.getUTCHours()) + ':' + pad(date.getUTCMinutes()) + ':' + pad(date.getUTCSeconds()) + (milliseconds ? '.' + (date.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) : '') + 'Z';
  }

  return res;
}

;

function ensureMinLength(sample, min) {
  if (min > sample.length) {
    return sample.repeat(Math.trunc(min / sample.length) + 1).substring(0, min);
  }

  return sample;
}

function mergeDeep() {
  var isObject = function isObject(obj) {
    return obj && _typeof(obj) === 'object';
  };

  for (var _len = arguments.length, objects = new Array(_len), _key = 0; _key < _len; _key++) {
    objects[_key] = arguments[_key];
  }

  return objects.reduce(function (prev, obj) {
    Object.keys(obj).forEach(function (key) {
      var pVal = prev[key];
      var oVal = obj[key];

      if (isObject(pVal) && isObject(oVal)) {
        prev[key] = mergeDeep(pVal, oVal);
      } else {
        prev[key] = oVal;
      }
    });
    return prev;
  }, Array.isArray(objects[objects.length - 1]) ? [] : {});
} // deterministic UUID sampler


function uuid(str) {
  var hash = hashCode(str);
  var random = jsf32(hash, hash, hash, hash);
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = random() * 16 % 16 | 0;
    return (c == 'x' ? r : r & 0x3 | 0x8).toString(16);
  });
  return uuid;
}

function getResultForCircular(type) {
  return {
    value: type === 'object' ? {} : type === 'array' ? [] : undefined
  };
}

function hashCode(str) {
  var hash = 0;
  if (str.length == 0) return hash;

  for (var i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return hash;
}

function jsf32(a, b, c, d) {
  return function () {
    a |= 0;
    b |= 0;
    c |= 0;
    d |= 0;
    var t = a - (b << 27 | b >>> 5) | 0;
    a = b ^ (c << 17 | c >>> 15);
    b = c + d | 0;
    c = d + t | 0;
    d = a + t | 0;
    return (d >>> 0) / 4294967296;
  };
}

},{}]},{},[5])(5)
});
