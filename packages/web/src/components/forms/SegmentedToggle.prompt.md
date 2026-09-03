One-sentence: the Deposit/Withdraw switch that lives inside the single "Add or remove money" modal (UX requirement #3).

```jsx
<SegmentedToggle
  value={mode} onChange={setMode}
  options={[{value:'deposit',label:'Add money',icon:'add-money'},{value:'withdraw',label:'Take out',icon:'take-out',tone:'error'}]}
/>
```

- Two segments is the canonical use. Also fine for allowance frequency (Weekly / Monthly).
- Never split it back into two separate Deposit and Withdraw buttons.
