# UI kit — Edd's Wallet app

A click-through recreation of the only product in the source: the local-first browser app described in the PRD (`edds-wallet/README.md`). One surface, three screens, two roles.

## Screens

| Screen | File | Source |
|---|---|---|
| Login (profile tiles → optional PIN) | `LoginScreen.jsx` | PRD §3.1 step 1–2, §3.2 step 1, §4.3 |
| Parent dashboard (balance, one money action, rules, activity) | `ParentDashboard.jsx` | PRD §3.1 step 3–6, UX requirements #1, #4, #7 |
| Child wallet view (read-only) | `ChildWallet.jsx` | PRD §3.2, UX requirements #1, #5, #6 |
| "Add or remove money" dialog | `MoneyModal.jsx` | UX requirement #3 |
| Allowance rule dialog (new + edit) | `RuleModal.jsx` | UX requirement #4 |

`data.js` holds seed state in integer cents, mirroring the real ledger's storage rule.

## What you can click

1. Tap **I'm the Parent** → PIN pad (the demo PIN is `1234`; a wrong PIN shakes out and resets).
2. **Add or remove money** → one modal, Deposit/Withdraw toggle inside. Withdrawing more than the balance shows the insufficient-balance error and disables the confirm.
3. **+ New rule** / **Edit** → same modal. **Pause** toggles instantly, no confirmation.
4. **Switch user** → back to login. Tap **I'm Edd** for the read-only child view; new entries you recorded as the parent appear there in kid language.

## Deliberately not built

Savings pockets, loans and credit-card mechanics are deferred phases in the PRD with no design defined — they are omitted rather than invented. Nothing here moves real money; there is no server, so scheduling and role enforcement are faked in client state.
