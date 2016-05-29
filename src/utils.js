'use strict';

function pad(number) {
  if (number < 10) {
    return '0' + number;
  }
  return number;
}

export function toRFCDateTime(date, omitTime) {
  var res = date.getUTCFullYear() +
    '-' + pad(date.getUTCMonth() + 1) +
    '-' + pad(date.getUTCDate());
  if (!omitTime) {
    res += 'T' + pad(date.getUTCHours()) +
    ':' + pad(date.getUTCMinutes()) +
    ':' + pad(date.getUTCSeconds()) +
    '.' + (date.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
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

export function defaults(target, src) {
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
