One-sentence: the system's only text input — used for amount and memo inside the money and rule modals.

```jsx
<Field label="How much?" prefix="$" size="lg" value={amt} onChange={e => setAmt(e.target.value)} />
<Field label="What for?" placeholder="Chores, birthday…" hint="Optional" />
```

- Insufficient-balance validation lives in `error` on the amount field (UX requirement #3).
- Focus is a purple 2px border plus a soft purple ring; do not use a browser outline.
