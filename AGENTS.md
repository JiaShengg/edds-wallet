# Project agent memory

This file is the project's committed home for project-intrinsic agent knowledge: build, test, release, architecture, and sharp-edge notes that should travel with the code.

## Authoritative sources

- Stack, architecture, data model, mock-auth design, and phased scope:
  `data/edw-tech-research/report.md`. Follow it for anything backend/schema
  related; don't re-derive from first principles.
- Locked design decisions (Bubblegum Arcade palette, Fredoka/Quicksand
  fonts, Happy Piggy app icon, Chunky Filled in-app icons): the captain's
  Claude Design export, imported into `packages/web/design-system/` and
  `packages/web/src/{styles/tokens,assets,components}/` - see
  `packages/web/design-system/README.md` for the map and
  `packages/web/design-system/provenance/source-readme.md` for full design
  intent (voice, layout, interaction states, gaps/substitutions). These are
  the materialized, single-source-of-truth copies of those decisions -
  consume the tokens/components, don't reinvent values or hand-roll new
  ones. `data/edw-design/report.md` Section 4 is the original design
  research this export superseded.
- Product/MVP scope: `data/edw-mvp/brief.md`.
- UX behavior contract for the three Phase 0 screens (login, parent
  dashboard, child wallet), including the 8 captain-answered UX decisions:
  `data/edw-wireframes/report.md`. Treat it as authoritative for
  flow/copy/interaction; `packages/web/design-system/ui-kit/` was only the
  layout/composition starting point.
- Backend API contract: `packages/api/API.md` plus `@edds-wallet/shared`'s
  `api-types.ts`/`schemas.ts`/`constants.ts`.

## Repo layout

npm workspaces monorepo: `packages/web` (Vite + React 19 SPA - design
system plus the three real Phase 0 screens under `src/screens/`, see
`packages/web/README.md`), `packages/api` (Fastify API server - Phase 0
backend is implemented: mock auth, full schema/migrations, ledger,
allowance scheduler), `packages/shared` (Zod schemas + response DTO types
shared between web/api - the request/response contract). See each
package's README.md, and `packages/api/API.md` for the endpoint contract
the frontend integrates against.

## Frontend/backend integration

All web `fetch()` calls live in `packages/web/src/api/client.ts` - the one
module that talks to the API. In dev, `packages/web/vite.config.ts`
proxies `/api` to `http://127.0.0.1:3001` (the API's `npm run dev`
default; override with `VITE_API_PROXY_TARGET`), so `npm run dev` from the
repo root (or two terminals running each package's `dev` script) is
enough to exercise the full app locally. The required Playwright e2e
smoke test (`packages/web/e2e/`, `npm run test:e2e -w @edds-wallet/web`)
needs a real backend running - see `packages/web/README.md` "End-to-end
test".

## Tooling

- Lint/format: Biome (`npm run lint`, `npm run format` from repo root;
  config in `biome.json`). Not ESLint/Prettier - keep it to one tool.
  `packages/web/design-system/{ui-kit,guidelines,provenance}` are excluded
  from both (verbatim vendor/reference material from the design export,
  not app source - don't reformat or fix-lint them, treat their content as
  read-only).
- TypeScript: shared strict base in `tsconfig.base.json`, extended per
  package. `npm run typecheck` runs it across all workspaces.
- Node: `^22.12 || >=24` (matches Vite 8's engine requirement).
- Backend tests: `npm run test` (root) or `npm run test -w @edds-wallet/api`
  runs the vitest suites - see `packages/api/README.md` for what each one
  covers.

## Backend runtime: raw TypeScript, no build step

`packages/api` runs its `.ts` source directly via Node's native TypeScript
support (`node src/start.ts` / `node --watch src/dev.ts`) - there is no
transpile/`dist` step for the API (unlike `packages/web`, which still
goes through `tsc -b && vite build`). Two things this requires, both
already followed throughout `packages/api/src`:

- Every relative import needs an explicit `.ts` extension (Node resolves
  `.ts` files itself; it doesn't do extensionless/bundler-style
  resolution). `tsconfig.json`'s `allowImportingTsExtensions` makes `tsc
  -b --noEmit` accept this.
- Only *erasable* TypeScript syntax is safe at runtime: no `enum`, no
  `namespace`, and critically **no constructor parameter properties**
  (`constructor(public readonly x: number)`) - Node's stripper rejects
  those with `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` because they require an
  actual code transform, not just type-erasure. Declare fields normally
  and assign them in the constructor body instead.
- `@edds-wallet/shared`'s `package.json` `main`/`types` point straight at
  `./src/index.ts` for the same reason - it's imported as raw TS by both
  Vite (bundles it) and the API (Node strips it at import time), no build
  step in either direction.

## Fastify hooks: always declare `async`

A plain synchronous 2-argument hook/`preHandler` (`(request, reply) =>
{...}`, no `async`, no third `done` callback) is ambiguous to Fastify's
hook runner and can hang the request forever instead of proceeding or
erroring - confirmed directly in this environment. Every hook and
`preHandler` in `packages/api/src/auth/*` and `src/routes/*` is declared
`async` (even ones with nothing to await) specifically to avoid this;
keep doing that for any new one.

## SQLite driver: `better-sqlite3`, not `node:sqlite`

`data/edw-tech-research/report.md` recommended `node:sqlite` as primary
with `better-sqlite3` as a documented fallback. In practice, as of this
repo's dependency versions, `drizzle-orm`'s **stable** release line
(`0.45.2`) has no `node:sqlite` driver at all (that only exists on its
`1.0.0-beta`/`rc` line) - so this repo uses `better-sqlite3`
(`packages/api/src/db/connection.ts`), the report's own documented
fallback, rather than depending on an unstable ORM release for a
money-shaped app. Re-evaluate if/when `drizzle-orm` ships `node:sqlite`
support on a stable release.

## Schema/migrations

The full schema (`packages/api/src/db/schema.ts`) ships in one migration,
`packages/api/drizzle/0000_init.sql`. That file is `drizzle-kit generate`
output, hand-patched afterward to add `STRICT` to every table and the
append-only `BEFORE UPDATE`/`BEFORE DELETE` triggers on
`cash_entries`/`credit_entries` - `drizzle-kit`'s SQLite generator doesn't
emit either. Regenerating migrations for a future schema change needs the
same two patches re-applied by hand to the new file; see that file's
header comment.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
