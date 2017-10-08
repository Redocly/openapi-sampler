'use strict';

function pad(number) {
  if (number < 10) {
    return '0' + number;
  }
  return number;
}

export function toRFCDateTime(date, omitTime, milliseconds) {
  var res = date.getUTCFullYear() +
    '-' + pad(date.getUTCMonth() + 1) +
    '-' + pad(date.getUTCDate());
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
