# How we release

Packages are versioned and published **independently**. A change to `utils` does
not bump `logger`, unless `logger` depends on the part that changed — Changesets
works that out.

We publish stable versions only. No canaries or snapshots for now.

## Branches

- **`dev`** — active work. Push here.
- **`main`** — releases are cut from here.

## While you work: write a changeset

A changeset is a small markdown file recording what changed and how each affected
package should be bumped. Add one in the same PR as your change:

```bash
pnpm changeset
```

It asks which packages you touched, whether each is patch/minor/major, and for a
summary. That summary becomes the `CHANGELOG.md` entry that users read, so write
it for someone who does not know your PR exists — what changed and what they need
to do, not which files you edited.

The result lands in `.changeset/` and gets committed with your code.

```bash
pnpm release:status   # what is pending and how it would bump
```

A PR with no changeset publishes nothing. That is fine for pure refactors and
documentation, but it is the usual reason a change mysteriously never reaches npm.

## Choosing a bump

- **patch** — bug fixes and internal changes; no API change.
- **minor** — backwards-compatible additions.
- **major** — anything requiring consumer action.

Three things are majors that are easy to misjudge:

- **Raising the Node floor** or dropping a supported line.
- **Removing or renaming a subpath.** The `exports` map is the public API, so a
  subpath is as much a breaking change as a function signature.
- **Introducing top-level await**, which removes every `require()` consumer at
  once. See [how-we-structure-packages.md](how-we-structure-packages.md).

Prefer deprecating over removing, and put migration notes in the changeset so
they land in the changelog.

## Releasing

```bash
git checkout main && git merge dev --no-ff

pnpm release:prep
```

`release:prep` runs lint, typecheck, tests, and the build — which includes
`publint` and `attw` — and then applies the pending changesets, bumping versions
and writing changelogs.

It deliberately does **not** commit. Review the version bumps and generated
changelog entries first, then:

```bash
git add -A && git commit -m "chore(release): version packages"
```

Publishing needs an authenticated npm session with access to the `pixel-forge`
organization:

```bash
npm whoami        # 401 means log in first
npm login

pnpm release:publish
git push --follow-tags
```

`release:publish` rebuilds and then publishes only the packages whose versions
changed. Because the build validates, a package that would fail `publint` or
`attw` never reaches the registry.

## Internal dependencies

Packages depend on each other with `workspace:^`. Changesets rewrites those to
real version ranges when it versions the packages, so you never hardcode a
sibling's version and never publish a `workspace:` range by mistake.

When a package bumps, its dependents get a patch bump automatically —
`updateInternalDependencies` in `.changeset/config.json`.

## Before the first publish of a new package

A first publish is the one you cannot undo, so treat it differently:

1. Confirm the name is free: `npm view @pixel-forge/<name>` should 404.
2. Confirm `publishConfig.access` is `public` — scoped packages default to
   private and the publish will fail without it.
3. Run the full packaging smoke tests from
   [how-we-validate.md](how-we-validate.md), not just the build.
4. Check `npm pack --dry-run` ships only `dist/`, `package.json`, and `README.md`.
5. Read the README as a stranger would. It is the npm landing page.

## CI

There is none yet; releases are run locally. When that changes, the pipeline is
the same sequence: `pnpm install --frozen-lockfile`, then `release:prep`, then
`release:publish` with an npm token in the environment. Trusted publishing via
OIDC would be the better option at that point, since it gives provenance without
a long-lived token.
