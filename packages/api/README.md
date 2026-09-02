# @edds-wallet/api

Placeholder package boundary for the Fastify API server. This directory
exists only so npm workspaces resolve and `packages/web` and
`packages/api` sit at the same level - **no backend logic lives here yet**.

The backend feature worker builds this package per the authoritative
architecture in `data/edw-tech-research/report.md`:

- Section 1 - stack (Fastify 5, `node:sqlite`, Drizzle ORM, Zod)
- Section 2 - architecture (route-tree + read-only-connection double gate
  for child role enforcement)
- Section 3 - full data model/schema
- Section 4 - mock-auth design
- Section 5 - feature-to-implementation mapping
- Section 6 - MVP scope vs. later phases

Do not add product/API routes to this foundation PR; this stub is
intentionally empty beyond the package boundary.
