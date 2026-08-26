# Contributing to Pixel Forge

Thanks for your interest. This repo hosts several TypeScript libraries published
under the `@pixel-forge/*` scope.

## Ground rules

- Be respectful and follow the Code of Conduct.
- Keep PRs focused and small; one topic per PR.
- Discuss breaking changes in an issue first.

## Getting started

```bash
nvm use        # Node ^22.18 || >=24.11, pinned in .nvmrc
pnpm install
pnpm build
```

Then pick a package under `packages/`, or propose a new one. The dev loop is
`pnpm --filter <pkg> dev`.

New here? Read [on-board/](on-board/README.md) — it covers how the repo builds,
tests, lints, validates, and releases, one process per document.

## Before you open a PR

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm format
```

`pnpm build` also runs `publint` and `attw`, so it verifies the package is
publishable rather than merely compilable. Do not skip it.

Then add a changeset describing your change:

```bash
pnpm changeset
```

Your summary becomes the changelog entry users read, so write it for someone who
has not seen your PR. A PR with no changeset publishes nothing — intentional for
refactors and docs, a mistake otherwise.

## Style

- TypeScript strict. Exported functions need explicit return types, which
  `isolatedDeclarations` enforces.
- **Named exports only.** No default exports — they break `require(esm)`
  consumers.
- **No top-level await.** It makes the package unloadable via `require()`.
- No import-time side effects; every package declares `sideEffects: false`.
- Subpath imports only. There is no root barrel, and internal `_`-prefixed
  modules are not part of the public API.

The first three are enforced by lint. See
[on-board/how-we-lint.md](on-board/how-we-lint.md) for why they exist, and
[on-board/how-we-structure-packages.md](on-board/how-we-structure-packages.md) for
the reasoning behind the import surface.

## Commits

Conventional Commits, lightly: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`,
`test:`. Reference issues where relevant.

## Security

Do **not** file vulnerabilities in public issues. See
[SECURITY.md](SECURITY.md) for private reporting.
