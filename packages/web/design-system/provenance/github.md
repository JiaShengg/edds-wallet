repo: JiaShengg/edds-wallet
branch: main
path: README.md

## Last sync

date: 2026-09-02T16:11:55Z

### Updated in this project

- Built the full token set (colors, type, spacing, shape, motion) from the PRD's §6 design-system section.
- Copied the Happy Piggy app icon and all six Chunky Filled icons in verbatim as SVG assets.
- Authored 17 components across core, forms and wallet groups.
- Recreated the app as a click-through UI kit: login → parent dashboard → child wallet.

## Screen map

| Project screen | Repo files |
|---|---|
| `ui_kits/wallet-app/LoginScreen.jsx` | `README.md` §3.1, §3.2, §4.3 |
| `ui_kits/wallet-app/ParentDashboard.jsx` | `README.md` §3.1, §5 (UX requirements 1, 4, 7) |
| `ui_kits/wallet-app/ChildWallet.jsx` | `README.md` §3.2, §5 (UX requirements 1, 5, 6) |
| `ui_kits/wallet-app/MoneyModal.jsx` | `README.md` §5 (UX requirement 3) |
| `ui_kits/wallet-app/RuleModal.jsx` | `README.md` §5 (UX requirement 4) |
| `tokens/*.css`, `assets/**` | `README.md` §6.1–§6.4 |

Note: at this commit the repository contains only `README.md` (the PRD). There is no application
code, stylesheet or asset upstream — everything here derives from that document.
