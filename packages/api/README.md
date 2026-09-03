# @edds-wallet/api

The Fastify API server for Edd's Wallet - Phase 0 (mock auth, balance,
manual deposit/withdrawal, allowance rules, the catch-up-safe scheduler).
See `../../data/edw-tech-research/report.md` for the architecture this
follows and `API.md` in this directory for the endpoint contract the
frontend integrates against.

## Run it

From the repo root:

```sh
npm install
npm run dev     # starts this API (127.0.0.1:3001) + the web dev server (127.0.0.1:5173)
```

Or just this package:

```sh
npm run dev -w @edds-wallet/api
```

`npm start` (from the repo root) builds the SPA and serves it + the API
from one process/port (`127.0.0.1:4000` by default) - see the root
`README.md`.

Both entry points (`src/dev.ts`, `src/start.ts`) run the same boot
sequence first (`src/boot.ts`): open the two SQLite connections, run any
pending Drizzle migrations, seed the household's users on first run, and
run the catch-up allowance scheduler once.

## Environment variables

| Variable | Default | Meaning |
|---|---|---|
| `EDW_DB_PATH` | `<repo root>/data/edds-wallet.db` | SQLite file location. |
| `PORT` | `4000` | `npm start`'s single port. |
| `EDW_API_PORT` | `3001` | `npm run dev`'s API port. |
| `EDW_WEB_DEV_ORIGIN` | `http://127.0.0.1:5173` | Dev-only CORS allow-origin (the Vite dev server). |
| `EDW_PARENT_NAME` / `EDW_CHILD_NAME` | `Parent` / `Edd` | Seeded display names (first boot only). |
| `EDW_PARENT_PIN` / `EDW_CHILD_PIN` | unset (no PIN) | Seeded PIN, 4-8 digits (first boot only) - the mock-auth "seatbelt", not a security control. |

## Tests

```sh
npm run test -w @edds-wallet/api
```

- `test/role-enforcement.test.ts` - the required role-enforcement suite:
  every mutating route 403s a valid child session, diffed against
  Fastify's live route registry (see `src/lib/route-manifest.ts`).
- `test/ledger-math.test.ts` - the required ledger-math suite: derived
  balance matches a manual `SUM` over the ledger, across deposits,
  withdrawals, and catch-up scheduler payouts.
- `test/read-only-connection.test.ts` - proves the physical half of the
  read-only-child-mode gate (a write through `readDb` is rejected by
  SQLite itself) and the append-only triggers.
- `test/api-flows.test.ts` - integration coverage for the parent-deposit
  -> child-sees-it-read-only flow and allowance rule create/pause/resume.

## Schema and migrations

The full schema (`src/db/schema.ts`) is shipped in one migration,
`drizzle/0000_init.sql`, hand-patched after `drizzle-kit generate` to add
`STRICT` tables and the append-only triggers - see that file's header
comment before regenerating migrations for a future schema change.

## Directory map

```
src/
  db/            schema, the two (write / read-only) connections, migrate, seed
  auth/          session system, PIN hashing, the parentOnly route-gate plugin
  lib/           ledger math, allowance-schedule math, concept unlocks, audit log
  jobs/          the catch-up allowance scheduler
  routes/        auth (public), account (shared reads), money + allowance-rules (parent-only)
  server.ts      assembles the Fastify app
  boot.ts        shared migrate+seed+scheduler boot sequence
  dev.ts / start.ts   the two entry points
test/            vitest suites (see above)
drizzle/         the migration this package ships
```
