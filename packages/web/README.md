# @edds-wallet/web

Vite + React 19 SPA - the frontend package for Edd's Wallet. This package
currently holds the **design system foundation only** (tokens, fonts,
icons) plus a runnable skeleton; product screens are built by the frontend
feature worker on top of this.

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
| Design tokens (colors, fonts, weights) | `src/styles/tokens.css` | CSS custom properties, the single source of truth. Import once (see `src/main.tsx`) then reference via `var(--color-primary)` etc. anywhere. |
| Font loading | `src/styles/fonts.css` | Loads Fredoka + Quicksand from Google Fonts; documents how to swap to self-hosted files without touching `tokens.css`. |
| App icon | `src/assets/icons/app-icon-happy-piggy.svg` (also served as the favicon at `public/icon.svg`) | "Happy Piggy" concept, pink/coral gradient rounded square + white piggy silhouette. |
| In-app icon set | `src/assets/icons/icon-*.svg` | "Chunky Filled" style, six icons: add money, take out, allowance day, my balance, parent lock, unlocked. All use `stroke="currentColor"`/`fill="currentColor"` so they tint via the surrounding element's `color` (set it to a token, e.g. `var(--color-primary)`). Import with Vite's `?raw` suffix and inline them (see `src/App.tsx`) rather than `<img>`, so `currentColor` still works. |
| Sanity check | `src/App.tsx` | Renders the palette swatches and all six icons. Not a product screen - replace with the real app shell, but keep the `fonts.css`/`tokens.css` imports in `src/main.tsx`. |

All values above are sourced from `data/edw-design/report.md` (Section 2.1,
2.3, 2.4, and the "Recommendation" in Section 4) - that report is the
authoritative source if a value ever needs to be re-derived or a new icon
added in the same style.

## Conventions

- Consume design tokens via the CSS custom properties in `tokens.css`;
  don't hardcode hex values or font names in components.
- New icons should follow the existing "Chunky Filled" pattern
  (`opacity="0.15"` fill + `stroke-width="3.5"`, `currentColor`-driven) so
  the set stays visually consistent.
- Lint/format: root-level Biome config (`biome.json`) covers this package;
  run `npm run lint` / `npm run format` from the repo root.
