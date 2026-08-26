# How we test

## The tool: Vitest

[Vitest](https://vitest.dev) runs our tests. It was the natural choice for an
ESM-only repo: it is ESM-native and needs no flags or transform configuration to
load our source, whereas Jest still requires `--experimental-vm-modules` to
handle ES modules.

```bash
pnpm test                                    # every package, once
pnpm test:watch                              # watch every package
pnpm --filter @pixel-forge/utils test        # one package
```

## Where tests live

Tests sit in a `__tests__/` directory that mirrors `src/`:

```
src/array/_elements.ts
__tests__/array/_elements.test.ts
```

Only files matching `**/__tests__/**/*.test.ts` are collected. Tests are excluded
from the published package by `files: ["dist"]`, and from coverage reporting.

## What tests import

Import from `src/`, not from `dist/`:

```ts
import { lastArrayElement } from '../../src/array';
```

Testing the source keeps the loop fast and gives you accurate stack traces and
coverage. The built output is not left unverified, though — it is checked
separately and more rigorously by the packaging smoke tests, which install the
real tarball and exercise it as a consumer would. See
[how-we-validate.md](how-we-validate.md).

That split is deliberate: unit tests answer "is the logic right", packaging tests
answer "can anyone actually import this".

## Configuration

Shared configuration lives in `configs/test/vitest.base.ts` and is merged per
package:

```ts
import { defineConfig, mergeConfig } from 'vitest/config';
import { baseTestConfig } from '../../configs/test/vitest.base.ts';

export default mergeConfig(baseTestConfig, defineConfig({}));
```

The base config sets a `node` environment, enables globals, and configures
coverage. A package that needs something different — a DOM environment for
`react`, for instance — overrides it in the second argument rather than editing
the shared file.

Note the explicit `.ts` extension on that import. Vite's native config loader
requires full specifiers, and Node strips the types itself.

## Globals

`globals: true` means `describe`, `it`, and `expect` are available without
importing them. For TypeScript to know that, the package `tsconfig` includes
`"types": ["vitest/globals"]`.

If your editor flags `describe` as undefined, that types entry is missing or the
test file is outside the tsconfig `include`.

## Coverage

```bash
pnpm --filter @pixel-forge/utils test -- --coverage
```

Coverage uses the V8 provider via `@vitest/coverage-v8`. Reports go to
`coverage/`, which is gitignored. Tests, `dist/`, and types-only directories are
excluded — a `types/` directory contains no runtime code, so including it would
report misleading zeroes.

## What to test

- **Public exports, through their real surface.** If it is exported from a
  domain's `index.ts`, it should have a test.
- **Boundary conditions**, since `noUncheckedIndexedAccess` makes them explicit
  in the types. An empty array, a missing key, a zero delay.
- **Behaviour, not implementation.** Internal `_`-prefixed helpers are tested
  through the public function that uses them, so refactoring internals does not
  require rewriting tests.

There is no coverage threshold gate. These packages are small enough that a gap
is visible in review, and a percentage target tends to produce tests written for
the number rather than for the risk.
