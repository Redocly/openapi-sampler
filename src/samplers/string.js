'use strict';

import { ensureMinLength, toRFCDateTime, uuid } from '../utils';

const passwordSymbols = 'qwerty!@#$%^123456';

function emailSample() {
  return 'user@example.com';
}

function passwordSample(min, max) {
  let res = 'pa$$word';
  if (min > res.length) {
    res += '_';
    res += ensureMinLength(passwordSymbols, min - res.length).substring(0, min - res.length);
  }
  return res;
}

function commonDateTimeSample(min, max, omitTime) {
  let res = toRFCDateTime(new Date('2019-08-24T14:15:22.123Z'), omitTime, false);
  if (res.length < min) {
    console.warn(`Using minLength = ${min} is incorrect with format "date-time"`);
  }
  if (max && res.length > max) {
    console.warn(`Using maxLength = ${max} is incorrect with format "date-time"`);
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
  let res = ensureMinLength('string', min);
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
  return uuid(propertyName || 'id');
}

const stringFormats = {
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

export function sampleString(schema, options, spec, context) {
  let format = schema.format || 'default';
  let sampler = stringFormats[format] || defaultSample;
  let propertyName = context && context.propertyName;
  return sampler(schema.minLength | 0, schema.maxLength, propertyName);
}
