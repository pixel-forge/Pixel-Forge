# How we validate

Lint, typecheck, and tests all inspect your **source**. None of them can tell you
whether the thing you upload to npm actually works. This document is about the
checks that look at the built package instead.

This is not theoretical. The first version of `@pixel-forge/utils` in this repo
had perfect source, passing tests, and a successful build — and was completely
unusable, because its hand-written `exports` map pointed at `.mjs` files the build
never emitted. Every subpath import would have resolved to a missing file. Nothing
in the pipeline looked at the output, so nothing noticed.

An npm version is immutable once published. You cannot fix `1.0.0`, only ship
`1.0.1` and leave the broken one there forever. Validation has to happen before
publish, not after a bug report.

## publint and attw

Both run automatically as part of `pnpm build`, configured in each package's
`tsdown.config.ts`. A green build means a validated package.

```
✔ [attw] No problems found
✔ [publint] No issues found
```

They are skipped in watch mode, because each one packs the package.

### publint

Answers: _will this resolve for consumers?_ It reads the built artifact and checks
that every path in `exports` exists on disk, that file extensions agree with
`"type"`, that conditions are ordered correctly, and that `files` ships what you
intended.

This is the check that would have caught the `.mjs` bug immediately.

### attw

[Are The Types Wrong](https://arethetypeswrong.github.io) answers a narrower
question: _do types resolve, in every module resolution mode a consumer might
use?_ It builds a matrix across `node10`, `node16` from CommonJS, `node16` from
ESM, and `bundler`, and reports whether types resolve and whether they resolve to
the right module kind.

We configure it with `profile: 'esm-only'`:

```ts
attw: {
  profile: 'esm-only';
}
```

Without that, attw reports the `node10` and CommonJS resolution failures that an
ESM-only package is _supposed_ to have, and the report is red by design — which
trains everyone to ignore it. The profile ignores exactly those expected failures
and nothing else, so a red attw stays meaningful.

## Packaging smoke tests

Before publishing something new, or after changing anything about the build,
exports, or entry points, verify the real tarball as a consumer:

```bash
cd packages/utils && npm pack --pack-destination /tmp/smoke
mkdir -p /tmp/smoke && cd /tmp/smoke
printf '{"name":"smoke","private":true,"version":"1.0.0"}\n' > package.json
npm i ./pixel-forge-utils-*.tgz
```

Then exercise all four paths.

**1. ESM import** — the primary path.

```bash
node --input-type=module -e "
import { lastArrayElement } from '@pixel-forge/utils/array';
console.log(lastArrayElement([1,2,3]));
"
```

**2. `require()`** — the CommonJS compatibility path, and the one that proves no
top-level await crept in anywhere, including in dependencies. This is the real
guarantee behind the lint rule.

```bash
node --input-type=commonjs -e "
const a = require('@pixel-forge/utils/array');
console.log(process.features.require_module, a.lastArrayElement([1,2,3]));
"
```

Expect `true` and the value. `ERR_REQUIRE_ASYNC_MODULE` means top-level await is
in the graph.

**3. Deep imports are blocked** — proves the export surface is actually closed.

```bash
node --input-type=module -e "
try { await import('@pixel-forge/utils/dist/array/index.js'); console.log('FAIL'); }
catch (e) { console.log(e.code); }
"
```

Expect `ERR_PACKAGE_PATH_NOT_EXPORTED`.

**4. Consumer types are real** — write a file that imports from the package and
assigns a value to a deliberately wrong type, then run `tsc --noEmit` against it
with `moduleResolution` of both `bundler` and `nodenext`. You want a type error.
Silence means types resolved to `any`, which is a failure that looks like success.

## What ships

```bash
npm pack --dry-run
```

Expect `dist/`, `package.json`, and `README.md` — nothing else. npm always
includes the README regardless of `files`, so it is the package's npm landing page
whether you meant it to be or not. Keep it accurate.
