# How we lint

```bash
pnpm lint            # eslint across the workspace
pnpm format          # prettier check, fails if anything is unformatted
pnpm format:write    # prettier fix in place
```

## ESLint

Configuration is a single flat config at the repo root, `eslint.config.mjs`, which
covers every package. Individual packages carry no lint script and no config of
their own.

The stack is intentionally small:

- `@eslint/js` recommended
- `typescript-eslint` recommended
- `eslint-config-prettier`, last, to switch off rules Prettier owns

### Version notes

We are on **ESLint 10**. The 9 line is deprecated and no longer supported.

`eslint-plugin-import` is deliberately absent. It caps its ESLint peer range at
`^9`, which would have pinned us to a deprecated ESLint, and the only rule we
wanted from it was `no-default-export`. That is expressible with core
`no-restricted-syntax`, so dropping the plugin bought us a supported ESLint and
one fewer dependency. Its other rules largely duplicate what TypeScript already
checks.

## The two rules that matter

Everything else is style. These two are correctness guards for ESM-only
publishing, and they apply only to `packages/*/src/**` — tests and build configs
are free to do as they like.

### No default exports

```
error  Default exports are banned: require(esm) consumers receive a namespace
       object, so `require(pkg)` would not be the exported value.
```

A default export works fine for `import` consumers and quietly breaks `require`
consumers, which is the worst kind of bug: invisible to the author.

### No top-level await

```
error  Top-level await is banned: it makes this package throw
       ERR_REQUIRE_ASYNC_MODULE for require() consumers.
```

Both are implemented as `no-restricted-syntax` selectors.

**Understand the limit of the second one.** It matches the realistic shapes of
top-level await — a bare `await`, an awaited variable declaration, `for await` —
because ESLint selectors cannot express "an await with no enclosing function".
Exotic arrangements will slip past it, and it cannot see top-level await inside a
dependency at all.

So the lint rule is fast feedback, not the guarantee. The guarantee is the
`require()` smoke test in [how-we-validate.md](how-we-validate.md), which loads
the real built package and therefore catches both cases. Do not treat a clean lint
as proof.

## Prettier

`printWidth: 100`, single quotes, trailing commas — see `.prettierrc.json`.
`.prettierignore` excludes the lockfile, build output, coverage, and generated
changelogs.

Formatting is checked in the pipeline and fails the build, so run `format:write`
before pushing. There is no pre-commit hook; if that becomes annoying, adding one
is a reasonable change.

## When lint and types disagree

They cover different ground and neither is redundant:

- **TypeScript** checks that the code is internally consistent.
- **ESLint** checks that it follows the rules that make the _published package_
  work for consumers — which the compiler has no way to know about.

If a lint rule contradicts something TypeScript is happy with, the rule is
usually encoding a packaging constraint. Read the message before disabling it, and
prefer fixing the code over an inline disable comment.
