# Pixel Forge — Repository Plan (working copy)

> Source of truth for repo/process decisions. Case-by-case exceptions are allowed where explicitly noted.

---

## 1) Tooling baselines
- **Node**: ≥ **20** (LTS). Enforce via `engines.node` in root `package.json` and developer env files (`.nvmrc`, optional `.tool-versions`).
- **Package manager**: **pnpm 10.18.0** pinned via root `package.json` → `"packageManager": "pnpm@10.18.0"`.
- **Build allowlist** (pnpm v10): approve native builds for **esbuild** so `tsup` can run. Prefer repo‑local allowlist in root `package.json` under `pnpm.allowedBuiltDependencies`.
- **TypeScript**: 5.9+ baseline. Modern settings per package (default `target: ES2022`).

---

## 2) Monorepo wiring
- **Workspaces**: `packages/*`.
- **Root scripts**: _fan‑out only_. Root assumes each package defines its own scripts and simply invokes them with workspace recursion.
    - Examples (root `package.json`):
        - `build`: `pnpm -r run build`
        - `dev`: `pnpm -r --parallel run dev`
        - `typecheck`: `pnpm -r run typecheck`
        - `test`: `pnpm -r run test`
        - `test:watch`: `pnpm -r --parallel run test:watch`
        - `lint`: `pnpm -r run lint`
        - `clean`: `pnpm -r --parallel run clean || pnpm -r --parallel exec rimraf dist`
- **Per‑package scripts**: Packages own their `build/dev/test/typecheck/lint/clean` implementations (they may diverge—e.g., React, SASS, etc.).
- **Versioning/Release**: Changesets wired at root (`changeset`, `release` scripts). Publishing strategy to be finalized when first public release is ready.

---

## 3) Imports policy
- **Case‑by‑case**. Barrels are not a global rule.
- Encourage **granular subpath imports** where tree‑shaking matters (e.g., `@pixelforge/utils/array`). Some packages may choose a root barrel for DX; document that choice in the package README.

---

## 4) Repo files (shared config & what they do)

### 4.1 Workspace & package manager
- **`pnpm-workspace.yaml`** — Declares workspace globs:
  ```yaml
  packages:
    - "packages/*"
  ```
- **Root `package.json`** — Monorepo driver:
    - `packageManager: "pnpm@10.18.0"` (pins CLI version)
    - `engines.node: ">=20"`
    - Fan‑out scripts (see §2)
    - Optional: `pnpm.allowedBuiltDependencies: ["esbuild"]` to auto‑approve builds

### 4.2 TypeScript (shared presets)
- **`configs/ts/tsconfig.base.json`** — Minimal baseline for all packages (ES2022, NodeNext or ESNext depending on package, `strict: true`, `skipLibCheck: true`).
- **`configs/ts/tsconfig.package.json`** — Package‑level preset extending the base. Common toggles (`resolveJsonModule`, `esModuleInterop`, `allowSyntheticDefaultImports`, `noEmit: true` by default). Individual packages can override (e.g., `module: ESNext`, `moduleResolution: Bundler`, `composite: true`).

### 4.3 Testing
- **`configs/test/vitest.base.ts`** — Shared Vitest base exported as a plain object (`baseTestConfig`), enabling:
    - `environment: 'node'`
    - `globals: true` (runtime `describe/it/expect`)
    - Standard `include/exclude`, c8 coverage defaults
- **Per‑package `vitest.config.ts`** — `defineConfig({ ...baseTestConfig, /* overrides */ })`.
- **Directory convention** — Tests live in `__tests__/` **adjacent to** `src/` and **mirror its folder structure**.

### 4.4 Linting & formatting
- **`configs/eslint/eslint.config.mjs`** — Root ESLint config for the monorepo (ESLint 9 + `@typescript-eslint` 8). Packages extend/consume this without duplicating rules.
- **`configs/prettier/prettierrc.json`** — Shared Prettier config. Root scripts may offer `format`/`format:write` spanning the whole repo.

### 4.5 Release & metadata
- **Changesets** — Root‑level setup (`@changesets/cli`), with `.changeset/` directory committed when we start authoring changes. Standard `changeset` / `release` scripts live at root.

### 4.6 Developer environment helpers (optional but recommended)
- **`.nvmrc`** — `20` (helps devs switch to Node 20 via nvm).
- **`.tool-versions`** — `nodejs 20` (for asdf users).

### 4.7 Policy docs (tracked separately from the plan)
- **`.gitignore`**, **`CONTRIBUTING.md`**, **`CODE_OF_CONDUCT.md`**, **`SECURITY.md`** — Maintained as standalone drafts/files (not in this plan). The plan may reference them when we finalize policies.

---

## 5) Notes carried forward
- The `@pixelforge/utils` package currently ships **subpaths only** (no root barrel). This is **not** a repo‑wide rule; evaluate per package.
- In packages using bundler builds, prefer TypeScript `module: ESNext` + `moduleResolution: Bundler`. (Remember this from utils; reuse where appropriate.)

---

## 6) TODO / Upcoming
- CI workflows (lint → typecheck → test → build) — reusable workflow to be added.
- Documentation system: set up TypeDoc generation and decide on a docs site (Docusaurus or alternative) later.

---

## 7) Documentation

### 7.1 Principles
- **Tooling-agnostic for now**: We are **not** committing to a docs generator yet (TypeDoc, Docusaurus, etc.). This section defines how we document code so any future tool can consume it.
- **Source of truth is the code**: Documentation for APIs lives in TSDoc/JSDoc comments beside the implementation.
- **Separation of concerns**: Authored guides, sites, and changelogs are separate deliverables we will introduce later without changing how code is documented.

### 7.2 TSDoc rules (apply to every exported function, class, type, and module)
- **Summary**: One concise sentence describing purpose.
- **Examples**: Provide **at least one `@example`** per exported API.
- **Params**: Use `@param` when intent isn’t obvious from the name.
- **Returns**: Add `@returns` when helpful (non-trivial types or behaviors).
- **Errors**: Document thrown errors with `@throws` when they can occur.
- **Deprecation**: Use `@deprecated` with a short migration hint.
- **Style**: Prefer plain language over repeating type names; keep examples runnable when possible.

### 7.3 Future tooling (TBD)
- When we choose a documentation generator, it should:
    - Consume existing TSDoc comments without requiring content rewrites.
    - Support per-package or aggregated API sections.
    - Allow authored guides/changelogs to coexist with generated API reference.
- Potential options (to be decided later): TypeDoc (API generation), Docusaurus/Nextra (site). No configuration committed yet.