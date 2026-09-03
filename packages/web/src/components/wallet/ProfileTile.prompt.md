One-sentence: the login screen's whole interface — one oversized tile per profile, no username, no typing.

```jsx
<ProfileTile role="parent" hasPin onClick={() => setStep('pin')} />
<ProfileTile role="child" name="Edd" onClick={login} />
```

- Copy is first-person: "I'm the Parent", "I'm Edd".
- Child tiles carry the pink gradient avatar; parent tiles use the purple tint with the lock icon.
