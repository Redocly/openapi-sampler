(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.OpenAPISampler = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mergeAllOf = mergeAllOf;

var _utils = require('./utils');

function mergeAllOf(schema) {
  merge(schema, schema.allOf);
  schema.allOf = null;
};

function merge(into, schemas) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = schemas[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var subSchema = _step.value;

      if (into.type && subSchema.type && into.type !== subSchema.type) {
        var errMessage = 'allOf merging: schemas with different types can\'t be merged';
        throw new Error(errMessage);
      }
      if (into.type === 'array') {
        throw new Error('allOf merging: subschemas with type array are not supported yet');
      }
      into.type = into.type || subSchema.type;
      if (into.type === 'object' && subSchema.properties) {
        into.properties || (into.properties = {});
        Object.assign(into.properties, subSchema.properties);
      }

      // TODO merging constrains: maximum, minimum, etc.
      (0, _utils.defaults)(into, subSchema);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

},{"./utils":10}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._samplers = undefined;
exports.sample = sample;
exports._registerSampler = _registerSampler;

var _traverse = require('./traverse');

var _index = require('./samplers/index');

var _normalize = require('./normalize');

var _samplers = exports._samplers = {};

var defaults = {
  skipReadOnly: false
};

function sample(schema, options) {
  var opts = Object.assign(defaults, options);
  return (0, _traverse.traverse)(schema, opts);
};

function _registerSampler(type, sampler) {
  _samplers[type] = sampler;
};

_registerSampler('array', _index.sampleArray);
_registerSampler('boolean', _index.sampleBoolean);
_registerSampler('integer', _index.sampleNumber);
_registerSampler('number', _index.sampleNumber);
_registerSampler('object', _index.sampleObject);
_registerSampler('string', _index.sampleString);

},{"./normalize":1,"./samplers/index":5,"./traverse":9}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sampleArray = sampleArray;

var _traverse = require('../traverse');

function sampleArray(schema) {
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
    var sample = (0, _traverse.traverse)(itemSchema);
    res.push(sample);
  }
  return res;
}

},{"../traverse":9}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sampleBoolean = sampleBoolean;
function sampleBoolean(schema) {
  return true; // let be optimistic :)
}

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _array = require('./array');

Object.defineProperty(exports, 'sampleArray', {
  enumerable: true,
  get: function get() {
    return _array.sampleArray;
  }
});

var _boolean = require('./boolean');

Object.defineProperty(exports, 'sampleBoolean', {
  enumerable: true,
  get: function get() {
    return _boolean.sampleBoolean;
  }
});

var _number = require('./number');

Object.defineProperty(exports, 'sampleNumber', {
  enumerable: true,
  get: function get() {
    return _number.sampleNumber;
  }
});

var _object = require('./object');

Object.defineProperty(exports, 'sampleObject', {
  enumerable: true,
  get: function get() {
    return _object.sampleObject;
  }
});

var _string = require('./string');

Object.defineProperty(exports, 'sampleString', {
  enumerable: true,
  get: function get() {
    return _string.sampleString;
  }
});

},{"./array":3,"./boolean":4,"./number":6,"./object":7,"./string":8}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sampleNumber = sampleNumber;
function sampleNumber(schema) {
  var res = void 0;
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

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.sampleObject = sampleObject;

var _traverse = require('../traverse');

function sampleObject(schema) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var res = {};
  if (schema && _typeof(schema.properties) === 'object') {
    Object.keys(schema.properties).forEach(function (propertyName) {
      if (options.skipReadOnly && schema.properties[propertyName].readOnly) {
        return;
      }
      res[propertyName] = (0, _traverse.traverse)(schema.properties[propertyName], options);
    });
  }
  if (schema && _typeof(schema.additionalProperties) === 'object') {
    res.property1 = (0, _traverse.traverse)(schema.additionalProperties, options);
    res.property2 = (0, _traverse.traverse)(schema.additionalProperties, options);
  }
  return res;
}

},{"../traverse":9}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sampleString = sampleString;

var _utils = require('../utils');

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
  var res = (0, _utils.toRFCDateTime)(new Date(), omitTime, false);
  if (res.length < min) {
    throw Erorr('Using minLength = ' + min + ' is incorrect with format "date-time"');
  }
  if (max && res.length > max) {
    throw Erorr('Using maxLength = ' + max + ' is incorrect with format "date-time"');
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

var stringFormats = {
  'email': emailSample,
  'password': passwordSample,
  'date-time': dateTimeSample,
  'date': dateSample,
  'ipv4': ipv4Sample,
  'ipv6': ipv6Sample,
  'hostname': hostnameSample,
  'uri': uriSample,
  'default': defaultSample
};

function sampleString(schema) {
  var format = schema.format || 'default';
  var sampler = stringFormats[format] || defaultSample;
  return sampler(schema.minLength | 0, schema.maxLength);
}

},{"../utils":10}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.traverse = traverse;

var _openapiSampler = require('./openapi-sampler');

var _normalize = require('./normalize');

function traverse(schema, options) {
  if (schema.allOf) {
    (0, _normalize.mergeAllOf)(schema);
  }

  if (schema.example != null) {
    return schema.example;
  }

  if (schema.default != null) {
    return schema.default;
  }

  if (schema.enum && schema.enum.length) {
    return schema.enum[0];
  }

  var type = schema.type;
  var sampler = _openapiSampler._samplers[type];
  if (sampler) return sampler(schema, options);
  return null;
}

},{"./normalize":1,"./openapi-sampler":2}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toRFCDateTime = toRFCDateTime;
exports.ensureMinLength = ensureMinLength;
exports.defaults = defaults;
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
};

function ensureMinLength(sample, min) {
  if (min > sample.length) {
    return sample.repeat(Math.trunc(min / sample.length) + 1).substring(0, min);
  }
  return sample;
}

function defaults(target, src) {
  var props = Object.keys(src);

  var index = -1;
  var length = props.length;

  while (++index < length) {
    var key = props[index];
    if (target[key] === undefined) {
      target[key] = src[key];
    }
  }
  return target;
}

},{}]},{},[2])(2)
});