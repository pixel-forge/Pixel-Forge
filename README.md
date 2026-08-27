# Pixel Forge

A collection of small, independent TypeScript libraries for web development.

Each library is published separately to npm under the `@pixel-forge/*` scope, so
you install only what you need. They live in one repository because several of
them share a foundation, and coordinating that across separate repos costs a
publish cycle per change.

## What these libraries are for

The goal is a set of building blocks that stay useful across projects and
employers, rather than being shaped around any one codebase:

- **Close to plain TypeScript.** Minimal abstraction over the language and the
  platform. If the standard library already does it, we do not wrap it.
- **Few dependencies.** Ideally none at runtime. Where a peer is unavoidable
  (React, for instance) it stays a peer dependency.
- **Honest import surfaces.** Every package exposes narrow subpaths rather than
  one barrel, so importing one thing cannot drag in the rest. See
  [on-board/how-we-structure-packages.md](on-board/how-we-structure-packages.md).
- **ESM-only.** No dual CommonJS build. CommonJS consumers load these packages
  through Node's `require(esm)` on Node 22.12+.
- **Customizable by default.** Behaviour is passed in, not baked in.

## Packages

| Package                                | Description                                    | Status         |
| -------------------------------------- | ---------------------------------------------- | -------------- |
| [`@pixel-forge/utils`](packages/utils) | General TypeScript utility functions and types | In development |
| [`@pixel-forge/log`](packages/log)     | Console logging and log reporting              | In development |
| `@pixel-forge/react`                   | React component library                        | Planned        |
| `@pixel-forge/search`                  | Universal search                               | Planned        |
| `@pixel-forge/dnd`                     | Drag and drop                                  | Planned        |

`utils` is the shared foundation; most other packages depend on it. `search` and
`dnd` are each intended as a framework-agnostic core plus a thin React binding,
so the core stays usable without React.

## Getting started

Requires Node `^22.18.0 || >=24.11.0` and pnpm. The repo pins its Node version in
`.nvmrc`:

```bash
nvm use
pnpm install
pnpm build
```

Full setup notes are in [on-board/how-we-set-up.md](on-board/how-we-set-up.md).

## Documentation

- **[on-board/](on-board/README.md)** — how the repo works day to day: building,
  testing, linting, releasing, and adding a new package. Start here.
- **[docs/project-plan.md](docs/project-plan.md)** — the architectural decisions
  and their rationale, including the full consumer support matrix.
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — PR and commit expectations.

## License

MIT
