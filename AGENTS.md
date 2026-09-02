# Project agent memory

This file is the project's committed home for project-intrinsic agent knowledge: build, test, release, architecture, and sharp-edge notes that should travel with the code.

## Authoritative sources

- Stack, architecture, data model, mock-auth design, and phased scope:
  `data/edw-tech-research/report.md`. Follow it for anything backend/schema
  related; don't re-derive from first principles.
- Locked design decisions (Bubblegum Arcade palette, Fredoka/Quicksand
  fonts, Happy Piggy app icon, Chunky Filled in-app icons), including exact
  hex values and SVG source: `data/edw-design/report.md` Section 4. The
  design system files under `packages/web/src/styles/` and
  `packages/web/src/assets/icons/` are the materialized, single-source-of-
  truth copies of those decisions - consume them, don't reinvent values.
- Product/MVP scope: `data/edw-mvp/brief.md`.

## Repo layout

npm workspaces monorepo: `packages/web` (Vite + React 19 SPA, has the
design system), `packages/api` (Fastify API server, placeholder boundary
only as of the foundation commit), `packages/shared` (schemas shared
between web/api, placeholder boundary only). See each package's README.md.

## Tooling

- Lint/format: Biome (`npm run lint`, `npm run format` from repo root;
  config in `biome.json`). Not ESLint/Prettier - keep it to one tool.
- TypeScript: shared strict base in `tsconfig.base.json`, extended per
  package. `npm run typecheck` runs it across all workspaces.
- Node: `^22.12 || >=24` (matches Vite 8's engine requirement).

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
