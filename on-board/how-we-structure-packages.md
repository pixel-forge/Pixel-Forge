# How we structure packages

## Anatomy of a package

```
packages/<name>/
  src/
    <domain>/
      index.ts        the public surface of this subpath
      _helper.ts      internal, underscore-prefixed, never exported
  __tests__/
    <domain>/
      _helper.test.ts
  package.json
  tsconfig.json
  tsdown.config.ts
  vitest.config.ts
  README.md
```

Each directory under `src/` is a **domain**, and each domain becomes one published
subpath. Files prefixed with `_` are internal: they get bundled into the domain's
output rather than shipped as separately importable files.

## Subpaths, not barrels

There is deliberately no root entry point. Consumers import
`@pixel-forge/utils/array`, never `@pixel-forge/utils`.

This is the main reason our packages do not bloat consumer bundles. `sideEffects:
false` plus tree-shaking would get you most of the way, but it depends on the
consumer's bundler doing its job. Subpaths are a structural guarantee instead: if
`/timing` is not reachable from `/array`, no bundler can include it, however
badly configured. It also means a consumer on an old toolchain gets the same
benefit as one on Vite.

Practical consequences:

- Adding a domain means adding an entry in `tsdown.config.ts`. The `exports` map
  regenerates from those entries, so you never hand-edit it.
- Do not import across domains inside `src/`. If `array` needs something from
  `object`, that shared thing belongs in a third place — otherwise importing one
  subpath silently pulls in the other and the guarantee is gone.
- Deep paths into `dist/` are not importable. Node rejects them with
  `ERR_PACKAGE_PATH_NOT_EXPORTED`, which is the intended behaviour.

## Required package.json fields

```json
{
  "type": "module",
  "sideEffects": false,
  "files": ["dist"],
  "engines": { "node": ">=22.12.0" },
  "publishConfig": { "access": "public" }
}
```

- `"type": "module"` — we publish ESM.
- `"sideEffects": false` — nothing happens at import time. If a module ever needs
  to run code on import, that is a design problem to solve, not a flag to remove.
- `"files": ["dist"]` — `src/` never ships. npm adds `README.md` and
  `package.json` on its own.
- `engines.node` — tsdown reads this to pick its output target, so it is load
  bearing, not just metadata.

Do not write an `exports` field by hand. tsdown generates it during the build.

## Rules that ESM-only imposes

We publish ESM with no CommonJS build. CommonJS consumers reach us through Node's
`require(esm)`, and two rules keep that working. Both are enforced by lint — see
[how-we-lint.md](how-we-lint.md).

### Named exports only

No `export default`. Under `require(esm)` Node returns a module namespace object,
so `require(pkg).thing` works but `require(pkg)` is not itself the exported value.
A default export would work for `import` consumers and quietly break `require`
consumers.

### Never top-level await

Top-level await anywhere in the module graph makes `require()` throw
`ERR_REQUIRE_ASYNC_MODULE`. Use a lazy `import()` inside a function instead:

```ts
// no
const config = await loadConfig();

// yes
export async function getConfig(): Promise<Config> {
  const { loadConfig } = await import('./_loader.ts');
  return loadConfig();
}
```

Introducing top-level await is a **breaking change**, because it removes an entire
class of consumer. Treat it as a major version bump.

## Dependencies

- **Runtime dependencies: avoid.** `utils` has none, and that is the target for
  every package.
- **Peers** for anything the consumer already owns — React, most obviously.
  Declare it in `peerDependencies` and add it to tsdown's `deps.neverBundle` so it
  is never inlined into our output.
- **Internal dependencies** use `workspace:^`. Changesets rewrites these to real
  version ranges at publish time, so you never hardcode a sibling's version.

## Why stateful packages care about this

For pure functions, shipping both ESM and CommonJS is harmless. For anything
holding state it is not: a consumer whose graph loads both copies gets two module
instances with separate state, which silently breaks singletons and makes React
`useContext` return defaults.

That applies to most of what is planned here — `logger`'s global configuration,
`dnd`'s drag manager, `react`'s contexts, `search`'s index registry. ESM-only
removes the possibility rather than documenting the hazard.
