import { sampleObject} from '../../src/samplers/object';

describe('sampleObject', () => {
  let res;
  it('should return emtpy object by default', () => {
    res = sampleObject({});
    expect(res).to.deep.equal({});
  });

  it('should instantiate all properties', () => {
    res = sampleObject({properties: {
      a: {type: 'string'},
      b: {type: 'integer'}
    }});
    expect(res).to.deep.equal({
      a: 'string',
      b: 0
    });
  });

  it('should skip readonly properties if skipReadOnly=treu', () => {
    res = sampleObject({properties: {
      a: {type: 'string'},
      b: {type: 'integer', readOnly: true}
    }}, {skipReadOnly: true});
    expect(res).to.deep.equal({
      a: 'string'
    });
  });
});
