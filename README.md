# Edd's Wallet

A local-first web app for a parent to run a child's *virtual* allowance (a
home ledger; no real money moves) that also teaches basic financial
concepts. See `data/edw-mvp/brief.md` for full product scope and
`data/edw-tech-research/report.md` for the authoritative stack/architecture
this repo follows.

## Status

The foundation (shared npm-workspaces skeleton, design system) plus the
Phase 0 **backend** are implemented: mock auth, the full schema (report
Section 3) via Drizzle migrations, balance, manual deposit/withdrawal,
allowance rules (create/edit/pause/resume) with a catch-up-safe
scheduler, and the server-side read-only child mode gate. See
`packages/api/README.md` and `packages/api/API.md` for details. The
frontend SPA's product screens are separate follow-on work against
`packages/web`.

## Repo layout

```
packages/
  web/      Vite + React 19 SPA. Design system (tokens/fonts/icons) lives
            here - see packages/web/README.md.
  api/      Fastify API server (mock auth, schema/migrations, ledger,
            allowance scheduler). See packages/api/README.md and
            packages/api/API.md.
  shared/   Zod schemas + TypeScript types shared between web and api
            (the request/response contract). See packages/shared/README.md.
```

## Run it

```sh
npm install
npm run dev      # starts the web dev server (127.0.0.1:5173) + the API (127.0.0.1:3001)
```

```sh
npm start        # builds the SPA, then serves SPA + API from one process (127.0.0.1:4000)
```

`npm start` auto-runs any pending Drizzle migrations (and the first-run
user seed) before it starts listening - see `packages/api/README.md` for
environment variables (DB location, ports, seeded PINs) and
`packages/api/API.md` for the endpoint contract.

## Tests

```sh
npm run test     # runs the backend's vitest suites (role-enforcement, ledger-math, etc.)
```

See `packages/api/README.md` for what each suite covers. A Playwright
end-to-end smoke test (parent deposit -> switch to child -> confirm
read-only + correct balance) is the frontend worker's to add against
`packages/web`.

## Tooling

- **Workspaces:** npm workspaces (`packages/*`), Node `^22.12 || >=24`.
- **Lint/format:** Biome (`npm run lint`, `npm run format`).
- **TypeScript:** shared strict base config in `tsconfig.base.json`,
  extended per package. `npm run typecheck` runs it across all
  workspaces.
