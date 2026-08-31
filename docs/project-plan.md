# Pixel Forge — Repository Plan

## Overview

Pixel Forge is a multi-package TypeScript monorepo of small, low-dependency libraries.
Packages are versioned **independently** and published **ESM-only** under the
`@pixel-forge/*` scope. We release **stable-only** (no canaries/snapshots for now).
Work happens on `dev`; releases are cut from `main`.

---

## Module format: ESM-only

Every package ships ESM only. There is no `.cjs` output, no `.d.cts`, no dual
`import`/`require` conditions, and no `main`/`module` fields.

CommonJS consumers are still supported — they reach the package through Node's
`require(esm)`, which was unflagged in Node 22.12.0. This is why the two rules
below are mandatory rather than stylistic.

### Rules that keep `require(esm)` working

1. **Named exports only.** No `export default`, no `module.exports = fn` shape.
   Under `require(esm)` Node hands back a module namespace object, so
   `require(pkg).thing` works but `require(pkg)` used as the value itself does not.
   Enforced by `import/no-default-export` on `packages/*/src/**`.
2. **Never ship top-level await.** TLA anywhere in the graph makes `require()`
   throw `ERR_REQUIRE_ASYNC_MODULE`. Use a lazy `import()` inside a function.
   Enforced by `no-restricted-syntax` for fast feedback, and definitively by the
   `require()` smoke test before publish — that also covers TLA in dependencies.
3. **No deep paths into `dist/`.** The generated `exports` map is the entire
   public surface. There is deliberately no root barrel.

### Consumer support matrix

Most of these floors come from using subpath `exports` at all, not from ESM-only.

| Consumer                                            | Floor                                                         |
| --------------------------------------------------- | ------------------------------------------------------------- |
| Node, `import`                                      | 14.13+ (effectively unconstrained)                            |
| Node, `require()`                                   | **22.12.0+** — where `require(esm)` was unflagged             |
| TypeScript, ESM consumer                            | 4.7+ with `node16`/`nodenext`, or 5.0+ with `bundler`         |
| TypeScript, CJS consumer                            | **`module: nodenext`** — see below                            |
| webpack                                             | 5.0+ (webpack 4 has no `exports` support)                     |
| Metro / React Native                                | Metro 0.82+ / RN 0.79+ (`exports` on by default)              |
| Vite, Rollup, esbuild, Parcel 2+, Bun, Deno, Vitest | any realistic version                                         |
| Jest                                                | needs `--experimental-vm-modules`; still true as of Jest 30.4 |

`moduleResolution: "node"`/`"node10"` cannot resolve subpath exports at all. That
was already true under a dual build, because these packages have no root entry.

**CJS TypeScript consumers must use `module: nodenext`, not `node16`.** Verified
against the packed tarball: `nodenext` models Node's `require(esm)` and accepts a
static `import` from a CommonJS file, while `node16` rejects it with TS1479 and
suggests a dynamic `import()`. The runtime works either way — this is TypeScript
being stricter than Node, not a packaging fault. The alternatives for a consumer
stuck on `node16` are `"type": "module"`, an `.mts` extension, or dynamic import.

---

## Tree-shaking / import surface

- **One subpath per domain**, no root `.` barrel: `@pixel-forge/utils/array`,
  `/object`, `/timing`, `/types`. A consumer importing `/array` cannot pull in
  `/timing` even under a bundler that does no tree-shaking at all. This is a
  stronger guarantee than `sideEffects` alone.
- `"sideEffects": false` in every package.
- `"files": ["dist"]` — `src/` never ships.
- Peer dependencies (e.g. `react`) are declared as peers and listed in tsdown's
  `deps.neverBundle` so they are never inlined.
- Internal dependencies use `workspace:^`; `changeset version` rewrites these to
  real ranges at publish time.

---

## Build: tsdown

**Decision:** one tool. `tsdown` produces JS, declarations, and the `exports` map.

Previously this repo used `tsup` for JS plus a separate `tsc` pass for
declarations, because tsup's multi-entry DTS hit `TS6307` on internal imports not
listed as entries. tsdown's declaration generation handles multi-entry, so the
second pass is gone along with `tsconfig.build.json`.

**Why tsdown over tsup**

1. `exports: true` derives `package.json#exports` from the entry points and writes
   it back. The map cannot drift from what was emitted. tsup has no equivalent —
   the hand-written map in this repo's first attempt pointed at `.mjs` files that
   were never built, which made the package unpublishable.
