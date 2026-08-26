import { defineConfig } from 'tsdown';

export default defineConfig((inline) => {
  // publint/attw each pack the package, which is too slow to run on every
  // rebuild while watching.
  const validate = !inline.watch;

  return {
    entry: {
      'array/index': 'src/array/index.ts',
      'object/index': 'src/object/index.ts',
      'timing/index': 'src/timing/index.ts',
      'types/index': 'src/types/index.ts',
    },
    format: ['esm'],
    platform: 'neutral',
    dts: true,
    sourcemap: true,
    // Derives package.json "exports" from the entries above, so the map can
    // never drift from what was actually emitted.
    exports: true,
    publint: validate,
    attw: validate && { profile: 'esm-only' },
  };
});
