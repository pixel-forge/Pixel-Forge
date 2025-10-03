# Contributing to Pixel Forge

Thanks for your interest! This repo hosts multiple TypeScript libraries under the Pixel Forge org.

## Ground rules
- Be respectful and follow the Code of Conduct.
- Keep PRs focused and small; one topic per PR.
- Discuss breaking changes via an issue first.

## Getting started
1. Fork and clone the repository.
2. Install PNPM and run `pnpm install`.
3. Pick a package under `packages/` (or propose a new one).
4. Dev loop: `pnpm --filter <pkg> dev` (watches JS + types).

## Scripts (per package)
- `typecheck` – `tsc --noEmit`
- `build` – emits d.ts then JS (ESM+CJS, sourcemaps, no minify)
- `test` – ESM tests; CI runs tests against built outputs
- `cjs:smoke` – CommonJS `require()` smoke test

## Commit & PR
- Use clear commit messages; reference issues when relevant.
- Add a **Changeset** describing your change (patch/minor/major) and why.
- Ensure CI passes: typecheck, build, tests, CJS smoke.

## Style
- TypeScript strict; **named exports only**.
- No import-time side effects; `sideEffects: false` posture.
- No deep public imports; root export only (for now).

## Security
- Do **not** file vulnerabilities in public issues. See `SECURITY.md` for private reporting instructions.
