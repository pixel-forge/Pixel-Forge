import { defineConfig } from 'tsup';

export default defineConfig((override) => ({
  entry: {
    // subpaths (mirror package.json "exports")
    'array/index': 'src/array/index.ts',
    'object/index': 'src/object/index.ts',
    'timing/index': 'src/timing/index.ts',
    // types-only subpath: still needs a TS entry so .d.ts is emitted
    'types/index': 'src/types/index.ts'
  },
  format: ['esm', 'cjs'],          // dual output for broad compatibility
  dts: true,                        // emits .d.ts for every entry (including /types)
  clean: true,                      // clears dist before build
  sourcemap: true,                  // easier debugging for consumers
  treeshake: true,                  // strip unused exports
  target: 'es2022',                 // match tsconfig + repo baseline (Node 20+)
  minify: false,                    // leave readable; consumers can minify
  outDir: 'dist',
  splitting: false,                 // keep one file per entry (predictable subpaths)
  skipNodeModulesBundle: true,      // leave deps external (we aim for zero runtime deps)
  external: [],                     // add runtime deps here if we ever introduce any
  // nice-to-haves
  onSuccess: override.watch ? 'echo "🟢 utils rebuilt"' : undefined,
}));