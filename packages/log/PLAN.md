# @pixel-forge/log — design plan

Working notes for implementing this package. Not published (`files: ["dist"]`).

## Goals

1. **Environment loggers** — colorful / structured console output tailored per
   runtime (browser first; Node, GCP console, and similar later).
2. **Log reporting** (later) — intercept console (and/or logger) traffic, collect
   it, and send it to log services.

## Loggers

### Why browser first

Browser `console` styling is the straightforward case: DevTools accept CSS-like
properties via `%c`. Backend-oriented sinks are harder (ANSI/TTY in Node, how
GCP’s console renders lines, and so on). Start where the formatting model is
clear, and keep other environments in mind so the API shape can grow.

### Phased approach

1. All **output** loggers live under `src/logger/`. Shared base `Logger` stays in
   `logger/_shared` and is **not** a public export. Severity order lives on
   `Logger` itself (private), not in the public API.
2. **Shared public surface** (`LogLevel`, `LogParcel`, …) is exported from the
   package root `@pixel-forge/log` via `src/index.ts` — shared across every
   environment logger, not a barrel of those loggers.
3. Each environment logger is its **own public subpath** (`browser-logger`,
   later `node-logger`, …). Sources live under `src/logger/<name>/` and import
   `_shared` only — never another environment folder — so importing
   `@pixel-forge/log/browser-logger` cannot pull a Node logger.
4. **Reporting** (Proxy) is a sibling top-level area under `src/` later (e.g.
   `src/proxy/`), not nested under `logger/`.
5. Specialize formatting per environment; only lift what is truly shared into
   `_shared` / the root export.

### Suggested shape (when you implement)

- Prefer **named exports** and factories/classes that do nothing at import time
  (`sideEffects: false`).
- Emit through `console.*` unless you have a reason not to — that keeps a future
  reporting Proxy able to see the same traffic as raw `console` use.
- Stateful defaults (global level, default instance): **one per process/document**;
  ESM-only is intentional so consumers do not load two copies with separate state.

## Log reporting (future)

Use the JS **`Proxy`** API to wrap `console` (and/or logger facades), intercept
calls, collect payloads, and forward them to log services.

Sketch (not implemented):

- A small interface for “what to do with an intercepted call” (buffer, filter,
  transport).
- A Proxy handler that forwards to the real `console` methods so local DevTools
  behavior is preserved unless the consumer opts out.
- A dedicated subpath when this lands (e.g. `proxy` or `report`) so importing a
  logger never pulls in reporting code.

Out of scope until the browser logger exists and the reporting contract is
specified.

## Package layout (current + expected)

```
packages/log/
  src/
    index.ts                ← @pixel-forge/log (shared types / LogLevel)
    logger/                 ← outputting logs (implementation tree)
      _shared/              ← Logger base (internal) + type sources
      browser-logger/       ← @pixel-forge/log/browser-logger
      # node-logger/        ← later → @pixel-forge/log/node-logger
    # proxy/                ← later → sending / collecting logs
  PLAN.md
  README.md
```

Add an environment logger = add `src/logger/<name>/`, one `tsdown` entry
(`<name>/index` → `@pixel-forge/log/<name>`), rebuild. Do not import across
environment folders; shared code belongs in `logger/_shared`.



## Non-goals (for now)

- Root barrel of environment loggers (root is shared types/`LogLevel` only)
- Dual CommonJS build
- Patching `console` on import
- A `format` subpath until its contents are clearly defined
- Exposing `Logger` or severity-order internals