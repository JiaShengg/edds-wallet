const { BalanceCard, NextAllowanceBanner, ReadOnlyNotice, ActivityRow, SwitchUserButton, BrandMark } = window.EddSWalletDesignSystem_5fd7ab;

function ChildWallet({ state, childName, onSwitchUser }) {
  const active = state.rules.find((r) => !r.paused);
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4) var(--space-8)' }}>
        <BrandMark size={44} name={childName + "'s Wallet"} />
        <SwitchUserButton mode="child" onClick={onSwitchUser} />
      </header>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '0 var(--pad-screen) var(--space-12)', display: 'grid', gap: 'var(--space-5)' }}>
        <BalanceCard label="My balance" amount={window.money(state.balanceCents)} />
        {active ? <NextAllowanceBanner when={active.nextDate} amount={window.money(active.amountCents)} /> : null}
        <ReadOnlyNotice />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--type-display-md)', fontWeight: 'var(--weight-bold)', color: 'var(--color-text)', margin: 'var(--space-3) 0 0' }}>What happened</h2>
        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          {state.ledger.map((t) => (
            <ActivityRow key={t.id} variant="kid" kind={t.kind} emoji={t.emoji} title={t.kidTitle} meta={t.when} amount={window.money(t.amountCents)} />
          ))}
        </div>
      </main>
    </div>
  );
}

Object.assign(window, { ChildWallet });
