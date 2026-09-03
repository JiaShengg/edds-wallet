# Edd's Wallet API - Phase 0

This is the contract the frontend (`@edds-wallet/web`) integrates against.
Typed request/response shapes live in `@edds-wallet/shared`
(`packages/shared/src/api-types.ts` and `schemas.ts`) - import those
rather than re-declaring the shapes.

## Base URL and CORS

- **Production (`npm start`):** one process, one origin - the API and the
  built SPA are served from the same `http://127.0.0.1:<PORT>` (default
  `4000`). No CORS needed; use relative paths (`fetch('/api/...')`).
- **Dev (`npm run dev`):** the API runs on its own port
  (`http://127.0.0.1:<EDW_API_PORT>`, default `3001`), separate from the
  Vite dev server (`127.0.0.1:5173`). The API allows credentialed CORS
  from `EDW_WEB_DEV_ORIGIN` (default `http://127.0.0.1:5173`). Point dev
  `fetch()` calls at the API's dev origin explicitly (or add a Vite proxy
  in `packages/web/vite.config.ts` for `/api` - that file belongs to the
  frontend worker), and always pass `credentials: 'include'` so the
  session cookie is sent cross-port.

## Auth model

Mock auth, real session mechanics (see `data/edw-tech-research/report.md`
Section 4). The client never sends a role or account id the server
trusts - only an httpOnly `edw_session` cookie, set by
`POST /api/auth/login` and cleared by `POST /api/auth/logout`. Every
`fetch()` call needs `credentials: 'include'` (or `same-origin` in
production, which is the default and sufficient there).

Login flow:
1. `GET /api/auth/profiles` - public, no cookie needed. Renders the login
   screen's tappable tiles.
2. `POST /api/auth/login` `{ userId, pin? }` - `pin` is only required if
   the chosen profile's `hasPin` was `true`. Sets the session cookie.
3. `POST /api/auth/logout` - "Switch user", works for either role.

## Errors

Non-2xx responses are JSON: `{ "error": "<machine_code>", "message":
"<human string>" }` (see `ApiErrorBody` in `@edds-wallet/shared`). Notable
codes: `unauthorized` (401, no/invalid session), `forbidden` (403, valid
session but wrong role), `not_found` (404), `invalid_request` (400, body
failed validation), `insufficient_balance` (400, a withdrawal would
overdraw the pocket).

## Endpoints

All monetary amounts are **integer cents**. Dates are ISO 8601 strings
(`created_at`-style) except `anchorDate`, which is a plain `YYYY-MM-DD`
calendar date.

### Public

| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/api/auth/profiles` | - | `AuthProfilesResponse`. Never includes PIN data, only `hasPin`. |
| POST | `/api/auth/login` | `LoginRequest` | `LoginResponse`. 401 on bad profile id or wrong/missing PIN. |

### Any signed-in role (parent or child)

| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/api/auth/logout` | - | 204. Revokes the current session. |
| GET | `/api/auth/session` | - | `SessionResponse`. 401 if not signed in. |
| GET | `/api/account/balance` | - | `BalanceResponse`. |
| GET | `/api/account/transactions` | query: `limit?` (1-200, default 50), `before?` (cursor) | `TransactionsResponse`, newest first (no date grouping - see `data/edw-wireframes/report.md` UX decision #5). Page back with `?before=<nextCursor>`. |
| GET | `/api/account/allowance/next` | - | `NextAllowanceResponse`. `nextAllowance` is `null` if the allowance concept isn't unlocked yet or there's no active rule - render nothing in that case (UX decision #6). |
| GET | `/api/account/concept-unlocks` | - | `ConceptUnlocksResponse`. Phase 0 only ever has `balance` (always unlocked) and `allowance` (unlocked on first rule) entries populated; `savings_interest`/`loans`/`credit_card` rows don't exist yet. |

A child session hits the exact same read endpoints as a parent - there is
no parallel "child API". The response is scoped server-side to the
child's own account either way (`request.session`-derived, never a
client-supplied id).

### Parent only (403 for a valid child session)

| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/api/money/actions` | `MoneyActionRequest` | The single combined "add or remove money" action (UX decision #3) - `type: 'deposit' \| 'withdrawal'` picks the sign server-side. 201 with the new balance + created entry. 400 `insufficient_balance` if a withdrawal would overdraw. |
| GET | `/api/account/allowance-rules` | - | `AllowanceRulesResponse`. All rules for the account (active and paused). |
| POST | `/api/account/allowance-rules` | `AllowanceRuleCreateRequest` | 201. Creates an active rule, unlocks the `allowance` concept if it wasn't already, and immediately runs the catch-up scheduler (so a past `anchorDate` pays out right away instead of waiting for the next boot). |
| PATCH | `/api/account/allowance-rules/:id` | `AllowanceRuleUpdateRequest` (any subset) | 200. Edits amount/frequency/anchorDate/memo; re-runs the catch-up scheduler afterward. |
| POST | `/api/account/allowance-rules/:id/pause` | - | 200. Single-tap toggle, no confirmation (UX decision #7). |
| POST | `/api/account/allowance-rules/:id/resume` | - | 200. See "Pause/resume semantics" below. |

## Pause/resume semantics (a Phase 0 design choice worth knowing)

Resuming a paused allowance rule does **not** retroactively pay out
whatever was missed during the pause, and does **not** trigger an
immediate payout at the moment of resuming. Instead, resuming re-anchors
the rule one full period ahead of "now", so the schedule restarts
cleanly: the next payout lands exactly one period after resuming. This
avoids two bad outcomes with a simpler mechanism than a dedicated
occurrence-cursor column: a silent lump-sum backlog dump, and an
unwanted "resume day" payout. If a future phase wants "resume and
immediately catch up," that's a deliberate product decision, not a bug -
flag it as a requirement rather than assuming the current behavior is
wrong. See `src/routes/allowance-rules.ts`'s `setActive` for the exact
mechanism.

## Concept unlocks in Phase 0

Only two concepts are wired to real data this phase:

- `balance` - unlocked automatically the moment the account is seeded.
- `allowance` - unlocked automatically the moment the parent creates the
  first allowance rule (mirrors how `savings_interest` will unlock on the
  first savings pocket in a later phase, per
  `data/edw-tech-research/report.md` Section 5).

There is no Phase 0 endpoint to manually lock/unlock a concept or set a
PIN after first boot - the mock-auth seed step (`src/db/seed.ts`) is the
only place PINs are set right now, via `EDW_PARENT_PIN`/`EDW_CHILD_PIN`
environment variables read once on first run (a household with no PIN
set logs in with one tap, per the brief's captain decision #2). Adding a
settings screen for this is a reasonable follow-up but wasn't in this
phase's wireframes.

## Single-child simplification

Phase 0 is single-child only (captain decision #1). A parent session has
no account of its own; `resolveManagedAccountId` (`src/lib/
account-resolver.ts`) resolves "the" child's account by finding the sole
`role='child'` user. A future multi-child phase changes only that one
function (e.g. to take an explicit child id and *authorize* it against
the parent's children server-side) - no route changes required.

## Role enforcement, for anyone adding a route

Every route this API registers must have exactly one entry in
`src/lib/route-manifest.ts`, classified `'parent'`, `'session'`, or
`'public'`. `test/role-enforcement.test.ts` diffs that manifest against
Fastify's live route registry in both directions and fails the build if
they disagree - so a new mutating route can't ship without an explicit,
reviewed role decision. See that file's header comment before adding a
route.
