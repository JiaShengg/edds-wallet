const { BalanceCard, Card, Button, AllowanceRuleRow, ActivityRow, BrandMark, SwitchUserButton, Badge } = window.EddSWalletDesignSystem_5fd7ab;

function ParentDashboard({ state, childName, onOpenMoney, onNewRule, onEditRule, onTogglePause, onSwitchUser }) {
  const active = state.rules.find((r) => !r.paused);
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4) var(--space-8)', background: 'var(--surface-card)', borderBottom: '1px solid var(--color-hairline)' }}>
        <BrandMark size={40} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <Badge tone="brand" icon="parent-lock">Parent mode</Badge>
          <SwitchUserButton mode="parent" onClick={onSwitchUser} />
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: '0 auto', padding: 'var(--pad-screen)', display: 'grid', gap: 'var(--gap-card)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'var(--gap-card)', alignItems: 'stretch' }}>
          <BalanceCard tone="surface" size="md" label={childName + "'s balance"} amount={window.money(state.balanceCents)} caption={state.ledger.length + ' entries · last change ' + state.ledger[0].when} />
          <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'var(--space-3)' }}>
            <Button icon="add-money" fullWidth onClick={onOpenMoney}>Add or remove money</Button>
            <p style={{ margin: 0, fontSize: 'var(--type-body-sm)', color: 'var(--text-muted)', textAlign: 'center' }}>Record a real-world payment or take money out.</p>
          </Card>
        </div>

        <Card title="Allowance Rules" action={<Button variant="quiet" size="sm" onClick={onNewRule}>+ New rule</Button>}>
          <div style={{ display: 'grid', gap: 'var(--gap-row)' }}>
            {state.rules.map((r) => (
              <AllowanceRuleRow
                key={r.id} amount={window.money(r.amountCents)} frequency={r.frequency} nextDate={r.nextDate} paused={r.paused}
                onEdit={() => onEditRule(r)} onTogglePause={() => onTogglePause(r.id)}
              />
            ))}
            {state.rules.length === 0 ? <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--type-body-sm)' }}>No rules yet. Add one and allowance pays itself.</p> : null}
          </div>
          {active ? (
            <p style={{ margin: 'var(--space-4) 0 0', fontSize: 'var(--type-body-sm)', color: 'var(--text-muted)' }}>
              {childName} sees “Next allowance: {active.nextDate} — {window.money(active.amountCents)}”.
            </p>
          ) : null}
        </Card>

        <Card title="Recent Activity">
          <div>
            {state.ledger.map((t) => (
              <ActivityRow
                key={t.id} kind={t.kind}
                title={(t.kind === 'withdraw' ? 'Withdraw' : t.kind === 'allowance' ? 'Allowance' : 'Deposit') + (t.memo ? ' · ' + t.memo : '')}
                meta={t.when + (t.kind === 'allowance' ? ' · automatic' : ' · recorded by you')}
                amount={window.money(t.amountCents)}
              />
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}

Object.assign(window, { ParentDashboard });
