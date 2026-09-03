# @edds-wallet/web

Vite + React 19 SPA - the frontend package for Edd's Wallet. This package
currently holds the **design system** (tokens, fonts, icons, 17
components) plus a runnable skeleton; product screens are built by the
frontend feature worker on top of this.

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
with the app's localhost-only design.

```sh
npm run build -w @edds-wallet/web  # type-checks then builds to dist/
```

## Where things live

| What | Where | Notes |
|---|---|---|
| Design tokens (colors, type, spacing, shape, motion) | `src/styles/tokens/` | CSS custom properties, the single source of truth. `index.css` is imported once (see `src/main.tsx`) then everything is available via `var(--color-primary)`, `var(--space-4)`, etc. anywhere. |
| App icon / brand marks | `src/assets/logo.svg`, `src/assets/piggy-mark.svg` (logo also served as the favicon at `public/icon.svg`) | "Happy Piggy" concept, pink/coral gradient squircle + white piggy silhouette. |
| In-app icon set | `src/assets/icons/icon-*.svg` | "Chunky Filled" style, six icons: add money, take out, allowance day, my balance, parent lock, unlocked. All use `currentColor` so they tint via the surrounding element's `color` (set it to a token, e.g. `var(--color-primary)`). Prefer the `Icon` component (`src/components/core/Icon.tsx`) over importing these files directly - it inlines the same paths and is already typed. |
| Components | `src/components/{core,forms,wallet}/` | 17 TypeScript components (buttons, cards, balance card, PIN pad, etc.). See `design-system/README.md` for the full inventory. |
| Sanity check | `src/App.tsx` | Renders the palette swatches and all six icons. Not a product screen - replace with the real app shell, but keep the `tokens/index.css` import in `src/main.tsx`. |

## Conventions

- Consume design tokens via the CSS custom properties in `styles/tokens/`;
  don't hardcode hex values, font names, spacing or radii in components.
- New icons should follow the existing "Chunky Filled" pattern
  (`opacity="0.15"` fill + `stroke-width="3.5"`, `currentColor`-driven) so
  the set stays visually consistent - see `design-system/provenance/source-readme.md`.
- Lint/format: root-level Biome config (`biome.json`) covers this package;
  run `npm run lint` / `npm run format` from the repo root.
