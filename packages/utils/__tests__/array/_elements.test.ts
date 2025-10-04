import { lastArrayElement } from '../../src/array';

describe('Array elements', () => {
  it('Last element', () => {
    expect(lastArrayElement([1, 2, 3])).toEqual(3);
  });
  it('Last element - Empty array', () => {
    expect(lastArrayElement([])).toEqual(undefined);
  });
});