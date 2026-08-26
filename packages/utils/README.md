# @pixel-forge/utils

General TypeScript utilities and types, shared across the Pixel Forge libraries
and usable on their own. No runtime dependencies.

This is the foundation package — most other `@pixel-forge/*` libraries build on
it. It stays deliberately small and close to plain TypeScript: helpers for things
the standard library leaves awkward, and nothing that wraps something already
ergonomic.

## Install

```bash
npm i @pixel-forge/utils
```

## Import surface

There is no root entry point. You import from the subpath you need, which means
importing one area can never pull in another:

```ts
import { lastArrayElement } from '@pixel-forge/utils/array';
```

| Subpath  | Exposes                                                    |
| -------- | ---------------------------------------------------------- |
| `array`  | Helpers for reading and manipulating arrays                |
| `object` | Helpers for inspecting and transforming plain objects      |
| `timing` | Time and scheduling helpers, such as promise-based delays  |
| `types`  | Reusable type-level utilities. Types only, no runtime code |

Each subpath ships its own types, so your editor will list what is available.

## Requirements

**ESM-only** — there is no CommonJS build.

- **`import`** works on any Node with `exports` support, and in any modern
  bundler (Vite, webpack 5+, Rollup, esbuild, Parcel 2+, Metro 0.82+).
- **`require()`** works on **Node 22.12+** through Node's `require(esm)`. You
  receive a module namespace object, so read the named export off it rather than
  using the module itself as a value.

### TypeScript

Use a `moduleResolution` of `bundler`, `nodenext`, or `node16`. Plain
`node`/`node10` cannot resolve subpath exports.

If your own file is CommonJS, use `module: nodenext` — it understands that Node
can `require()` an ES module. `node16` rejects the import with TS1479 even though
it works at runtime.

### Jest

Jest needs ESM support turned on, still true as of Jest 30.4:

```bash
NODE_OPTIONS=--experimental-vm-modules npx jest
```

## License

MIT
