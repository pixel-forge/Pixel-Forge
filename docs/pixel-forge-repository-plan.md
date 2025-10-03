# Pixel Forge — Repository Plan (Living Doc)
*(Owner: Itay “Cipher”; Org: Pixel Forge)*

> This is a living reference for architecture and process. We’ll update it as decisions evolve.

---

## Vision & Principles
- **Goal:** Multiple TypeScript UI-focused libraries under one org, published independently, high standards.
- **Design values:** Purity where possible, isomorphic by default (Node 20+ & modern browsers), clear APIs, minimal friction for consumers.
- **Publishing stance:** Each library is a **standalone install**; shared code lives in `@pixelforge/utils` as a normal dependency (Option C).

---

## Repository Shape
- **Monorepo** with **independent versioning** per package.
- Libraries may depend on other Pixel Forge libs via normal **runtime dependencies** (not peers) to ensure auto-install for consumers.
- **No subpath exports (for now).** One public root entry per package.

### Dependency Policy (PF ⇄ PF)
- PF intra-deps declared under **`dependencies`** with **tilde ranges** (`~x.y.z`) so consumers auto‑get **latest patch** only; minors are opt-in.
- **Externalize** PF deps in builds so they are **not bundled** (allowing dedupe). Applies to any third-party runtime deps too.

---

## Module Outputs & Exports
- **Dual outputs:** **ESM + CJS** for maximum compatibility.
- **Named exports only** (no default).
- **Exports contract (root only):**
  - `exports["."].types` → root `.d.ts`
  - `exports["."].import` → ESM entry
  - `exports["."].require` → CJS entry
  - Top-level `"types"` kept for compatibility.
  - Package `"type": "module"`; CJS files use `.cjs` extension.
- **`sideEffects: false`** once confirmed: no import-time effects.

### Tree‑Shaking Posture
- Keep modules pure at the top level (no side effects on import).
- Prefer small, composable, **named** exports.
- This enables bundlers to remove unused code for app consumers.

---

## Runtime Targets & Polyfills
- **Node:** 20+
- **Browsers:** modern evergreen
- **Polyfills:** **Avoid shipping**. If needed, document required polyfills for consumers.

---

## Bundler Strategy
- **Default bundler:** **tsup** (esbuild-based) for speed and simplicity.
- **Types:** emitted by **tsc** (`--emitDeclarationOnly`). Bundler focuses on JS.
- **Sourcemaps:** **ON** for both ESM & CJS builds.
- **Minify:** **OFF** by default (apps will minify).
- **Migration path:** If/when we need advanced output topologies, selectively migrate individual packages to Rollup.

---

## Development Workflow (Workspaces)
- Use pnpm workspaces to link PF packages locally.
- **Local dev mode:** dependents resolve PF deps from local **`dist`** via workspace symlinks (no npm publish needed during dev).
- Run watchers so upstream changes (e.g., in `utils`) rebuild to `dist` and are immediately visible to dependents (e.g., `logger`).

### Standard Scripts (per package)
- `typecheck` → `tsc --noEmit`
- `build` → `tsc --emitDeclarationOnly` → `tsup` (ESM+CJS, sourcemaps, no minify)
- `clean` → remove `dist`
- `dev` → run `dev:types` + `dev:js` (watch)
- `dev:types` → `tsc --emitDeclarationOnly --watch`
- `dev:js` → `tsup --watch`
- `test` → ESM functional tests (prefer testing **built outputs** in CI)
- `test:watch` → ESM tests in watch
- `cjs:smoke` → one-off CJS `require()` smoke test against **built** package
- *(optional)* `check:externals` → assert PF deps are not inlined
- *(optional)* `check:no-deep-imports` → assert internals aren’t importable

### Dev Commands
- **Single package watch:** `pnpm --filter <pkg> dev`
- **All packages watch:** `pnpm -r dev`

---

## Testing Posture
1. **ESM functional tests (primary):**
   - Node 20+, Vitest (or similar), import from package root as users do.
   - In CI, run against **built outputs** to validate published shape.
2. **CJS smoke test (interop):**
   - Tiny `.cjs` file that `require()`s the package root and asserts named exports exist.
3. **Isomorphic sanity (as needed):**
   - Browser-like env (e.g., happy-dom) to ensure no Node-only APIs leak.
4. **Externalization & deep-import guards (optional):**
   - Check that PF deps are not bundled and internals aren’t importable.

---

## CI (Minimal, Per Package, Only on Changes)
1) Install deps with pnpm (cache store)
2) `typecheck`
3) `build`
4) `test` (ESM, against **dist**)
5) `cjs:smoke`
6) *(optional)* externalization & deep-import checks

**Environment:** Node 20.x

**Provider:** GitHub Actions (or equivalent) — simple matrix, runs on PRs and pushes to `main`.

---

## Versioning & Releases
- **Changesets** for human-authored bump intent and changelogs.
- **Independent versioning**; only changed packages bump & publish.
- PF intra-deps rewritten from `workspace:*` to **tilde** ranges on versioning.
- Release flow: Merge PRs with changesets → version commit → CI → publish changed packages.

---

## License
- **MIT License** for all Pixel Forge packages.
- You may relicense future releases before accepting external contributions without additional permissions.
- After external contributions, relicensing requires contributor permission (or replacing their code). A lightweight CLA can simplify this if needed in the future.

---

## Documentation Conventions (per package)
- README includes:
  - Install & import examples (ESM + CJS).
  - Runtime targets & polyfill note (if any).
  - “No deep imports” policy.
  - Brief explanation of API surface (named exports only).

---

## Open Questions / Future Facets
- Subpath exports: when/if to add (each with tests and the same `types/import/require` triplet).
- CI enhancements: size/regression checks, bundle analyzer snapshots.
- Migration criteria to Rollup (if we need advanced output graphs or custom chunking).
- Documentation site (later) to aggregate API docs across packages.

---

## Repository Skeleton (initial)
```
pixel-forge/
├─ .gitignore
├─ LICENSE                # MIT (chosen)
├─ README.md              # high-level overview
├─ CONTRIBUTING.md        # contributor guide
├─ CODE_OF_CONDUCT.md     # community expectations
├─ SECURITY.md            # vulnerability reporting
├─ docs/
│  └─ repository-plan.md  # exported snapshot of this plan (optional)
├─ package.json           # pnpm workspace root (scripts only; no deps)
├─ pnpm-workspace.yaml
├─ tsconfig.base.json     # shared TS config (kept at root)
├─ .eslintrc.cjs          # shared lint rules (kept at root)
├─ .prettierrc.json       # shared formatter config (kept at root)
└─ packages/              # (empty for now)
   └─ (to be added later: @pixelforge/utils, @pixelforge/logger, ...)
```

> Notes
> - Keep `packages/` empty until we start `@pixelforge/utils`.
> - Root `package.json` holds workspace scripts only; real code lives per package.
> - **Configs stay at repo root** for best tool/editor auto-discovery; we can revisit a `configs/` folder later if desired.
> - WebStorm tip: mark `dist/` as excluded per package once created (reduces index noise).

---

## Next Up (Roadmap Candidates)
- Define **`@pixelforge/utils` scope & rules** (purity, naming, isomorphic constraints, allowed categories).
- Draft **`@pixelforge/logger` API surface** (levels, record shape, transports, formatters), still planning-only.
- Lock shared **tsconfig** and lint rules (strictness levels, import rules) — explanation + pitfalls.
