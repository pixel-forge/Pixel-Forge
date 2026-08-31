import { compile, compileError } from './_compile';

describe('paletteBuilder', () => {
  it('returns n tints, exclusive of white', () => {
    expect(
      compile(
        '@use "sass:meta"; @use "palette" as Palette; .x { --p: #{meta.inspect(Palette.paletteBuilder(#f00, 4))}; }',
      ),
    ).toBe('.x {\n  --p: red rgb(100%, 25%, 25%) rgb(100%, 50%, 50%) rgb(100%, 75%, 75%);\n}');
  });

  it('returns the base color when steps is 1', () => {
    expect(
      compile(
        '@use "sass:list"; @use "palette" as Palette; .x { z-index: list.length(Palette.paletteBuilder(#f00, 1)); }',
      ),
    ).toContain('z-index: 1');
  });

  it('rejects a non-color base', () => {
    expect(
      compileError('@use "palette" as Palette; .x { --p: #{Palette.paletteBuilder(1, 3)}; }'),
    ).toContain('Expected a color');
  });

  it('rejects a step count below 1', () => {
    expect(
      compileError('@use "palette" as Palette; .x { --p: #{Palette.paletteBuilder(#f00, 0)}; }'),
    ).toBe('Expected at least 1, got 0');
  });

  it('rejects a non-integer step count', () => {
    expect(
      compileError('@use "palette" as Palette; .x { --p: #{Palette.paletteBuilder(#f00, 1.5)}; }'),
    ).toBe('Expected an integer, got 1.5');
  });
});
