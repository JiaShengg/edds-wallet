# Edd's Wallet design system

This is the captain's **Claude Design** export ("Bubblegum Arcade"),
imported and wired into `@edds-wallet/web`. It is the authoritative design
system for the app - it supersedes the foundation package's hand-authored
placeholder tokens/icons. Frontend feature work (the login, parent
dashboard and child wallet screens) should consume the pieces below rather
than reinventing colors, type, spacing or components.

## Where things live

| What | Path | Notes |
|---|---|---|
| Design tokens | `packages/web/src/styles/tokens/` | CSS custom properties: `colors.css`, `typography.css`, `spacing.css`, `shape.css`, `motion.css`, `fonts.css` (Google Fonts import). `index.css` is the single entry point, already imported once from `src/main.tsx`. Reference via `var(--color-primary)`, `var(--space-4)`, etc. - never hardcode a hex/px value that has a token. |
| Assets | `packages/web/src/assets/` | `logo.svg` (Happy Piggy app icon, gradient squircle), `piggy-mark.svg` (silhouette only, for brand-colored surfaces), `icons/icon-*.svg` (the six "Chunky Filled" in-app icons). `logo.svg` is also copied to `packages/web/public/icon.svg` as the favicon. |
| Components | `packages/web/src/components/{core,forms,wallet}/` | 17 TypeScript components ported from the export's `.jsx` + `.d.ts` pairs (props typed 1:1 from the shipped `.d.ts`). Import from the group barrel (`from '../components/wallet'`) or the top-level barrel (`from '../components'`). Each component keeps its `.prompt.md` usage note alongside it. |
| UI kit (reference only) | `packages/web/design-system/ui-kit/` | The export's click-through screen recreations (`LoginScreen`, `ParentDashboard`, `ChildWallet`, `MoneyModal`, `RuleModal`) plus `data.js` seed state and `index.html`. These are **plain browser-global `.jsx` scripts from the design tool, not part of the app build** - they are not imported by anything in `src/`. Read them for layout/copy/behavior intent, then rebuild the real screens using the TypeScript components in `src/components/`. See `ui-kit/README.md` for the click-through script. |
| Guidelines | `packages/web/design-system/guidelines/` | 20 standalone `.card.html` specimen pages (color, type, spacing, shape, motion, brand) generated from the same tokens. Open any one directly in a browser. |
| Provenance | `packages/web/design-system/provenance/` | `source-readme.md` (the full design-system writeup: voice/content rules, visual foundations, component inventory, gaps/substitutions), `SKILL.md` (agent-skill entry point from the export), `github.md` (sync record against the PRD), `ds-manifest.json` (machine-readable token/component index). |
| Aggregated stylesheet | `packages/web/design-system/styles.css` | The export's own `@import` list for `tokens/*.css`, kept verbatim for provenance and because the `guidelines/*.card.html` pages reference it by relative path. The app itself imports the tokens via `src/styles/tokens/index.css`, not this file. |

## Conventions

- **Tokens are the only source of color/type/spacing/shape/motion values.**
  If a value isn't a token yet and a screen needs it, add it to the
  relevant `src/styles/tokens/*.css` file rather than hardcoding it -
  keep `packages/web/design-system/provenance/source-readme.md`'s intent
  (Bubblegum Arcade: chunky radii, pressable bottom-edge buttons, soft
  purple-tinted shadows, bouncy motion) rather than inventing a new style.
- **Icons are the fixed six** (`add-money`, `take-out`, `allowance-day`,
  `my-balance`, `parent-lock`, `unlocked`) in the "Chunky Filled" style.
  No icon font or third-party icon library - see
  `provenance/source-readme.md`'s "ICONOGRAPHY" section before adding a
  new glyph.
- **Components consume tokens through CSS custom properties** and import
  nothing but React and each other (no CSS modules/styled-components) -
  keep that pattern for consistency when extending them.
- Full design intent (voice, layout, interaction states, gaps and
  substitutions the captain should know about) is in
  `provenance/source-readme.md` - read it before making a judgment call
  the tokens/components don't already answer.
