import { compile, compileError } from './_compile';

describe('assertColor', () => {
  it('returns a color unchanged', () => {
    expect(
      compile('@use "assertion" as Assert; .x { color: Assert.assertColor(#00ff00); }'),
    ).toContain('color:');
  });

  it('rejects a non-color', () => {
    expect(
      compileError('@use "assertion" as Assert; .x { color: Assert.assertColor(1); }'),
    ).toContain('Expected a color');
  });
});

describe('assertNumber', () => {
  it('returns an unbounded number', () => {
    expect(compile('@use "assertion" as Assert; .x { z-index: Assert.assertNumber(5); }')).toBe(
      '.x {\n  z-index: 5;\n}',
    );
  });

  it('accepts a value inside min and max', () => {
    expect(
      compile('@use "assertion" as Assert; .x { z-index: Assert.assertNumber(0.5, 0, 1); }'),
    ).toBe('.x {\n  z-index: 0.5;\n}');
  });

  it('accepts the min and max bounds', () => {
    expect(
      compile('@use "assertion" as Assert; .x { z-index: Assert.assertNumber(0, 0, 1); }'),
    ).toContain('z-index: 0');
    expect(
      compile('@use "assertion" as Assert; .x { z-index: Assert.assertNumber(1, 0, 1); }'),
    ).toContain('z-index: 1');
  });

  it('accepts min-only and max-only', () => {
    expect(
      compile('@use "assertion" as Assert; .x { z-index: Assert.assertNumber(10, $min: 0); }'),
    ).toContain('z-index: 10');
    expect(
      compile('@use "assertion" as Assert; .x { z-index: Assert.assertNumber(-3, $max: 0); }'),
    ).toContain('z-index: -3');
  });

  it('rejects a non-number', () => {
    expect(
      compileError('@use "assertion" as Assert; .x { z-index: Assert.assertNumber(red); }'),
    ).toContain('Expected a number');
  });

  it('rejects a value below min', () => {
    expect(
      compileError('@use "assertion" as Assert; .x { z-index: Assert.assertNumber(-1, 0, 1); }'),
    ).toBe('Expected at least 0, got -1');
  });

  it('rejects a value above max', () => {
    expect(
      compileError('@use "assertion" as Assert; .x { z-index: Assert.assertNumber(2, 0, 1); }'),
    ).toBe('Expected at most 1, got 2');
  });

  it('rejects a non-number min', () => {
    expect(
      compileError(
        '@use "assertion" as Assert; .x { z-index: Assert.assertNumber(5, $min: "0"); }',
      ),
    ).toContain('Expected minimum to be a number');
  });

  it('rejects a non-number max', () => {
    expect(
      compileError(
        '@use "assertion" as Assert; .x { z-index: Assert.assertNumber(5, $max: "1"); }',
      ),
    ).toContain('Expected maximum to be a number');
  });
});

describe('assertInteger', () => {
  it('returns an integer unchanged', () => {
    expect(compile('@use "assertion" as Assert; .x { z-index: Assert.assertInteger(5); }')).toBe(
      '.x {\n  z-index: 5;\n}',
    );
  });

  it('accepts 0', () => {
    expect(
      compile('@use "assertion" as Assert; .x { z-index: Assert.assertInteger(0); }'),
    ).toContain('z-index: 0');
  });

  it('rejects a non-integer', () => {
    expect(
      compileError('@use "assertion" as Assert; .x { z-index: Assert.assertInteger(1.5); }'),
    ).toBe('Expected an integer, got 1.5');
  });

  it('rejects a non-number', () => {
    expect(
      compileError('@use "assertion" as Assert; .x { z-index: Assert.assertInteger(red); }'),
    ).toContain('Expected a number');
  });
});
