# How we set up

## Node

The repo requires Node `^22.18.0 || >=24.11.0`. That is tsdown's own floor, and
it is stricter than what we publish for — packages declare `>=22.12.0`, which is
the Node version where `require(esm)` was unflagged.

Two different numbers, two different audiences:

- **`>=22.12.0`** — the floor for people _consuming_ our packages.
- **`^22.18.0 || >=24.11.0`** — the floor for people _developing_ them.

The repo pins its version in `.nvmrc`:

```bash
nvm use          # reads .nvmrc
node -v          # expect v24.x
```

If your global nvm default is an older Node, `nvm use` is required in every new
terminal. Forgetting it produces an unhelpful failure from tsdown rather than a
clear version error, so check `node -v` first when a build breaks inexplicably.

Note that Node 20 went end-of-life on 2026-04-30, and Node 22.0 through 22.11
predate unflagged `require(esm)` — being on the 22 line is not sufficient by
itself.

## pnpm

pnpm is pinned through the `packageManager` field in the root `package.json`, so
Corepack will use the right version automatically. Do not use npm or yarn to
install here; the lockfile is pnpm's and the workspace protocol depends on it.

```bash
pnpm install
```

In CI, use `pnpm install --frozen-lockfile` so a stale lockfile fails the build
instead of being silently updated.

## First build

```bash
pnpm build
```

Expect three success lines per package — the build itself, then `attw`, then
`publint`. If you only see the build line, validation was skipped, which means you
are in watch mode.

## Repository layout

```
packages/          one directory per published library
configs/ts/        shared TypeScript configuration
configs/test/      shared Vitest configuration
on-board/          these documents
docs/              architectural decisions
.changeset/        pending release notes
```

Shared configuration lives in `configs/` and is extended by each package. One
constraint worth knowing early: a shared `tsconfig` must not contain `include` or
`exclude`, because those resolve relative to the file that _declares_ them, not
the file that extends it. Paths belong in the per-package `tsconfig.json`.

## Day-to-day loop

```bash
pnpm dev                        # watch every package
pnpm --filter @pixel-forge/utils dev   # watch one
```

Watch mode skips `publint` and `attw`, since each of those packs the package and
is too slow to run on every keystroke. Run a full `pnpm build` before pushing.

## Before you push

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm format
```

Then add a changeset describing your change — see
[how-we-release.md](how-we-release.md).
