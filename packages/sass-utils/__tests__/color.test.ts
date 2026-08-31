import { compile, compileError } from './_compile';

describe('colorWithAlpha', () => {
  it('applies alpha to an rgb color', () => {
    expect(compile('@use "color" as Color; .x { color: Color.colorWithAlpha(#000, 0.5); }')).toBe(
      '.x {\n  color: rgba(0, 0, 0, 0.5);\n}',
    );
  });

  it('defaults alpha to 1', () => {
    expect(compile('@use "color" as Color; .x { color: Color.colorWithAlpha(#ff0000); }')).toBe(
      '.x {\n  color: rgb(255, 0, 0);\n}',
    );
  });

  it('reads channels in rgb space from a non-rgb color', () => {
    expect(
      compile('@use "color" as Color; .x { color: Color.colorWithAlpha(hsl(120, 50%, 40%), 0); }'),
    ).toBe('.x {\n  color: rgba(20%, 60%, 20%, 0);\n}');
  });

  it('rejects a non-color', () => {
    expect(compileError('@use "color" as Color; .x { color: Color.colorWithAlpha(1); }')).toContain(
      'Expected a color',
    );
  });

  it('rejects alpha below 0', () => {
    expect(
      compileError('@use "color" as Color; .x { color: Color.colorWithAlpha(#000, -0.1); }'),
    ).toBe('Expected at least 0, got -0.1');
  });

  it('rejects alpha above 1', () => {
    expect(
      compileError('@use "color" as Color; .x { color: Color.colorWithAlpha(#000, 1.1); }'),
    ).toBe('Expected at most 1, got 1.1');
  });
});
