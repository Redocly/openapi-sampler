'use strict';

export const MARKED_FOR_REMOVAL = {
  time: new Date() // some unique identifier
};

function pad(number) {
  if (number < 10) {
    return '0' + number;
  }
  return number;
}

/**
 * Removes all properties which have MARKED_FOR_REMOVAL as their reference.
 *
 * Samplers mark properties for removal depending on the configuration
 * (skipNonRequired=true, skipReadOnly=true, skipWriteOnly=true). This is necessary as the
 * mentioned configurations are otherwise lost when the object is a direct or indirect child
 * of an allOf block.
 */
export function removeForRemovalMarkedProperties(sample) {
  if (sample !== null && sample !== undefined && typeof sample === 'object') {
    Object.keys(sample).forEach(key => {
      if (sample[key] !== undefined && typeof sample[key] === 'object') {
        if (sample[key] === MARKED_FOR_REMOVAL) {
          delete sample[key];
          return sample;
        }
        return removeForRemovalMarkedProperties(sample[key]);
      }
    });
  }
  return sample;
};

/**
 * Filters an objects keys to only include keys which are present in
 * a blueprint object.
 *
 * @param blueprint reference object which holds all allowed keys
 * @param check object for which keys are filtered by the blueprint
 * @returns filtered object
 */
export function filterDeep(blueprint, check) {
  // filter out invalid blueprints
  if (blueprint === undefined || blueprint === null || !Object.keys(blueprint).length) {
    return check;
  }

  return Object.assign(...Object.keys(blueprint).map(key => {
    if (typeof blueprint[key] === 'object' && typeof check[key] === 'object') {
      if(check[key] === MARKED_FOR_REMOVAL) {
        return { [key]: check[key] }
      }

      let childDeepFilter = filterDeep(blueprint[key], check[key]);
      return Object.keys(childDeepFilter).length ? { [key]: childDeepFilter } : {};
    }

    if(key in check) {
      return {[key]: check[key]};
    }

    return {};
  }));
}

export function toRFCDateTime(date, omitTime, omitDate, milliseconds) {
  var res = omitDate ? '' : (date.getUTCFullYear() +
    '-' + pad(date.getUTCMonth() + 1) +
    '-' + pad(date.getUTCDate()));
  if (!omitTime) {
    res += 'T' + pad(date.getUTCHours()) +
      ':' + pad(date.getUTCMinutes()) +
      ':' + pad(date.getUTCSeconds()) +
      (milliseconds ? '.' + (date.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) : '') +
      'Z';
  }
  return res;
};

export function ensureMinLength(sample, min) {
  if (min > sample.length) {
    return sample.repeat(Math.trunc(min / sample.length) + 1).substring(0, min);
  }
  return sample;
}

export function mergeDeep(...objects) {
  const isObject = obj => obj && typeof obj === 'object';

  return objects.reduce((prev, obj) => {
    Object.keys(obj || {}).forEach(key => {
      const pVal = prev[key];
      const oVal = obj[key];

      if (isObject(pVal) && isObject(oVal)) {
        prev[key] = mergeDeep(pVal, oVal);
      } else {
        if (prev[key] === MARKED_FOR_REMOVAL) {
          // do nothing. MARKED_FOR_REMOVAL will be filtered out later
          // before returning the sampling result.
        } else {
          prev[key] = oVal;
        }
      }
    });

    return prev;
  }, Array.isArray(objects[objects.length - 1]) ? [] : {});
}

// deterministic UUID sampler

export function uuid(str) {
  var hash = hashCode(str);
  var random = jsf32(hash, hash, hash, hash);
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    var r = (random() * 16) % 16 | 0;
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}

export function getResultForCircular(type) {
  return {
    value: type === 'object' ?
        {}
      : type === 'array' ? [] : undefined
  };
}

export function popSchemaStack(seenSchemasStack, context) {
  if (context) seenSchemasStack.pop();
}

function hashCode(str) {
  var hash = 0;
  if (str.length == 0) return hash;
  for (var i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

function jsf32(a, b, c, d) {
  return function () {
    a |= 0; b |= 0; c |= 0; d |= 0;
    var t = a - (b << 27 | b >>> 5) | 0;
    a = b ^ (c << 17 | c >>> 15);
    b = c + d | 0;
    c = d + t | 0;
    d = a + t | 0;
    return (d >>> 0) / 4294967296;
  }
}
