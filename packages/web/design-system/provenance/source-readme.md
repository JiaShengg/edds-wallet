# Edd's Wallet — Design System

Edd's Wallet is a local-first web app that lets a parent run a child's **virtual** allowance as a home ledger, and lets the child start learning about money by watching and using it. No real money ever moves — every dollar is a number in a local SQLite file the parent controls.

Two product truths drive every design decision:

1. **It's a teaching tool, not a bank.** PINs, sessions and roles exist to create an age-appropriate ritual, not to protect assets. So the UI is warm, chunky and playful — never corporate.
2. **The parent is always in full control.** Every mutation is parent-initiated. The child's experience is entirely observational: see the balance, see the history, know what's coming next.

The visual identity is **"Bubblegum Arcade"** — candy-bright colors modeled on arcade tokens and gumball machines, deliberately the loudest of four directions reviewed, so the product reads as a kid's toy rather than a banking app.

---

## Sources this system was built from

| Source | What it gave us | Access |
|---|---|---|
| `edds-wallet/README.md` (attached local codebase) | The authoritative PRD — product brief, user journeys, eight signed-off UX requirements, the full color palette with hex values, type pairing, app-icon SVG, and the six-icon set | Read in full |
| https://github.com/JiaShengg/edds-wallet (branch `main`) | Same PRD file; the repo contains **no application code, no assets and no stylesheets** at this commit | Read in full (1 file) |

There was no implementation code, Figma file, font binary or image asset to import. Everything in this system traces to the PRD's §6 "Design system / design tokens" section — hex values, font names, the app-icon SVG and the six in-app icon SVGs are reproduced **verbatim** from it. Geometry (spacing, radii, shadows, motion) was not specified in the source and has been designed to match the stated intent; those files say so inline.

**Explore the repo further** — https://github.com/JiaShengg/edds-wallet — if implementation code lands there later, re-reading it will let a designer match real screens rather than the PRD's description of them.

---

## Products and surfaces

One product, one deployment: a browser SPA served from `127.0.0.1` (React 19 + Vite client, Fastify + SQLite server, single `npm start`). It has three views and two roles:

- **Login** — big tappable profile tiles, one per household profile; optional per-profile PIN.
- **Parent mode** — balance, a single "Add or remove money" action, allowance rules with Edit/Pause, recent activity.
- **Child mode** — read-only balance, next-allowance banner, kid-language history.

There is no marketing site, no docs site, no mobile app and no slide template in the sources, so this system contains none.

---

## CONTENT FUNDAMENTALS

**Voice: a warm grown-up talking to a kid, and a plain-spoken tool talking to a parent.** Never a bank. Never a brand mascot.

