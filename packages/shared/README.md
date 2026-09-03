# @edds-wallet/shared

Validation schemas and API-contract types shared between `@edds-wallet/web`
and `@edds-wallet/api`, so "what a valid deposit looks like" (and every
other request/response shape) is defined exactly once.

| File | What |
|---|---|
| `src/constants.ts` | Canonical enum-like value lists (roles, ledger entry types, allowance frequencies, concept keys, ...) - the single source of truth also mirrored in the API's Drizzle `CHECK` constraints. |
| `src/schemas.ts` | Zod request-body schemas (login, the combined deposit/withdrawal action, allowance rule create/update) plus their inferred TS request types - used for server-side validation and available for client-side validation too. |
| `src/api-types.ts` | Response DTO shapes returned by `@edds-wallet/api`, so the frontend gets typed responses without reading the server source. Keep in sync with `packages/api/API.md`, the documented endpoint contract. |

Both packages import from the barrel: `import { ... } from '@edds-wallet/shared'`.
