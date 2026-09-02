One-sentence: square icon-only control for compact actions and the deliberately quiet child-mode exit.

```jsx
<IconButton icon="parent-lock" label="Switch user" size="sm" muted />
```

- `muted` exists for one job: child-mode "Switch user" must be low visual weight (UX requirement #1).
- `label` is required; never ship an unlabelled icon button.
