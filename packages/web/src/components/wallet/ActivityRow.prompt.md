One-sentence: one entry in the transaction history — flat reverse-chronological, no date headers (UX requirement #5).

```jsx
<ActivityRow variant="kid" kind="deposit" emoji="🎉" title="You got $5!" meta="Saturday" amount="$5.00" />
<ActivityRow kind="withdraw" title="Withdraw · New Lego" meta="Sat 12 Apr · by Parent" amount="$2.00" />
```

- Kid rows are cards with an emoji tile and Fredoka copy; parent rows are dense and hairline-separated.
- Emoji appear only in child-facing history copy — never in parent UI or headings.
