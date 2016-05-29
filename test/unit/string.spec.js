import { sampleString } from '../../src/samplers/string';

describe('sampleString', () => {
  let res;
  it('should return "string" by default', () => {
    res = sampleString({});
    expect(res).to.equal('string');
  });

  it('should return string of appropriate length if minLength specified', () => {
    res = sampleString({minLength: 20});
    expect(res.length).to.equal(20);
  });

  it('should return string of appropriate length if maxLength specified', () => {
    res = sampleString({maxLength: 3});
    expect(res.length).to.equal(3);
  });

  it('should return email for format email', () => {
    res = sampleString({format: 'email'});
    expect(res).to.equal('user@example.com');
  });

  it('should return email for format email', () => {
    res = sampleString({format: 'email'});
    expect(res).to.equal('user@example.com');
  });

  it('should return password for format password', () => {
    res = sampleString({format: 'password'});
    expect(res).to.equal('pa$$word');
  });

  it('should return password of appropriate length if minLength specified', () => {
    res = sampleString({format: 'password', minLength: 20});
    expect(res.substring(0,9)).to.equal('pa$$word_');
    expect(res.length).to.equal(20);
  });

  it('should return date string for format date', () => {
    res = sampleString({format: 'date'});
    expect(Date.parse(res)).not.to.be.NaN;
  });

  it('should return date string for format date', () => {
    res = sampleString({format: 'date-time'});
    expect(Date.parse(res)).not.to.be.NaN;
  });

  it('should throw if incorrect maxLength applied to date-time', () => {
    res = () => sampleString({format: 'date-time', maxLength: 5});
    expect(res).to.throw();
  });

  it('should throw if incorrect minLength applied to date-time', () => {
    res = () => sampleString({format: 'date-time', minLength: 100});
    expect(res).to.throw();
  });
});
