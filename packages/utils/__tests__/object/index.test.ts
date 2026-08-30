import { isPlainObject } from '../../src/object';

describe('isPlainObject', () => {
  it('plain object', () => {
    expect(isPlainObject({ a: 1 })).toEqual(true);
  });
  it('null prototype', () => {
    expect(isPlainObject(Object.create(null))).toEqual(true);
  });
  it('null', () => {
    expect(isPlainObject(null)).toEqual(false);
  });
  it('array', () => {
    expect(isPlainObject([])).toEqual(false);
  });
  it('host objects', () => {
    expect(isPlainObject(new Error())).toEqual(false);
    expect(isPlainObject(new Date())).toEqual(false);
    expect(isPlainObject(/x/)).toEqual(false);
  });
});
