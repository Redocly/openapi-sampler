import { sampleString } from '../../src/samplers/string.js';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const IPV4_REGEXP = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const IPV6_REGEXP = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
const HOSTNAME_REGEXP = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;
const URI_REGEXP = new RegExp('([A-Za-z][A-Za-z0-9+\\-.]*):(?:(//)(?:((?:[A-Za-z0-9\\-._~!$&\'()*+,;=:]|%[0-9A-Fa-f]{2})*)@)?((?:\\[(?:(?:(?:(?:[0-9A-Fa-f]{1,4}:){6}|::(?:[0-9A-Fa-f]{1,4}:){5}|(?:[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){4}|(?:(?:[0-9A-Fa-f]{1,4}:){0,1}[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){3}|(?:(?:[0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){2}|(?:(?:[0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})?::[0-9A-Fa-f]{1,4}:|(?:(?:[0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})?::)(?:[0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))|(?:(?:[0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})?::[0-9A-Fa-f]{1,4}|(?:(?:[0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})?::)|[Vv][0-9A-Fa-f]+\\.[A-Za-z0-9\\-._~!$&\'()*+,;=:]+)\\]|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|(?:[A-Za-z0-9\\-._~!$&\'()*+,;=]|%[0-9A-Fa-f]{2})*))(?::([0-9]*))?((?:/(?:[A-Za-z0-9\\-._~!$&\'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*)|/((?:(?:[A-Za-z0-9\\-._~!$&\'()*+,;=:@]|%[0-9A-Fa-f]{2})+(?:/(?:[A-Za-z0-9\\-._~!$&\'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*)?)|((?:[A-Za-z0-9\\-._~!$&\'()*+,;=:@]|%[0-9A-Fa-f]{2})+(?:/(?:[A-Za-z0-9\\-._~!$&\'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*)|)(?:\\?((?:[A-Za-z0-9\\-._~!$&\'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*))?(?:\\#((?:[A-Za-z0-9\\-._~!$&\'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*))?');
const UUID_REGEXP = /^[0-9A-Fa-f]{8}(?:-[0-9A-Fa-f]{4}){3}-[0-9A-Fa-f]{12}$/;

const ajv = new Ajv({ allErrors: true, messages: true, strict: true });
addFormats(ajv);

describe('sampleString', () => {
  let res;

  it('should return "string" by default', () => {
    res = sampleString({});
    expect(res).toBe('string');
  });

  it('should return string of appropriate length if minLength specified', () => {
    res = sampleString({minLength: 20});
    expect(res.length).toBe(20);
  });

  it('should return string of appropriate length if maxLength specified', () => {
    res = sampleString({maxLength: 2});
    expect(res.length).toBe(2);
  });

  it('should return email for format email', () => {
    res = sampleString({format: 'email'});
    expect(res).toBe('user@example.com');
  });

  it('should return password for format password', () => {
    res = sampleString({format: 'password'});
    expect(res).toBe('pa$$word');
  });

  it('should return password of appropriate length if minLength specified', () => {
    res = sampleString({format: 'password', minLength: 20});
    expect(res.substring(0, 9)).toBe('pa$$word_');
    expect(res.length).toBe(20);
  });

  it('should return date string for format date', () => {
    res = sampleString({format: 'date'});
    expect(Date.parse(res)).not.toBeNaN();
  });

  it('should return deterministic date string for format date', () => {
    res = sampleString({format: 'date'});
    expect(res).toBe('2019-08-24');
  });

  it('should return date string for format date-time', () => {
    res = sampleString({format: 'date-time'});
    expect(Date.parse(res)).not.toBeNaN();
  });

  it('should return deterministic date string for format date-time', () => {
    res = sampleString({format: 'date-time'});
    expect(res).toBe('2019-08-24T14:15:22Z');
  });

  it('should not throw if incorrect maxLength applied to date-time', () => {
    res = sampleString({format: 'date-time', maxLength: 5});
    expect(res).toBe('2019-08-24T14:15:22Z');
  });

  it('should not throw if incorrect minLength applied to date-time', () => {
    res = sampleString({format: 'date-time', minLength: 100});
    expect(res).toBe('2019-08-24T14:15:22Z');
  });

  it('should return deterministic time string for format date-time', () => {
    res = sampleString({format: 'time'});
    expect(res).toBe('14:15:22Z');
  });

  it('should not throw if incorrect maxLength applied to time', () => {
    res = sampleString({format: 'time', maxLength: 5});
    expect(res).toBe('14:15:22Z');
  });

  it('should not throw if incorrect minLength applied to time', () => {
    res = sampleString({format: 'time', minLength: 100});
    expect(res).toBe('14:15:22Z');
  });

  it('should return ip for ipv4 format', () => {
    res = sampleString({format: 'ipv4'});
    expect(res).toMatch(IPV4_REGEXP);
  });

  it('should return ipv6 for ipv6 format', () => {
    res = sampleString({format: 'ipv6'});
    expect(res).toMatch(IPV6_REGEXP);
  });

  it('should return valid hostname for hostname format', () => {
    res = sampleString({format: 'hostname'});
    expect(res).toMatch(HOSTNAME_REGEXP);
  });

  it('should return valid URI for uri format', () => {
    res = sampleString({format: 'uri'});
    expect(res).toMatch(URI_REGEXP);
  });

  it('should return valid uuid for uuid format without propertyName context', () => {
    res = sampleString({format: 'uuid'});
    expect(res).toMatch(UUID_REGEXP);
    expect(res).toBe('497f6eca-6276-4993-bfeb-53cbbbba6f08');
  });

  it('should return valid uuid for uuid format with propertyName context', () => {
    res = sampleString({format: 'uuid'}, null, null, {propertyName: 'fooId'});
    expect(res).toMatch(UUID_REGEXP);
    expect(res).toBe('fb4274c7-4fcd-4035-8958-a680548957ff');
  });

  it('should generate valid text for basic regexes', () => {
    [/#{3}test[1-5]/, /[500-15000]/, /#{2,9}/, /#{5}/, /0x[0-9a-f]{40}/]
      .forEach((regexp) => {
        res = sampleString(
          {pattern: regexp.source},
          {enablePatterns: true},
          null,
          {propertyName: 'fooId'},
        );
        expect(res).toMatch(regexp);
      });
  });

  it('should return binary for format binary', () => {
    res = sampleString({format: 'binary'});
    expect(res).to.deep.equal([116, 101, 115, 116]);
  });
  
  it.each([
    'email',
    // 'idn-email', // unsupported by ajv-formats
    // 'password', // unsupported by ajv-formats
    'date-time',
    'date',
    'time',
    'ipv4',
    'ipv6',
    'hostname',
    // 'idn-hostname', // unsupported by ajv-formats
    'uri',
    'uri-reference',
    'uri-template',
    // 'iri', // unsupported by ajv-formats
    // 'iri-reference', // unsupported by ajv-formats
    'uuid',
    'json-pointer',
    'relative-json-pointer',
    'regex'
  ])('should return valid %s', (format) => {
    const schema = {type: 'string', format};
    const validate = ajv.compile(schema);
    expect(validate(sampleString(schema))).toBe(true);
  });
});
