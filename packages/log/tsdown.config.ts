import { defineConfig } from 'tsdown';

export default defineConfig((inline) => {
  // publint/attw each pack the package, which is too slow to run on every
  // rebuild while watching.
  const validate = !inline.watch;

  return {
    entry: {
      index: 'src/index.ts',
      'browser-logger/index': 'src/logger/browser-logger/index.ts',
      'node-logger/index': 'src/logger/node-logger/index.ts',
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
