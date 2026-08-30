# @pixel-forge/log

Console logging and (later) log reporting for Pixel Forge. ESM-only. Depends on
`@pixel-forge/utils`.

Design intent and phased plan: [PLAN.md](./PLAN.md).

## Install

```bash
npm i @pixel-forge/log
```

## Import surface

Shared types and constants live at the package root. Environment loggers are
separate subpaths so importing one cannot pull another:

```ts
import { LogLevel, type LogParcel } from '@pixel-forge/log';
import { BrowserLogger } from '@pixel-forge/log/browser-logger';
import { NodeLogger } from '@pixel-forge/log/node-logger';
```

| Subpath          | Exposes                                      |
| ---------------- | -------------------------------------------- |
| `.` (root)       | Shared `LogLevel`, `LogParcel`, and related types |
| `browser-logger` | `BrowserLogger` only                         |
| `node-logger`    | `NodeLogger` only                            |

The `Logger` base class is internal to the package (not importable).

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
