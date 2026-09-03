# @edds-wallet/web

Vite + React 19 SPA - the frontend package for Edd's Wallet. Three real,
wired screens (login/profile selector, parent dashboard, Edd's wallet
view - see `src/screens/`) built on the committed design system (tokens,
fonts, icons, 17 components).

The design system is the captain's Claude Design export ("Bubblegum
Arcade") - see **`packages/web/design-system/README.md`** for the full
map of tokens, assets, components, the UI-kit reference screens, and
design guidelines. That file is the authoritative index; the table below
is a quick-start summary only.

## Run it

```sh
npm install        # from the repo root
npm run dev -w @edds-wallet/web    # or: npm run dev (root proxies here)
```

Dev server binds `127.0.0.1:5173` only (see `vite.config.ts`), consistent
with the app's localhost-only design. It needs a running
`@edds-wallet/api` backend to talk to - `vite.config.ts` proxies `/api` to
`http://127.0.0.1:3001` by default (override with `VITE_API_PROXY_TARGET`),
matching `@edds-wallet/api`'s `npm run dev` default port. From the repo
root, `npm run dev` starts both.

```sh
npm run build -w @edds-wallet/web  # type-checks then builds to dist/
```

Production (`npm start` from the repo root, once wired by the backend
package) serves this build output + the API from one origin/port - see
`packages/api/README.md` and `data/edw-mvp/brief.md` "Running it".

## Screens

| Screen | File | Behavior contract |
|---|---|---|
| Login / profile selector | `src/screens/LoginScreen.tsx` | Big tappable role tiles, optional PIN pad. Also the "Switch user" destination for both roles. |
| Parent dashboard | `src/screens/ParentDashboard.tsx` | Balance, a single combined "Add or remove money" control (`screens/parent/MoneyModal.tsx`), allowance rules create/edit/pause (`screens/parent/RuleModal.tsx`), recent activity. |
| Edd's wallet view | `src/screens/ChildWallet.tsx` | Read-only balance, "Next allowance" banner, de-emphasized "Switch user", kid-friendly transaction history. Never renders a mutating control - the backend is the actual read-only boundary, this is just the UI half. |

All three follow `data/edw-wireframes/report.md`'s approved flow and its 8
answered UX decisions; the `design-system/ui-kit/` scripts were the
layout/composition starting point, adapted into these real, state-driven,
routed (`react-router`) screens.

## Backend integration

All HTTP calls live in `src/api/client.ts` - the one module that talks to
`@edds-wallet/api`. Request/response types come from `@edds-wallet/shared`
(`api-types.ts`/`schemas.ts`/`constants.ts`), matching
`packages/api/API.md`. Session state (`src/state/SessionContext.tsx`)
drives client-side route guarding in `App.tsx`; the backend is still the
real, server-side role boundary (hidden UI is not the security boundary).

To run this against a real backend in another worktree:

```sh
git fetch origin fm/edw-backend
git worktree add ../edw-backend-run origin/fm/edw-backend
cd ../edw-backend-run && npm install && npm run dev -w @edds-wallet/api
# back here:
npm run dev -w @edds-wallet/web
```

## End-to-end test

```sh
npx playwright install chromium   # once
npm run test:e2e -w @edds-wallet/web
```

`playwright.config.ts` starts the Vite dev server itself but expects a
backend already running and reachable through the `/api` proxy (see
above). `e2e/parent-deposit-child-readonly.spec.ts` is the required smoke
test: log in as parent, add money, switch to child, confirm the child
view is read-only and shows the correct balance. Override
`E2E_PARENT_PIN` if the backend's seeded parent PIN isn't `1234`
(`EDW_PARENT_PIN` on the backend - unset by default, meaning no PIN pad
appears).

## Where things live

| What | Where | Notes |
|---|---|---|
| Design tokens (colors, type, spacing, shape, motion) | `src/styles/tokens/` | CSS custom properties, the single source of truth. `index.css` is imported once (see `src/main.tsx`) then everything is available via `var(--color-primary)`, `var(--space-4)`, etc. anywhere. |
| App icon / brand marks | `src/assets/logo.svg`, `src/assets/piggy-mark.svg` (logo also served as the favicon at `public/icon.svg`) | "Happy Piggy" concept, pink/coral gradient squircle + white piggy silhouette. |
| In-app icon set | `src/assets/icons/icon-*.svg` | "Chunky Filled" style, six icons: add money, take out, allowance day, my balance, parent lock, unlocked. All use `currentColor` so they tint via the surrounding element's `color` (set it to a token, e.g. `var(--color-primary)`). Prefer the `Icon` component (`src/components/core/Icon.tsx`) over importing these files directly - it inlines the same paths and is already typed. |
| Components | `src/components/{core,forms,wallet}/` | 17 TypeScript components (buttons, cards, balance card, PIN pad, etc.). See `design-system/README.md` for the full inventory. |
| App shell | `src/App.tsx` | `react-router` routes (`/`, `/parent`, `/child`) plus the `SessionProvider`/`RequireRole` route guard. |

## Conventions

- Consume design tokens via the CSS custom properties in `styles/tokens/`;
  don't hardcode hex values, font names, spacing or radii in components.
- New icons should follow the existing "Chunky Filled" pattern
  (`opacity="0.15"` fill + `stroke-width="3.5"`, `currentColor`-driven) so
  the set stays visually consistent - see `design-system/provenance/source-readme.md`.
- Lint/format: root-level Biome config (`biome.json`) covers this package;
  run `npm run lint` / `npm run format` from the repo root.
