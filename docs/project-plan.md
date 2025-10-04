# Pixel Forge — Repository Plan

## Overview
Pixel Forge is a multi-package TypeScript monorepo focused on browser UI libraries, published as JavaScript. Packages are versioned **independently**. We release **stable-only** (no canaries/snapshots for now). Work happens on `dev`; releases are cut from `main`.

---

## Versioning & SemVer
- **PATCH** (`x.y.Z`) — bug fixes/internal changes; no API behavior changes.
- **MINOR** (`x.Y.z`) — backwards-compatible features; existing code continues to work.
- **MAJOR** (`X.y.z`) — breaking changes; requires consumer action/migration.

Each package is bumped independently according to its changes.

---

## Changesets Workflow
### Day-to-Day (on `dev`)
1. Implement changes in one or more packages.
2. Create a changeset:
   ```bash
   pnpm changeset
   ```
    - Select affected packages.
    - Choose **patch/minor/major** per package.
    - Write a short summary (becomes the changelog entry).
3. Commit the changeset file in `.changeset/` along with your code (or as a separate commit).

### When Releasing (from `main`)
1. Merge `dev` → `main`.
2. Prepare release:
   ```bash
   pnpm release:prep
   ```
    - Runs typecheck, tests, and build.
    - Executes `changeset version` to bump versions and write `CHANGELOG.md` per package.
    - Commits the version/changelog updates.
3. Publish to npm (stable `latest` only):
   ```bash
   export NODE_AUTH_TOKEN=... # once per shell
   pnpm release:publish
   ```
    - Publishes only packages with changed versions.

---

## Branch Strategy
- **`dev`** — active development work; push frequently.
- **`main`** — stable, production-ready. Only release from here. No release/canary branches for now.

---

## Build & Type Emission Strategy (tsup JS + tsc DTS)
**Decision:** Build JavaScript with **tsup**; emit declarations with **tsc**.

**Why**
- **Stable for multi-entry packages.** Avoids tsup DTS edge cases (e.g., `TS6307` on internal imports not listed as entries).
- **Clear ownership.** tsup = JS (esm/cjs + sourcemaps). tsc = types (`.d.ts`, `.d.ts.map`).
- **Predictable include/exclude.** DTS uses the same project config as typecheck.

**Conventions**
- **Shared configs (under `configs/ts/`):**
    - `tsconfig.base.json`: common compiler options only (no `include`/`exclude`, no `rootDir`/`outDir`).
    - `tsconfig.package.json`: extends base; still **no** `rootDir`/`outDir`; keep `noEmit: true`.
- **Per-package:**
    - `packages/<name>/tsconfig.json`: extends `configs/ts/tsconfig.package.json`, sets:
        - `rootDir: "src"`, `outDir: "dist"`, optional `types` (e.g., `vitest/globals`), **noEmit** for typecheck.
    - `packages/<name>/tsconfig.build.json`: extends `./tsconfig.json`; flips emit for DTS only:
      ```json
      {
        "extends": "./tsconfig.json",
        "compilerOptions": {
          "noEmit": false,
          "emitDeclarationOnly": true,
          "declaration": true,
          "declarationMap": true,
          "outDir": "dist",
          "incremental": false,
          "composite": false
          // optional: "types": []
        }
      }
      ```
- **Build flow (per package):**
    1) Typecheck: `tsc -p tsconfig.json --noEmit`
    2) JS: `tsup` (esm + cjs)
    3) DTS: `tsc -p tsconfig.build.json`

> Add to `.gitignore`: `*.tsbuildinfo` and `**/dist/`.

---

## Root Scripts (Workspace Standard)
Root scripts **fan-out** to packages (keep names consistent in each package).

- **clean** — `pnpm -r --parallel run clean || pnpm -r --parallel exec rimraf dist`  
  Force-cleans build artifacts; falls back to nuking `dist/` if a package lacks `clean`.

- **typecheck** — `pnpm -r run typecheck`  
  TS compile check (no emit).

- **build** — `pnpm -r run build`  
  For PF packages: **tsup** (JS) + `tsc -p tsconfig.build.json` (DTS).

- **dev** — `pnpm -r --parallel run dev`  
  Concurrent watchers/dev servers.

- **test** — `pnpm -r run test`  
  Runs unit tests once.

- **test:watch** — `pnpm -r --parallel run test:watch`  
  Watch tests concurrently.

- **cjs:smoke** — `pnpm -r run cjs:smoke`  
  Sanity check CommonJS `require()` works for each package’s CJS build/exports.

- **lint** — `pnpm -r run lint`  
  Lint all packages.

- **format** — `prettier -c .`  
  Check formatting; exits non-zero if changes needed.

- **format:write** — `prettier -w .`  
  Apply Prettier formatting in place.

- **changeset** — `changeset`  
  Create a changeset (choose packages + bump type + notes).

- **release:status** — `changeset status`  
  Preview which packages will bump and how.

- **release:prep** —  
  `pnpm typecheck && pnpm test && pnpm build && changeset version && git add -A && git commit -m "chore(release): version packages" || echo "No version changes"`  
  Pipeline: typecheck → tests → build → apply changesets (version bumps + changelogs) → commit. If no changesets, prints a friendly message.

- **release:publish** — `pnpm -r build && changeset publish`  
  Rebuild recursively, then publish only changed packages (requires `NODE_AUTH_TOKEN`; defaults to `latest`).

> Notes: `-r` = recursive across workspace; `--parallel` runs concurrently (best for watchers).

---

## Per‑Package Required Scripts (Template)
Each package should define the following scripts in its `package.json`:

```json
{
  "scripts": {
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "build": "tsup && tsc -p tsconfig.build.json",
    "dev": "tsup --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint .",
    "clean": "rimraf dist *.tsbuildinfo",
    "cjs:smoke": "node -e "require('./dist/array/index.cjs'); require('./dist/object/index.cjs'); console.log('cjs ok')""
  }
}
```

Notes:
- Adjust the `cjs:smoke` require paths per package entrypoints. Goal: prove CJS `require()` works (logic validated by tests).
- If a package doesn’t use Vitest/ESLint, swap for your chosen tool or omit. Keep script **names** consistent with root scripts.

---

## Manual Release Procedure
1. On `dev`: finish work, run `pnpm changeset` to author a changeset (select packages, bump types, add notes). Commit.
2. Merge to `main`:
   ```bash
   git checkout main
   git merge dev --no-ff
   ```
3. Prepare release:
   ```bash
   pnpm release:prep
   git push --follow-tags
   ```
4. Publish stable:
   ```bash
   export NODE_AUTH_TOKEN=...
   pnpm release:publish
   git push --follow-tags
   ```

---

## Policies & Guardrails
- **Stable-only publishes**: use npm `latest` only (no prereleases/canaries for now).
- **Conventional Commits (light)**: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`. Use `BREAKING CHANGE:` in the body or pick **major** during `pnpm changeset`.
- **Breaking changes**: prefer deprecation first; remove on next major. Put migration notes in the changeset (auto-lands in `CHANGELOG.md`).

---

## Future CI/CD (Jenkins Home Lab)
When ready to automate on `main`, the job runs the same commands:
1) `pnpm i --frozen-lockfile`
2) `pnpm typecheck && pnpm test && pnpm build`
3) `pnpm release:prep && git push --follow-tags`
4) `pnpm release:publish` (with `NODE_AUTH_TOKEN` stored in Jenkins credentials)
