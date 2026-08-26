# How we type

## Running the check

```bash
pnpm typecheck                              # every package
pnpm --filter @pixel-forge/utils typecheck  # one package
```

This is `tsc --noEmit`. TypeScript never emits anything in this repo — tsdown
produces both the JavaScript and the declarations. `tsc` is purely a checker.

## Configuration layout

```
configs/ts/tsconfig.base.json      compiler options, shared by everything
configs/ts/tsconfig.package.json   extends base, adds package-wide options
packages/<name>/tsconfig.json      extends package config, declares paths
```

**Shared configs must not contain `include` or `exclude`.** Those paths resolve
relative to the file that declares them, not the file that extends it — so an
`include` of `src/**/*.ts` in `configs/ts/` looks for `configs/ts/src`, finds
nothing, and fails with `TS18003`. Paths belong in the per-package config, which
is also why `rootDir` is absent: it serves no purpose when nothing is emitted, and
it conflicts with including `__tests__`.

Tests are included in the typecheck deliberately. Type errors in tests are still
type errors, and Vitest itself does not check types.

## Notable compiler options

Beyond `strict`, three options shape how you write code here:

**`isolatedDeclarations`** requires that a declaration file be derivable from a
single source file without cross-file inference. Practically: every exported
function needs an explicit return type.

```ts
// fails
export function isEmptyObject<T extends object>(obj: T) { ... }

// passes
export function isEmptyObject<T extends object>(obj: T): boolean { ... }
```

This is not pedantry — it is what lets tsdown generate declarations with
oxc-transform instead of the TypeScript compiler. It also makes the public API
explicit at the definition site rather than something you have to infer.

**`erasableSyntaxOnly`** bans TypeScript constructs that emit runtime code:
`enum`, `namespace`, and parameter properties. Everything we write must be
removable by a type-stripping transform. This keeps us honest about staying close
to plain JavaScript, and it is a hard requirement for oxc-based declaration
generation.

Use `const` objects and union types instead of `enum`:

```ts
export const Level = { debug: 'debug', info: 'info' } as const;
export type Level = (typeof Level)[keyof typeof Level];
```

**`verbatimModuleSyntax`** means import and export statements are emitted exactly
as written, so type-only imports must say so. The
`@typescript-eslint/consistent-type-imports` rule enforces the `import type` form
for you.

Also on: `noUncheckedIndexedAccess` (so `arr[0]` is `T | undefined`),
`noImplicitOverride`, and `noFallthroughCasesInSwitch`.

## TypeScript version policy

We pin **TypeScript 6.0.x** with a tilde range, deliberately not 7.x.

TypeScript 7 is the Go rewrite and is roughly ten times faster, but it shipped
without a stable programmatic API — that is deferred to 7.1. Tools that drive the
compiler as a library cannot use it yet, and `typescript-eslint` declares
`typescript: ">=4.8.4 <6.1.0"`, so adopting 7 would mean giving up linting.

Revisit after 7.1 lands and `typescript-eslint` widens its peer range. Until then,
a tilde range on 6.0 keeps us on patches without an accidental jump.

## What consumers need

Our packages are only resolvable by a `moduleResolution` that understands
`exports`: `bundler` (TypeScript 5.0+), or `node16`/`nodenext` (4.7+). Plain
`node`/`node10` cannot resolve subpath exports at all.

One sharp edge worth knowing when someone reports a problem: a consumer whose own
file is CommonJS needs `module: nodenext`, not `node16`. `nodenext` models Node's
`require(esm)` and accepts a static import; `node16` rejects it with `TS1479` and
suggests a dynamic import — even though the runtime handles it fine. That is
TypeScript being conservative, not a fault in our packaging.
