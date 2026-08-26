# How we build

## The tool: tsdown

[tsdown](https://tsdown.dev) turns `src/` into a publishable `dist/`. It is built
on Rolldown and Oxc — the Rust bundler and toolchain the Vite ecosystem is moving
to — and it is the only build tool in the repo.

```bash
pnpm build                              # every package
pnpm --filter @pixel-forge/utils build  # one package
pnpm dev                                # watch mode
```

## Why a bundler at all

`tsc` alone cannot publish a library:

- It compiles file-by-file without bundling, so `_helper.ts` would ship to
  `dist/` as a separately importable file — private internals becoming public
  API by accident.
- It cannot generate the `exports` map.
- Its declaration generation is slow and does not bundle types.

## Configuration

One config per package:

```ts
export default defineConfig((inline) => {
  const validate = !inline.watch;

  return {
    entry: {
      'array/index': 'src/array/index.ts',
      // one entry per published subpath
    },
    format: ['esm'],
    platform: 'neutral',
    dts: true,
    sourcemap: true,
    exports: true,
    publint: validate,
    attw: validate && { profile: 'esm-only' },
  };
});
```

What each of the non-obvious options does:

- **`exports: true`** — the important one. tsdown derives `package.json#exports`
  from the entries above and writes it back into the file. The map therefore
  cannot disagree with what was actually emitted. Commit the result; it is part
  of the package.
- **`format: ['esm']`** — ESM-only. With no CommonJS output, tsdown also skips
  emitting the legacy `main`/`module`/`types` fields, so the `exports` map is the
  entire entry surface.
- **`platform: 'neutral'`** — do not assume Node or browser globals.
- **`dts: true`** — required explicitly. tsdown's auto-detection looks for a
  `types` field, which we do not have because our exports map is generated.
- **`publint` / `attw`** — see [how-we-validate.md](how-we-validate.md). Disabled
  in watch mode because each packs the package, which is far too slow per
  keystroke.

The build target is not configured here. tsdown reads `engines.node` from
`package.json` and targets that, which is why the engines field matters.

## What a build produces

```
dist/<domain>/index.js        bundled ESM, internals inlined
dist/<domain>/index.js.map
dist/<domain>/index.d.ts      declarations
dist/<domain>/index.d.ts.map
```

A types-only domain still emits an empty `index.js`. That is correct — the
runtime target of the export condition has to exist even if nothing imports a
value from it.

Successful output ends with three lines:

```
✔ Build complete
✔ [attw] No problems found
✔ [publint] No issues found
```

If you only see the first, validation was skipped.

## Why not tsup

This repo used tsup previously, and the switch was for two specific reasons
rather than fashion.

1. **tsup cannot generate the `exports` map.** The map had to be written by hand,
   and it drifted: it pointed at `.mjs` files while the build emitted `.js`, so
   every subpath import resolved to a missing file and the package was
   unpublishable. Nothing caught it because nothing validated the built artifact.
2. **tsup's multi-entry declaration generation was unreliable here**, failing with
   `TS6307` on internal imports not listed as entries. The previous setup worked
   around this by running `tsc` as a second pass purely for declarations — two
   tools, two configs, and generated `.d.ts` files leaking into `src/`. tsdown
   handles multi-entry declarations, so that pass is gone.

Speed was a bonus, not the reason. tsup is still a perfectly good tool.

## Declaration generation

Declarations come from `rolldown-plugin-dts`. Because
`configs/ts/tsconfig.base.json` enables `isolatedDeclarations`, tsdown uses
oxc-transform rather than falling back to the TypeScript compiler, which is
substantially faster.

The cost is that every exported symbol needs an explicit type annotation — a
function with an inferred return type will fail the build. See
[how-we-type.md](how-we-type.md).
