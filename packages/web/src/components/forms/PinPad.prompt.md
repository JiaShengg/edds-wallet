One-sentence: big-key PIN pad shown after tapping a profile tile that has a PIN set.

```jsx
<PinPad value={pin} onChange={setPin} onSubmit={login} error={bad ? "That's not it — try again" : null} />
```

- Only parent profiles have PINs in Phase 0; child tiles log in with one tap and never show this.
- Filled dots pop with the bounce easing. Keep keys at 72px — this is used on shared tablets.
