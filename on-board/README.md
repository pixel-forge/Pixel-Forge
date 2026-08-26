# Onboarding

How this repository works, one process per document. If you are new here, read
them in this order — each assumes the ones above it.

| Document                                                     | What it covers                                                        |
| ------------------------------------------------------------ | --------------------------------------------------------------------- |
| [how-we-set-up.md](how-we-set-up.md)                         | Getting a working local environment: Node, pnpm, first build          |
| [how-we-structure-packages.md](how-we-structure-packages.md) | Package layout, subpath exports, and the rules ESM-only imposes       |
| [how-we-type.md](how-we-type.md)                             | TypeScript configuration, `isolatedDeclarations`, version policy      |
| [how-we-build.md](how-we-build.md)                           | tsdown: what it produces and why it replaced tsup plus tsc            |
| [how-we-test.md](how-we-test.md)                             | Vitest: layout, shared config, coverage                               |
| [how-we-lint.md](how-we-lint.md)                             | ESLint flat config, Prettier, and the two rules that guard ESM-only   |
| [how-we-validate.md](how-we-validate.md)                     | publint, attw, and the smoke tests that prove a package is consumable |
| [how-we-release.md](how-we-release.md)                       | Changesets, versioning, and publishing                                |
| [how-we-add-a-package.md](how-we-add-a-package.md)           | End-to-end walkthrough for a new library                              |

## How this differs from the other docs

- **These documents are operational** — what to run, where files go, what a
  failure means.
- **[docs/project-plan.md](../docs/project-plan.md)** holds the architectural
  decisions and their rationale, plus the full consumer support matrix. When you
  want to know _why_ something is the way it is, look there.
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** covers PR and commit expectations.

Where a number or a policy appears in both places, `docs/project-plan.md` is the
source of truth and these documents link to it rather than restating it.

## The short version

```bash
nvm use && pnpm install   # once
pnpm dev                  # watch builds while you work
pnpm lint && pnpm typecheck && pnpm test && pnpm build
pnpm changeset            # describe your change before opening a PR
```

A passing `pnpm build` is meaningful here: it also runs `publint` and `attw`, so
it validates that the package is actually publishable, not just that it compiles.
