# How we add a package

A walkthrough for a new library. The example is a hypothetical
`@pixel-forge/log` with two domains, `browser` and `node`.

Read [how-we-structure-packages.md](how-we-structure-packages.md) first — this
document is the mechanical steps, that one is the reasoning.

## 1. Check the name is free

```bash
npm view @pixel-forge/log
```

A 404 means available.

## 2. Create the directory

```
packages/log/
  src/
    browser/index.ts
    node/index.ts
  __tests__/
    browser/index.test.ts
  package.json
  tsconfig.json
  tsdown.config.ts
  vitest.config.ts
  README.md
```

## 3. package.json

No `exports` field — tsdown generates it. No `lint` script — linting is
workspace-wide.

```json
{
  "name": "@pixel-forge/log",
  "version": "0.0.0",
  "description": "Console logging and log reporting.",
  "license": "MIT",
  "type": "module",
  "sideEffects": false,
  "repository": {
    "type": "git",
    "url": "git+https://github.com/pixel-forge/Pixel-Forge.git",
    "directory": "packages/log"
  },
  "homepage": "https://github.com/pixel-forge/Pixel-Forge/tree/main/packages/log#readme",
  "bugs": "https://github.com/pixel-forge/Pixel-Forge/issues",
  "files": ["dist"],
  "scripts": {
    "clean": "rimraf dist",
    "build": "tsdown",
    "dev": "tsdown --watch",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "publishConfig": { "access": "public" },
  "engines": { "node": ">=22.12.0" }
}
```

Keep `engines.node` consistent with the other packages — tsdown reads it to pick
the build target, so an inconsistent value silently changes output.

## 4. tsconfig.json

Paths here, never in the shared config:

```json
{
  "extends": "../../configs/ts/tsconfig.package.json",
  "include": ["src/**/*.ts", "__tests__/**/*.ts"],
  "exclude": ["dist", "node_modules"]
}
```

## 5. tsdown.config.ts

One entry per domain. This is the file that defines the public API, since the
`exports` map is generated from it.

```ts
import { defineConfig } from 'tsdown';

export default defineConfig((inline) => {
  const validate = !inline.watch;

  return {
    entry: {
      'browser/index': 'src/browser/index.ts',
      'node/index': 'src/node/index.ts',
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

## 6. vitest.config.ts

```ts
import { defineConfig, mergeConfig } from 'vitest/config';
import { baseTestConfig } from '../../configs/test/vitest.base.ts';

export default mergeConfig(baseTestConfig, defineConfig({}));
```

## 7. Depending on another package

```bash
pnpm --filter @pixel-forge/log add @pixel-forge/utils@workspace:^
```

The `workspace:^` protocol links the local source during development, and
Changesets rewrites it to a real range at publish time.

For something the consumer already owns, use a peer instead and keep it out of the
bundle:

```json
{ "peerDependencies": { "react": ">=18" } }
```

```ts
deps: {
  neverBundle: ['react'];
}
```

## 8. Install and verify

```bash
pnpm install
pnpm --filter @pixel-forge/log build
```

Confirm the generated `exports` map in `package.json` matches your entries, then
run the full pipeline:

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm format
```

## 9. Write the README

It is the npm landing page. Cover what the package is for, the subpaths and what
each exposes, and the ESM-only requirements. Use
[packages/utils/README.md](../packages/utils/README.md) as the template.

## 10. Register it

- Add a row to the package table in the [root README](../README.md).
- Update the dependency graph in [docs/project-plan.md](../docs/project-plan.md)
  if the new package changes it.

## 11. Changeset

```bash
pnpm changeset
```

Pick `minor` for a first release, which takes `0.0.0` to `0.1.0`.

## 12. Before the first publish

Run the packaging smoke tests in [how-we-validate.md](how-we-validate.md). A first
publish cannot be undone, and a green build is not the same as a consumable
package.

## Design notes for specific package types

**Anything holding state** — a logger's global level, a drag manager, a registry —
should hold exactly one instance per document or process. This is a large part of
why the repo is ESM-only: a dual CommonJS build lets a consumer load two copies
with separate state, and the resulting bugs are extremely hard to diagnose.

**Anything React-shaped** should be split into a framework-agnostic core and a
thin React binding, in separate domains or separate packages. That is the plan for
both `search` and `dnd`. It keeps the logic testable without a renderer and usable
by someone who is not on React.
