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

## Repo layout

npm workspaces monorepo: `packages/web` (Vite + React 19 SPA, has the
design system), `packages/api` (Fastify API server, placeholder boundary
only as of the foundation commit), `packages/shared` (schemas shared
between web/api, placeholder boundary only). See each package's README.md.

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

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
