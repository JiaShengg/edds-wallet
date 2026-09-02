One-sentence: always-available return to the login screen, weighted differently per mode.

```jsx
<SwitchUserButton mode="parent" onClick={logout} />
<SwitchUserButton mode="child" onClick={logout} />
```

- Reachable from both modes at all times; never behind a confirmation (PRD §3.3).
- Child mode must stay visually quiet — do not "improve" it into a labelled button.
