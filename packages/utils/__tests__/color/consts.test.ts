import {
  assertHexColor,
  assertHSLColor,
  assertRGBAColor,
  assertRGBColor,
  isHexColor,
  isHSLColor,
  isRGBAColor,
  isRGBColor,
} from '../../src/color';

describe('Color', () => {
  describe('isHexColor', () => {
    it.each([
      '#000',
      '#fff',
      '#FFF',
      '#a1b',
      '#abcd',
      '#ABCD',
      '#ff00aa',
      '#FF00AA',
      '#800080',
      '#ff00aa80',
      '#FF00AA80',
    ])('accepts %s', (value) => {
      expect(isHexColor(value)).toBe(true);
    });

    it.each([
      '',
      '#',
      '#ff',
      '#12345',
      '#1234567',
      '#gggggg',
      'fff',
      '#fff ',
      ' #fff',
      'rgb(0, 0, 0)',
    ])('rejects %s', (value) => {
      expect(isHexColor(value)).toBe(false);
    });
  });

  describe('isRGBColor', () => {
    it.each([
      'rgb(0,0,0)',
      'rgb(255, 255, 255)',
      'rgb( 10 , 20 , 30 )',
      'rgb(0, 128, 255)',
    ])('accepts %s', (value) => {
      expect(isRGBColor(value)).toBe(true);
    });

    it.each([
      'rgb(256, 0, 0)',
      'RGB(0, 0, 0)',
      'rgb(0, 0, 0, 1)',
      'rgb(01, 0, 0)',
      'rgb(1.5, 0, 0)',
      'rgba(0, 0, 0, 1)',
      'rgb()',
    ])('rejects %s', (value) => {
      expect(isRGBColor(value)).toBe(false);
    });
  });

  describe('isRGBAColor', () => {
    it.each([
      'rgba(0,0,0,0)',
      'rgba(255, 255, 255, 1)',
      'rgba(0, 0, 0, 0.5)',
      'rgba(0, 0, 0, .5)',
      'rgba( 1 , 2 , 3 , 0.25 )',
    ])('accepts %s', (value) => {
      expect(isRGBAColor(value)).toBe(true);
    });

    it.each([
      'rgba(0, 0, 0)',
      'rgba(0, 0, 0, 1.0)',
      'rgba(0, 0, 0, 2)',
      'rgba(256, 0, 0, 1)',
      'RGBA(0, 0, 0, 1)',
      'rgb(0, 0, 0)',
    ])('rejects %s', (value) => {
      expect(isRGBAColor(value)).toBe(false);
    });
  });

  describe('isHSLColor', () => {
    it.each([
      'hsl(0, 0%, 0%)',
      'hsl(360, 100%, 100%)',
      'hsl(180,50%,50%)',
      'hsl( 90 , 10% , 20% )',
    ])('accepts %s', (value) => {
      expect(isHSLColor(value)).toBe(true);
    });

    it.each([
      'hsl(361, 0%, 0%)',
      'hsl(0, 0, 0)',
      'hsl(0, 101%, 0%)',
      'HSL(0, 0%, 0%)',
      'hsla(0, 0%, 0%, 1)',
    ])('rejects %s', (value) => {
      expect(isHSLColor(value)).toBe(false);
    });
  });

  describe('assertHexColor', () => {
    it('returns a valid hex color', () => {
      expect(assertHexColor('#800080')).toBe('#800080');
    });

    it('throws on an invalid hex color', () => {
      expect(() => assertHexColor('red')).toThrow('Invalid HEX color received: red');
    });
  });

  describe('assertRGBColor', () => {
    it('returns a valid rgb color', () => {
      expect(assertRGBColor('rgb(0, 128, 255)')).toBe('rgb(0, 128, 255)');
    });

    it('throws on an invalid rgb color', () => {
      expect(() => assertRGBColor('rgb(256, 0, 0)')).toThrow(
        'Invalid RGB color received: rgb(256, 0, 0)',
      );
    });
  });

  describe('assertRGBAColor', () => {
    it('returns a valid rgba color', () => {
      expect(assertRGBAColor('rgba(0, 0, 0, 0.5)')).toBe('rgba(0, 0, 0, 0.5)');
    });

    it('throws on an invalid rgba color', () => {
      expect(() => assertRGBAColor('rgba(0, 0, 0)')).toThrow(
        'Invalid RGBA color received: rgba(0, 0, 0)',
      );
    });
  });

  describe('assertHSLColor', () => {
    it('returns a valid hsl color', () => {
      expect(assertHSLColor('hsl(180, 50%, 50%)')).toBe('hsl(180, 50%, 50%)');
    });

    it('throws on an invalid hsl color', () => {
      expect(() => assertHSLColor('hsl(0, 0, 0)')).toThrow(
        'Invalid HSL color received: hsl(0, 0, 0)',
      );
    });
  });
});
