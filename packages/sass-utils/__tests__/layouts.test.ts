import { compile, compileError } from './_compile';

describe('auto-grid', () => {
  it('emits a wrapping grid with namespaced CSS variables', () => {
    expect(compile('@use "layouts" as Layouts; .x { @include Layouts.auto-grid(12rem); }')).toBe(
      [
        '.x {',
        '  --auto-grid-min-col-width: 12rem;',
        '  --auto-grid-gap: 1rem;',
        '  display: grid;',
        '  gap: var(--auto-grid-gap);',
        '  grid-template-columns: repeat(auto-fit, minmax(min(var(--auto-grid-min-col-width), 100%), 1fr));',
        '}',
      ].join('\n'),
    );
  });

  it('accepts an explicit gap', () => {
    expect(
      compile('@use "layouts" as Layouts; .x { @include Layouts.auto-grid(200px, 0); }'),
    ).toContain('--auto-grid-gap: 0;');
  });

  it('rejects a non-positive min-width', () => {
    expect(compileError('@use "layouts" as Layouts; .x { @include Layouts.auto-grid(0px); }')).toBe(
      'Expected a positive CSS size, got 0px',
    );
  });

  it('rejects a unitless min-width', () => {
    expect(compileError('@use "layouts" as Layouts; .x { @include Layouts.auto-grid(12); }')).toBe(
      'Expected a CSS size, got number: 12',
    );
  });

  it('rejects a negative gap', () => {
    expect(
      compileError('@use "layouts" as Layouts; .x { @include Layouts.auto-grid(12rem, -1px); }'),
    ).toBe('Expected at least 0, got -1px');
  });
});
