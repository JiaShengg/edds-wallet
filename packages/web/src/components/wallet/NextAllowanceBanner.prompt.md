One-sentence: mint banner telling the child when more money arrives.

```jsx
<NextAllowanceBanner when="next Monday" amount="$5.00" />
```

- Hide it completely when there's no active rule — pass nothing and it renders null. Never show "No allowance set".
- The date string comes from the server's catch-up-safe scheduler, not from client math.