- **Person.** The child speaks in first person about their own money; the app speaks in second person to the parent. Login tiles read **"I'm the Parent"** and **"I'm Edd"**. The child's screens say **"My balance"**, **"What happened"**. Parent screens address the parent directly: "Record a real-world payment or take money out."
- **Casing.** Sentence case everywhere, including buttons: "Add or remove money", "+ New rule", "Switch user". Section headings on parent surfaces use Title Case sparingly, as in the PRD's own labels ("Allowance Rules", "Recent Activity"). Nothing is ALL CAPS except 12px eyebrow captions.
- **No financial jargon, ever.** Not "transaction", "credit", "debit", "APR", "transfer". The product says *money*, *wallet*, *allowance*, *add*, *take out*, *showed up*.
- **Numbers stay gentle and round.** Rates and amounts shown to a child are friendly ("5%"), never realistic ("22.99% APR"). Amounts always carry two decimals and a `$`: "$5.00", "$42.50".
- **Emoji: child-facing history only.** The PRD's own kid copy uses them as row markers — **"🎉 You got $5!"**, **"📅 Your allowance showed up"**, **"🛍️ $2 left your wallet"**. One emoji, at the start of the line, standing in for an icon. Never in parent UI, never in headings, never decoratively in body copy.
- **Reassurance over restriction.** The child's read-only state is explained kindly and permanently: **"Only a grown-up can add or take away money."** Not "You do not have permission."
- **Errors are matter-of-fact and specific.** "Not enough in the wallet — $42.50 available". A wrong PIN reads "That's not it — try again". No blame, no exclamation marks in error copy.
- **Names are data, never copy.** Write "{childName}'s balance", not "Edd's balance" (UX requirement #8). The system ships with one child named Edd; the strings must not.
- **Length.** Kid lines are one clause. Parent helper text is one sentence, and explains a mechanism rather than reassuring: "Money is added automatically. If the app was closed on payday, it catches up next time you open it."

---

## VISUAL FOUNDATIONS

### Color

Twelve source colors (PRD §6.1), verbatim. Pink `#FF5DA2` leads; purple `#7C5CFF` supports gradients and secondary actions; mint `#2FE6C9` keeps the palette from turning saccharine. Text is a plum-brown `#4A2A55` — never black. The page is a pink-tinted white `#FFF5FB`, cards are pure white.

Seven derived **tints** (`--color-*-tint`) carry every wash: badge fills, icon tiles, banners. They are the only way semantic color appears at large area — full-strength semantic colors are reserved for figures, borders and small fills.

**Intensity is role-dependent** (the PRD's own usage note): child surfaces run bright and gradient; dense parent surfaces (rule lists, ledgers) stay on background/surface/muted and spend accent color sparingly.

### Gradients

Exactly two, both 135°: `--gradient-brand` (#FF9DC4 → #FF5DA2, the app-icon ramp, used for the kid balance hero and profile avatars) and `--gradient-play` (pink → purple, for celebratory moments). No blue-purple gradients, no gradient text, no gradient buttons.

### Type

**Fredoka** for display — the app name, headings, every number that matters. Its bubble-letter shape is the brand's toy signal. **Quicksand** for all body copy on both surfaces. There is no separate "grown-up" pairing; the parent surface uses the same two families at smaller sizes and denser leading.

Scale: 64 (balance figure, kid only) / 40 / 30 / 24 display · 18 / 16 / 14 / 12 body. Display leading 1.05–1.25, body 1.5. Captions are 12px/700 with 0.08em tracking, uppercase.

### Backgrounds and imagery

Flat color only. **No photography, no illustration, no pattern, no texture, no grain** — the source ships none, and none has been invented. Depth comes from the white card on the pink page, not from imagery. Where a visual moment is needed, it is a gradient balance card or a tinted icon tile.

### Layout

Single centered column: 960px max for the parent dashboard, 760px for the child view (wider type, fewer things). Parent header is a white bar with a hairline bottom; the child header floats on the page background with no bar. Nothing is fixed or sticky — these are short screens on a shared tablet. Grid/flex with `gap` throughout; 4px spacing step, kid surfaces using 16/20/24 and parent rows using 12/16.

Tap targets: 56px minimum in child mode, 44px in parent mode, 72px PIN keys.

### Borders, corners, elevation

- Corners are chunky: 10 (inner chips) / 16 (rows, inputs) / 22 (cards) / 28 (modals, heroes) / pill (badges, notices). The app icon is a 23% squircle.
- Borders are 1px `--color-hairline` (#F2DFEC) on cards and 2px on interactive things (inputs, tiles, quiet buttons). **Never a colored left-border accent bar.**
- Shadows are purple-tinted and soft: `0 6px 20px rgba(74,42,85,.08)` on cards, 12/32 raised, 24/64 for modals. Elevation grows by blur and distance, not by darkening.
- **The pressable edge is the brand's signature.** Buttons, PIN keys and quiet buttons sit on a solid 4px bottom edge (`--edge-primary`, `--edge-neutral`) like an arcade key. It is not a blur — it's a hard offset color.

### Interaction states

- **Hover:** 4% brightness lift on filled buttons, border turns pink on profile tiles, tiles rise 2px, ghost buttons underline. Never an opacity fade.
- **Press:** the bottom edge disappears and the element translates down 2px — the key travels. No scale-down, no color change.
- **Focus:** 2px purple border plus a soft purple ring `0 0 0 4px rgba(124,92,255,.35)`. Browser outlines are replaced, never removed.
- **Disabled:** 45% opacity, cursor not-allowed, edge retained.
- **Selected:** in the segmented toggle, the active segment becomes a white card with a card shadow and takes the mode's color (pink for deposit, red for withdraw).

### Motion

Short and bouncy. 120ms for presses and tints, 200ms for tiles, dots and toggles, 320ms for modals and the balance count-up. Anything that appears or fills uses the overshoot `--ease-bounce` cubic-bezier(.34,1.56,.64,1); anything settling uses `--ease-out`. Filled PIN dots pop to 1.15 scale. All durations collapse to 0 under `prefers-reduced-motion`.

### Transparency and blur

One use only: the modal backdrop — `rgba(74,42,85,.36)` with a 3px blur. Gradient cards use `rgba(255,255,255,.22)` for the icon tile inside them. Nothing else is translucent; there are no frosted panels or protection gradients, because there is no imagery to protect text against.

---

## ICONOGRAPHY

The source defines one icon style, **"Chunky Filled"**, used identically in kid mode and parent mode (an explicit product decision — no split by role).

- **Construction:** `viewBox="0 0 48 48"`, a soft `opacity: 0.15` fill under a bold `stroke-width: 3.5` rounded stroke, everything driven by `currentColor` so an icon tints from whatever wraps it. The result reads cartoon-like, not austere.
- **The set is six icons, and that is the whole set:** add money, take out, allowance day, my balance (piggy), parent lock, unlocked (star badge). They live in `assets/icons/*.svg` as standalone files and inside `Icon.jsx` as the shipped component. Both are the PRD's SVG source, unmodified.
- **No icon font, no sprite sheet, no CDN icon library.** Nothing was substituted from Lucide/Heroicons/Font Awesome, and nothing should be: a thin 1.5px stroke icon next to these looks broken. If a new surface needs a glyph outside the six, draw it to the same recipe and add it to the set.
- **Emoji as icons:** yes, but only in the child's transaction history, one per row (🎉 📅 🛍️), as specified in the PRD's kid copy. `ActivityRow variant="kid"` renders the emoji in place of the icon.
- **Unicode as icons:** only `+` in the "+ New rule" label and `−`/`+` as amount signs. No arrows, chevrons or bullets standing in for icons.
- **Brand mark:** `assets/logo.svg` is the "Happy Piggy" app icon — pink gradient squircle with a white piggy silhouette. `assets/piggy-mark.svg` is the silhouette alone for placing on brand-colored surfaces. The PRD calls the piggy an intentionally simple hand-authored placeholder that should get an illustration pass before shipping; it is used as-is here and should not be redrawn from memory.

---

## Components

17 components in three groups, each with a `.d.ts` props contract, a `.prompt.md` usage note, and a group card in the Design System tab. Every one maps to a surface the PRD defines.

**`components/core/`** — `Icon`, `Button`, `IconButton`, `Card`, `Badge`, `Modal`

**`components/forms/`** — `Field`, `SegmentedToggle`, `PinPad`

**`components/wallet/`** — `BalanceCard`, `ProfileTile`, `AllowanceRuleRow`, `ActivityRow`, `NextAllowanceBanner`, `ReadOnlyNotice`, `SwitchUserButton`, `BrandMark`

Components consume tokens through CSS custom properties and import nothing but React and each other.

### Intentional additions

The source defines no code-level component library, so the inventory above was derived from the PRD's screens and its eight UX requirements. Three components have no single named counterpart in the source and were added to keep the rest honest:

- **`Icon`** — a wrapper over the six source SVGs, so no one hand-pastes paths or substitutes another library.
- **`BrandMark`** — the header lockup (app icon + product name), needed by all three screens.
- **`Card`** — the generic container the PRD's "stat card / rules list / activity feed" blocks all imply.

Deliberately **not** built, despite being usual in a design system: Toast, Tooltip, Avatar, Tabs, Table, Switch, Checkbox, Radio, Select, Pagination, Breadcrumbs. The product has no surface for them. `Badge` is a label, not a control; pause/resume is a `Button`.

---

## UI kits

**`ui_kits/wallet-app/`** — click-through recreation of the whole product: login (tiles → PIN) → parent dashboard (money modal, rule modal, instant pause) → child wallet view. See its own `README.md` for what's clickable and what's deliberately omitted.

Savings pockets, loans and credit-card mechanics are deferred phases in the PRD with no design defined, so they appear nowhere in this system.

---

## Index

| Path | What it is |
|---|---|
| `styles.css` | The single stylesheet consumers link — `@import` list only |
| `tokens/fonts.css` | Google Fonts import for Fredoka + Quicksand |
| `tokens/colors.css` | Bubblegum Arcade palette, tints, gradients, semantic aliases |
| `tokens/typography.css` | Font stacks, weights, size scale, leading, tracking, base element styles |
| `tokens/spacing.css` | 4px spacing step, layout/padding/tap-target aliases |
| `tokens/shape.css` | Radii, border widths, shadows, the pressable edge, focus ring |
| `tokens/motion.css` | Durations, easings, reduced-motion override |
| `assets/logo.svg` | Happy Piggy app icon (gradient squircle) |
| `assets/piggy-mark.svg` | White piggy silhouette, no background |
| `assets/icons/*.svg` | The six Chunky Filled icons |
| `components/core/` | Icon, Button, IconButton, Card, Badge, Modal |
| `components/forms/` | Field, SegmentedToggle, PinPad |
| `components/wallet/` | BalanceCard, ProfileTile, AllowanceRuleRow, ActivityRow, NextAllowanceBanner, ReadOnlyNotice, SwitchUserButton, BrandMark |
| `guidelines/*.card.html` | 20 foundation specimen cards (Colors, Type, Spacing, Brand) |
| `ui_kits/wallet-app/` | Full click-through recreation of the app |
| `thumbnail.html` | Homepage tile for this design system |
| `SKILL.md` | Agent-skill entry point |
| `github.md` | Upstream source association and sync record |

---

## Gaps and substitutions

- **Fonts are loaded from Google Fonts, not shipped.** No font binaries came with the source. Fredoka and Quicksand are both the real families named in the PRD, pulled from the CDN in `tokens/fonts.css` — no substitute family was needed. If you want offline/self-hosted builds, send the `.woff2` files and this becomes local `@font-face` rules.
- **No implementation code existed to match.** Screens follow the PRD's described layouts and the eight UX requirements, not a real running app. Exact paddings and type sizes in the kit are this system's, not the product's.
- **Spacing, radii, shadow, motion and state tokens are designed, not sourced.** The PRD specifies color, type and icons only.
- **No logo beyond the PRD's placeholder piggy.** It is used verbatim; nothing was drawn from memory or invented.
- **No illustration, photography or pattern library** exists to copy in.
