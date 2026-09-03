One-sentence: one allowance rule in the parent's rules list, with Edit and an instant Pause/Resume.

```jsx
<AllowanceRuleRow amount="$5.00" frequency="every Monday" nextDate="next Monday" onEdit={openRuleModal} onTogglePause={toggle} />
```

- Edit opens the same modal as "+ New rule" (UX requirement #4). Pause never confirms.
- Paused rows drop to 0.72 opacity and swap the pink icon tile for the warning tint.
