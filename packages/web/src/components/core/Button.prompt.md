One-sentence: the brand's pressable action — Fredoka label, chunky radius, solid bottom edge that collapses when pressed.

```jsx
<Button variant="primary" size="lg" icon="add-money" onClick={open}>Add or remove money</Button>
```

- One `primary` per screen. Parent dashboard's primary is always "Add or remove money".
- `ghost` is the parent-mode "Switch user" treatment; never use ghost for a mutating action.
- Press state is a 2px downward nudge with the bottom edge removed — do not swap it for a scale or an opacity fade.
