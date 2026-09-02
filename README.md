# Edd's Wallet

**Product Requirements Document (PRD) - Phase 0**

This README is the authoritative product requirements document for Edd's Wallet. It synthesizes the product brief, technical research, UX wireframe review, and design direction into a single, self-contained reference. It is written for a human reader who needs to understand what this product is, what has been decided, and why - including enough detail to recreate the visual design system from scratch (e.g. in Claude Design) without re-reading any other source.

---

## 1. Product brief

**Edd's Wallet is a local-first web app that lets a parent run a child's virtual allowance as a home ledger, and lets the child begin learning basic financial concepts by watching and using it.**

No real money ever moves. Every dollar in the app is virtual - a number in a local database that the parent controls, standing in for real-world pocket money and chores-based allowance. The app exists to make an already-common parenting practice (giving a kid an allowance, tracking chores, deciding when they're ready to understand saving, borrowing, and credit) tangible, visual, and a little bit fun for a young child, while giving the parent a simple, trustworthy tool to manage it.

Two things anchor every decision in this document:

- **It's a teaching tool, not a bank.** The "security" in this app (PINs, sessions, roles) exists to create a believable, age-appropriate ritual and to enforce who is allowed to change the ledger - not to protect real assets. This shapes the tone (warm, playful, never corporate) and the auth model (mock auth with real enforcement underneath - see Section 4).
- **The parent is always in full control.** Every mutation - deposits, withdrawals, allowance rules, and eventually loans/credit/interest - is parent-initiated. The child's experience is entirely observational: see the balance, see the history, understand what's coming next.

---

## 2. Target users

### The parent

- Wants a fast, low-friction way to log real-world allowance/chore payments into a system the child can see and trust.
- Wants full control over rules (how much, how often) without needing to remember to manually pay every week - i.e. wants automation with visibility, not a spreadsheet.
- Wants to introduce financial concepts (saving, borrowing, credit) to their child gradually and deliberately, on their own timeline, not have the app assume the pace.
- Needs a "lightweight lock" so a sibling or the child themselves can't casually switch into parent mode and change numbers, without the app pretending to be a real banking security product.

### The child ("Edd")

- A young child who wants to see "how much money do I have" and "when do I get more," in plain language with no jargon.
- Needs one-tap access on a shared family device - no typing, no reading a username, no real login friction.
- Should never be able to accidentally (or deliberately) change the balance, rules, or history - the app should feel safe to hand to them.
- Benefits from small moments of delight (kid-friendly copy, warm colors, a sense of "my wallet is growing") that make the abstract concept of money concrete.

---

## 3. Key user journeys

These flows are based on the validated wireframe prototype (Gate 3 review) and are the baseline for Phase 0 implementation.

### 3.1 Parent logs in and manages the ledger

1. Parent opens the app in a browser and sees the login screen: big tappable tiles, one per profile ("I'm the Parent", "I'm Edd").
2. Parent taps their tile, which shows a PIN pad (since the parent profile has a PIN set in this household). They enter it and land on the **Parent Dashboard**.
3. Dashboard shows: a balance stat card, a single **"Add or remove money"** action, an **Allowance Rules** list (with per-rule Edit/Pause), and a **Recent Activity** feed.
4. To record a real-world payment or take money out, the parent taps "Add or remove money," which opens one modal with a segmented Deposit/Withdraw toggle inside (not two separate buttons) - amount, memo, and insufficient-balance validation are shared fields inside that one modal.
5. To set up or change automatic allowance, the parent uses the Allowance Rules list: "+ New rule" or "Edit" both open the same modal dialog (amount, frequency, anchor date). "Pause" is an instant one-tap toggle - no confirmation dialog.
6. A prominent, normal-weight "Switch user" button is always visible in parent mode, returning to the login screen.

### 3.2 Child logs in and views their wallet (read-only)

1. Child taps their own tile on the login screen - no PIN pad, since child profiles are PIN-optional and this household leaves Edd's unset. One tap lands directly on **Edd's Wallet View**.
2. Edd sees: a read-only balance, a "Next allowance" banner ("Next allowance: next Monday - $5.00") computed from the active allowance rule (hidden entirely if there is no active rule), a persistent reminder that "only a grown-up can add or take away money," and a flat, reverse-chronological transaction history in kid-friendly language (e.g. "🎉 You got $5!", "📅 Your allowance showed up", "🛍️ $2 left your wallet").
3. "Switch user" is present but deliberately small and muted (icon-first, low visual weight) in child mode - same destination as the parent's button, intentionally less inviting to tap so the child isn't drawn to it.
4. Every control the child sees is view-only. There is no path in the UI to a mutating action, and this is also enforced independently on the server (Section 4).

### 3.3 Switching users on a shared device

- "Switch user" is available from both modes at all times and simply returns to the login screen, ending the current session. This is the expected pattern for a single shared family device passed between parent and child, so it must always be reachable and never require confirmation.

---

## 4. Technical decisions

### 4.1 The five captain decisions (authoritative)

These five decisions were made explicitly by the product owner ("the captain") and override any conflicting recommendation elsewhere in this document or in the underlying research:

1. **Single child, named Edd, for Phase 0.** The database schema supports multiple children with no structural change, but the Phase 0 UI and flows are built for exactly one child.
2. **Optional per-profile PIN, as a non-security "seatbelt."** A profile with no PIN logs in with a single tap. A PIN, where set, exists to stop a casual switch into parent mode - it is explicitly *not* presented or built as a real security control protecting real assets.
3. **Kid-friendly, gentle numbers everywhere.** Any rates or amounts shown to the child (interest, allowance figures, etc.) use simple, round, friendly numbers (e.g. "5%") rather than realistic real-world figures (e.g. real credit card APRs of 20%+). All child-facing copy is warm, simple, and free of financial jargon.
4. **Localhost only.** The server binds to `127.0.0.1` only. Nothing else on the home network can reach it; there is no LAN exposure and no plan to add one in this phase.
5. **Browser app, no desktop wrapper.** "Runs locally" means opening a URL in a normal web browser. No Electron, no Tauri, no installed app packaging in this phase.

### 4.2 Architecture and stack (summary)

The full technical design lives in the tech-research report and is authoritative for implementation detail; this section summarizes it at PRD level.

- **One language, one repo.** TypeScript across client and server, in a single npm-workspaces repo. One command for development (`npm run dev`) and one command to just run it (`npm start` - a single process, single port, serving the built SPA and the API together, auto-running any pending database migrations before it starts listening).
- **Client:** a React 19 single-page app built with Vite, client-rendered only (no SSR needed - this is a local tool with no SEO or cold-load requirement). React Router handles the small amount of view switching needed (parent views vs. child view).
- **Server:** a Fastify API server. Fastify's plugin encapsulation model is used deliberately so that every mutating route is structurally grouped behind a single role-check boundary, rather than relying on scattered per-route `if` checks.
- **Database:** SQLite, accessed through Drizzle ORM, via Node's built-in `node:sqlite` driver (with `better-sqlite3` documented as a drop-in fallback if needed). One local database file, journaled in WAL mode.
- **Ledger design principle:** the ledger is the source of truth. Every balance (spending, and in later phases savings/loans/credit) is *derived* via `SUM()` over an append-only ledger table - never stored as a separately mutable counter. Amounts are stored as integer cents to avoid floating-point drift. Historical ledger rows are protected from edits or deletes by database-level triggers.
- **Full schema on day one.** All Phase 0 and later-phase tables (accounts, pockets, cash ledger, credit lines, credit ledger, allowance rules, concept unlocks, audit log, users, sessions) are created via Drizzle migrations at the start, even though only a subset has live features in Phase 0. This avoids painful, high-risk schema migrations later against a real family's data.

### 4.3 Security posture: mock auth, real enforcement

Because this is a family teaching tool and not a system protecting real assets, authentication is intentionally "mocked" - but the *enforcement* of who can do what is built as if it were real, so it never needs to be re-architected when needed.

- **Login is a fake front door on a real session system.** Big tappable profile tiles, an optional PIN, and (on success) a genuine opaque random session token stored in an httpOnly cookie, looked up server-side against a sessions table on every request. The client never tells the server its own role or account - the server always derives it from the session.
- **Child mode is read-only, enforced in two independent ways**, so a single bug or oversight can't silently open a write path to a child session:
  1. **Structural route boundary:** every mutating route lives inside a single Fastify plugin scope guarded by a parent-only role check, so a mutating route can't exist outside that guard without a visible, deliberate mistake.
  2. **Database-connection boundary:** all read-path handlers, reachable by both roles, use a second SQLite connection physically opened as read-only, so even a handler bug that tried to write would be rejected by the database engine itself, independent of any application-level check.
- **Swappable by design.** If real authentication is ever wanted later, only the login endpoint needs to change; every downstream session and role check stays exactly as it is.
- **Localhost-only binding (captain decision 4, Section 4.1)** is itself a meaningful part of the security posture: since the server is not reachable from the home network at all, the mock-auth model's honesty about not protecting "real" access is an acceptable, deliberate tradeoff rather than an oversight.

---

## 5. UX requirements

The following eight requirements come from the captain's sign-off during the Gate 3 wireframe review. Each row reproduces the decision that was made and the concrete behavior it requires.

| # | Topic | Captain's decision | Requirement |
|---|---|---|---|
| 1 | "Switch user" visibility in child mode | Make it smaller and less prominent in child mode | Parent mode keeps a normal-weight, clearly visible "Switch user" button. Child mode uses a small, muted, icon-first control instead - same destination, deliberately lower visual weight so it doesn't invite taps. |
| 2 | PIN requirement | Optional per-profile PIN, as already designed | Parent profile has a PIN; child profile(s) do not require one. This matches the mock-auth "seatbelt" design in Section 4.3 - no change needed beyond confirming it. |
| 3 | Deposit vs. withdraw controls | One combined control with a mode toggle inside | A single "Add or remove money" action opens one modal containing a segmented Deposit/Withdraw toggle, with shared fields (amount, memo, insufficient-balance validation) underneath. This is a client-side UX simplification only - deposits and withdrawals remain distinct ledger entry types on the server. |
| 4 | Allowance rule editing surface | Modal dialog | Both creating and editing an allowance rule use the same modal dialog pattern. |
| 5 | Child's transaction history grouping | Flat reverse-chronological list | No date-header grouping is needed for Phase 0; the history is a simple newest-first list. |
| 6 | Should the child see the next allowance date? | Yes, show a banner | A "Next allowance: \<when\> - \<amount\>" banner appears on the child's view, computed from the active allowance rule, and is hidden entirely when there is no active rule. This should be computed server-side (the same catch-up-safe scheduling logic used for actual payouts), not on the client, and filtered by the allowance concept-unlock the same way as the rest of the allowance feature. |
| 7 | Pausing an allowance rule | Instant toggle, no confirmation | Pause/Resume on an allowance rule is a single tap with no confirmation dialog. |
| 8 | Hardcoding the child's name in flow copy/diagrams | Generalize - "it doesn't have to be Edd" | The child's display name is treated as data everywhere in the UI (read from the account/user record), not hardcoded into copy strings, so a future multi-child rollout is a data change, not a UI rewrite. Phase 0 still defaults to and ships with a single child named "Edd," per captain decision 1 (Section 4.1) - this only affects *how* the name is wired in, not the Phase 0 scope. |

---

## 6. Design system / design tokens

The visual identity below was locked in during the Gate 4 design-direction review. It is reproduced here in full - exact hex values, font choices, and icon direction - so the design system can be recreated (e.g. in Claude Design) directly from this document, without needing the original review artifact.

### 6.1 Color palette - "Bubblegum Arcade"

Candy-bright colors modeled after arcade tokens and gumball machines, chosen deliberately as the loudest and most maximalist of four options reviewed, to keep the product feeling like a kid's toy rather than a corporate banking product. Purple gives room for playful gradients; the mint accent keeps it from feeling too saccharine.

| Token | Hex | Usage |
|---|---|---|
| Primary | `#FF5DA2` | Primary brand pink - main buttons, headline accents, app icon gradient start |
| Primary (dark) | `#D93E82` | Pressed/hover state for primary, darker gradient stop |
| Secondary | `#7C5CFF` | Secondary actions, gradients, playful accents |
| Accent | `#2FE6C9` | Mint accent - highlights, badges, small pops of contrast |
| Background | `#FFF5FB` | App background |
| Surface | `#FFFFFF` | Cards, modals, elevated surfaces |
| Text | `#4A2A55` | Primary text color |
| Muted | `#9A7FB0` | Secondary/muted text, captions |
| Success | `#3DDC97` | Positive states (deposit confirmed, rule active) |
| Warning | `#FFC93C` | Caution states (e.g. paused rule) |
| Error | `#FF5D5D` | Errors, insufficient-balance validation |
| Info | `#5DA9FF` | Informational states/badges |

**Usage note:** because this palette is intentionally high-energy, parent-facing screens with denser content (allowance-rule management, transaction ledger tables) should lean on the background/surface/muted tokens and use accent colors more restrainedly there, rather than saturating every parent surface at full intensity. The child-facing view can and should run brighter and more playful.

Reference CSS custom properties (for direct reuse):

```css
:root {
  /* Bubblegum Arcade palette */
  --color-primary: #FF5DA2;
  --color-primary-dark: #D93E82;
  --color-secondary: #7C5CFF;
  --color-accent: #2FE6C9;
  --color-bg: #FFF5FB;
  --color-surface: #FFFFFF;
  --color-text: #4A2A55;
  --color-muted: #9A7FB0;
  --color-success: #3DDC97;
  --color-warning: #FFC93C;
  --color-error: #FF5D5D;
  --color-info: #5DA9FF;
}
```

### 6.2 Typography

| Role | Font | Weights | Notes |
|---|---|---|---|
| Display / headings | **Fredoka** | 500, 600, 700 | Used for the app name, headings, and big balance numbers. Bubble-letter shape gives headline moments a bold, toy-like feel. |
| Body | **Quicksand** | 400, 500, 600, 700 | Used for all body copy, on both the child and parent surfaces. Thinner strokes than Fredoka keep it readable and breezy at smaller sizes. |

Both are loaded from Google Fonts. Fredoka and Quicksand are used together across *both* parent and child surfaces - there is no separate "grown-up" font pairing in Phase 0.

```css
:root {
  --font-display: 'Fredoka', system-ui, sans-serif;   /* headings, big numbers, app name */
  --font-body: 'Quicksand', system-ui, sans-serif;     /* body copy, both kid and parent surfaces */
}
```

### 6.3 App icon - "Happy Piggy"

A pink/coral gradient, rounded-square ("squircle") home-screen icon with a white piggy-bank silhouette: ellipse body, circular snout with two nostril dots, a triangular ear, a curled tail, a coin-slot rectangle, a dot eye, and two stub legs. Chosen for being classic, instantly readable as "savings," and legible even at very small sizes. Its gradient matches the Bubblegum Arcade primary/primary-dark almost exactly, so the app icon and the in-app palette read as one coherent system.

- Background: `linear-gradient(135deg, #FF9DC4, #FF5DA2)`, rounded-square corner radius approximately 22-25% of the icon's side (an iOS-style squircle).
- Foreground: white piggy silhouette, `viewBox="0 0 100 100"`.

```svg
<svg viewBox="0 0 100 100">
  <ellipse cx="50" cy="58" rx="34" ry="26" fill="#fff"/>
  <circle cx="78" cy="52" r="10" fill="#fff"/>
  <circle cx="82" cy="48" r="2" fill="#4A2A55"/>
  <circle cx="82" cy="56" r="2" fill="#4A2A55"/>
  <path d="M60 34 L68 22 L72 36 Z" fill="#fff"/>
  <path d="M18 50 q-10 -4 -8 -16 q10 2 12 12 Z" fill="#fff"/>
  <circle cx="42" cy="52" r="3" fill="#4A2A55"/>
  <rect x="46" y="34" width="16" height="4" rx="2" fill="#4A2A55"/>
  <rect x="30" y="80" width="8" height="12" rx="3" fill="#fff"/>
  <rect x="64" y="80" width="8" height="12" rx="3" fill="#fff"/>
</svg>
```

This SVG is an intentionally simple, hand-authored placeholder that establishes the concept. Before shipping a production app icon/favicon/PWA icon set, it should be run through an illustration/icon pass for consistent stroke weights at all target sizes (16/32/180/512px) and safe-area padding for platform icon masking.

### 6.4 In-app iconography - "Chunky Filled"

A single icon style is used everywhere - kid mode and parent mode both - with no split by role (an explicit captain choice). Each icon uses a soft `opacity: 0.15` fill plus a bold `stroke-width: 3.5` rounded stroke, driven by `currentColor` so icons tint automatically with whatever palette color wraps them (`--color-text` for neutral contexts, or a semantic color like `--color-primary`/`--color-success` for emphasis). The result reads as confident and cartoon-like rather than austere.

Six icons cover the Phase 0 + near-term surface: add money, take out, allowance day, my balance, parent lock, unlocked. Reference SVGs (`viewBox="0 0 48 48"`):

```svg
<!-- add money -->
<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="26" r="16" fill="currentColor" opacity="0.15"/><circle cx="24" cy="26" r="16" stroke="currentColor" stroke-width="3.5"/><path d="M24 19v14M18 24l6-6 6 6" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>

<!-- take out -->
<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="26" r="16" fill="currentColor" opacity="0.15"/><circle cx="24" cy="26" r="16" stroke="currentColor" stroke-width="3.5"/><path d="M24 19v14M18 27l6 6 6-6" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>

<!-- allowance day (calendar) -->
<svg viewBox="0 0 48 48" fill="none"><rect x="9" y="12" width="30" height="26" rx="6" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="3.5"/><path d="M9 20h30" stroke="currentColor" stroke-width="3.5"/><path d="M16 8v8M32 8v8" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><circle cx="24" cy="29" r="4" fill="currentColor"/></svg>

<!-- my balance (piggy) -->
<svg viewBox="0 0 48 48" fill="none"><ellipse cx="24" cy="27" rx="16" ry="12" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="3.5"/><circle cx="36" cy="24" r="5" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="3"/><rect x="20" y="16" width="8" height="3" rx="1.5" fill="currentColor"/><circle cx="18" cy="27" r="2" fill="currentColor"/></svg>

<!-- parent lock -->
<svg viewBox="0 0 48 48" fill="none"><rect x="12" y="22" width="24" height="18" rx="5" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="3.5"/><path d="M17 22v-6a7 7 0 0 1 14 0v6" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" fill="none"/><circle cx="24" cy="30" r="2.5" fill="currentColor"/></svg>

<!-- unlocked! (star badge) -->
<svg viewBox="0 0 48 48" fill="none"><path d="M24 8 L28.5 19 L40 20 L31 27.5 L34 39 L24 32.5 L14 39 L17 27.5 L8 20 L19.5 19 Z" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/></svg>
```

---

## 7. Scope

### 7.1 Phase 0 (this build)

- **Mock auth:** profile-tile login, optional PIN per profile, always-visible "Switch user," real server-side session enforcement (Section 4.3).
- **Full database schema created via migrations on day one** - every table needed for every phase below (accounts, pockets, cash ledger, credit lines, credit ledger, allowance rules, concept unlocks, audit log, users, sessions) - even though only a subset has live features this phase.
- **Live features:** balance, manual deposit/withdrawal, and allowance rules (create/edit/pause) with a catch-up-safe scheduler that computes any missed payouts whenever the app is opened (it is not expected to run as a 24/7 background service). The `balance` and `allowance` entries in the concept-unlock table are wired and live.
- **Parent mode:** full control - deposit, withdraw, create/edit/pause allowance rules.
- **Child mode:** strictly read-only - balance and history in plain, kid-friendly language, with server-side enforcement that no mutation is reachable (Section 4.3).
- **Single child, "Edd."** Per captain decision 1 (Section 4.1).

### 7.2 Deferred to later phases (schema already supports these; not built yet)

- **Savings pockets and interest** - named savings goals with gentle, kid-friendly interest accrual, unlocked automatically the first time a parent creates a savings pocket for the child.
- **Loans** - parent-initiated installment loans (e.g. advancing next week's allowance), always deliberately introduced by the parent as a teaching moment, never something the child can trigger.
- **Credit-card mechanics** - a revolving credit line where purchases only affect the amount owed (not the cash balance) as the core lesson that "swiping" creates an obligation rather than spending money immediately, plus statements and gentle interest charges on carried balances.

Each of these later phases already has its full table structure created in Phase 0 specifically so that turning a feature on is additive work, not a migration against a real family's live data.
