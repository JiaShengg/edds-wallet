# Edd's Wallet

A local-first web app for a parent to run a child's *virtual* allowance (a
home ledger; no real money moves) that also teaches basic financial
concepts. See `data/edw-mvp/brief.md` for full product scope and
`data/edw-tech-research/report.md` for the authoritative stack/architecture
this repo follows.

## Status

This is the **foundation** commit: a shared npm-workspaces skeleton plus
the design system (tokens, fonts, icons) as real files. No product
features, screens, or API routes are implemented yet - those land in
separate follow-on work against `packages/web` (frontend) and
`packages/api` (backend).

## Repo layout

```
packages/
  web/      Vite + React 19 SPA. Design system (tokens/fonts/icons) lives
            here - see packages/web/README.md.
  api/      Fastify API server package boundary (placeholder - not yet
            implemented). See packages/api/README.md.
  shared/   Validation schemas shared between web and api (placeholder -
            not yet implemented). See packages/shared/README.md.
```

## Run it

```sh
npm install
npm run dev      # starts the frontend dev server (127.0.0.1:5173)
```

Once the backend package is implemented, `npm start` will build and serve
the SPA + API as a single process/port (see
`data/edw-tech-research/report.md` Section 1/6) - not wired up yet in this
foundation commit.

## Tooling

- **Workspaces:** npm workspaces (`packages/*`), Node `^22.12 || >=24`.
- **Lint/format:** Biome (`npm run lint`, `npm run format`).
- **TypeScript:** shared strict base config in `tsconfig.base.json`,
  extended per package.
