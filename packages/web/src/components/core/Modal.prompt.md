One-sentence: the single dialog pattern — used for "Add or remove money" and for both create and edit of an allowance rule (UX requirements #3, #4).

```jsx
<Modal title="Add or remove money" onClose={close} footer={<><Button variant="quiet" size="sm">Cancel</Button><Button size="sm">Save</Button></>}>…</Modal>
```

- Positioned `absolute` within its screen container so it works inside a framed mock; in a real app use `fixed`.
- Pause/Resume never opens a modal — it is an instant toggle (UX requirement #7).
