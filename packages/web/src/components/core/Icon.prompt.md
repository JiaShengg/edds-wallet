One-sentence: the brand's only icon component — the six Chunky Filled glyphs, tinted by `currentColor`.

```jsx
<Icon name="add-money" size={40} color="var(--color-primary)" title="Add money" />
```

- Names: `add-money`, `take-out`, `allowance-day`, `my-balance`, `parent-lock`, `unlocked`.
- Never restyle stroke weight; the 3.5 chunky stroke is the brand.
- Inside a colored button, leave `color` unset so the icon inherits the button's text color.
- There is no wider icon library in this system. If a surface needs a glyph outside these six, flag it rather than substituting a thin-line icon from another set.