2. Multi-entry declaration generation works, collapsing two build tools into one.
3. Native `publint` and `attw` integration, so the build validates the package.
4. Rolldown/Oxc based, materially faster.

**Per-package config** (`packages/<name>/tsdown.config.ts`): one entry per
published subpath, `format: ['esm']`, `dts: true`, `exports: true`,
`platform: 'neutral'`, and `publint` + `attw` enabled outside watch mode.

`isolatedDeclarations` is on in `configs/ts/tsconfig.base.json`, which lets tsdown
emit declarations via oxc-transform instead of falling back to the TypeScript
compiler. It requires explicit return types on exported functions.

---

## Publish validation

`publint` and `attw` run as part of `tsdown`, so a passing build is a validated
package. Both are skipped in watch mode because each packs the package.

- **publint** — checks the built artifact: that every `exports` path exists, that
  extensions match `"type"`, that `files` ships what is intended.
- **attw** — checks that types resolve across resolution modes. Configured with
  `profile: 'esm-only'`, which ignores the CJS resolution failures an ESM-only
  package is expected to have, so the report stays actionable.

---

## Toolchain versions

- **Node** — dev requires `^22.18.0 || >=24.11.0` (tsdown's own floor). Note this
  is stricter than the published consumer floor of `>=22.12.0`. Node 20 is EOL as
  of 2026-04-30.
- **TypeScript 6.0.x** — deliberately not 7.x. `typescript-eslint` declares
  `typescript: ">=4.8.4 <6.1.0"`, and TS 7's programmatic API is deferred to 7.1,
  so linting and framework tooling cannot drive it yet. Revisit after 7.1.
- **ESLint 9** with flat config (`eslint.config.mjs`). Not 10, because
  `eslint-plugin-import` peers cap at `^9`.
- **pnpm 10.18** via the `packageManager` field.

---

## Versioning & SemVer

- **PATCH** — bug fixes / internal changes; no API behavior change.
- **MINOR** — backwards-compatible features.
- **MAJOR** — breaking changes requiring consumer action.

Each package is bumped independently. Dropping a supported Node line, removing a
subpath, or introducing top-level await are all **major**.

---

## Changesets workflow

On `dev`, alongside your code:

```bash
pnpm changeset          # pick packages, bump type, write the changelog entry
```

Releasing from `main`:

```bash
git checkout main && git merge dev --no-ff
pnpm release:prep       # lint, typecheck, test, build (validates), changeset version
git add -A && git commit -m "chore(release): version packages"
pnpm release:publish    # rebuild, then changeset publish
git push --follow-tags
```

`release:prep` does not auto-commit — review the version bumps and generated
changelogs before committing them.

---

## Root scripts

| Script                             | Purpose                                                   |
| ---------------------------------- | --------------------------------------------------------- |
| `clean`                            | Remove build artifacts across packages                    |
| `typecheck`                        | `tsc --noEmit` per package                                |
| `build`                            | `tsdown` per package (includes publint + attw)            |
| `dev`                              | Watch builds, validation skipped                          |
| `test` / `test:watch`              | Vitest                                                    |
| `lint`                             | `eslint .` across the workspace from the root flat config |
| `format` / `format:write`          | Prettier check / write                                    |
| `changeset` / `release:status`     | Author and inspect pending changesets                     |
| `release:prep` / `release:publish` | See above                                                 |

---

## Per-package scripts

```json
{
  "scripts": {
    "clean": "rimraf dist",
    "build": "tsdown",
    "dev": "tsdown --watch",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Linting is workspace-wide from the root, so packages carry no `lint` script.

---

## Target package graph

```
utils ──┬── logger
        ├── react ──┬── search
        ├── search  │
        └── dnd ────┘

sass-utils
```

`sass-utils` is independent of the TypeScript graph: it ships Sass partials, not
compiled JS, and has no package dependency on `utils`.

`search` and `dnd` should each be a framework-agnostic core plus a thin React
binding, so the core stays usable without React.

Stateful packages (`logger`'s global config, `dnd`'s drag manager, `react`'s
contexts) are the reason ESM-only matters beyond simplicity: a dual build lets a
consumer load two copies with separate state, which silently breaks singletons
and makes `useContext` return defaults.

---

## Policies

- **Stable-only publishes** — npm `latest`, no prereleases for now.
- **Conventional Commits (light)** — `feat:`, `fix:`, `refactor:`, `docs:`,
  `chore:`, `test:`.
- **Breaking changes** — deprecate first, remove on the next major, and put
  migration notes in the changeset so they land in `CHANGELOG.md`.
