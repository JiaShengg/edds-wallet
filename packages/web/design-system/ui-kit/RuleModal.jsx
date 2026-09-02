const { Modal, Field, SegmentedToggle, Button } = window.EddSWalletDesignSystem_5fd7ab;

function RuleModal({ rule, onClose, onSave }) {
  const [amount, setAmount] = React.useState(rule ? (rule.amountCents / 100).toFixed(2) : '');
  const [freq, setFreq] = React.useState(rule && rule.frequency.startsWith('monthly') ? 'monthly' : 'weekly');
  const [anchor, setAnchor] = React.useState(freq === 'monthly' ? '1st of the month' : 'Monday');
  const cents = Math.round(parseFloat(amount || '0') * 100);

  return (
    <Modal
      title={rule ? 'Edit allowance rule' : 'New allowance rule'}
      subtitle="Money is added automatically. If the app was closed on payday, it catches up next time you open it."
      onClose={onClose}
      footer={<>
        <Button variant="quiet" size="sm" onClick={onClose}>Cancel</Button>
        <Button size="sm" disabled={!cents} onClick={() => onSave({ id: rule && rule.id, amountCents: cents, frequency: freq === 'monthly' ? 'monthly on the ' + anchor.replace(' of the month', '') : 'every ' + anchor, nextDate: freq === 'monthly' ? '1 May' : 'next ' + anchor })}>
          {rule ? 'Save changes' : 'Create rule'}
        </Button>
      </>}
    >
      <div style={{ display: 'grid', gap: 'var(--space-5)' }}>
        <Field label="How much?" prefix="$" size="lg" inputMode="decimal" placeholder="5.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          <span style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--type-body-sm)' }}>How often?</span>
          <SegmentedToggle
            value={freq}
            onChange={(v) => { setFreq(v); setAnchor(v === 'monthly' ? '1st of the month' : 'Monday'); }}
            options={[{ value: 'weekly', label: 'Every week' }, { value: 'monthly', label: 'Every month' }]}
          />
        </div>
        <Field label={freq === 'monthly' ? 'Which day of the month?' : 'Which day?'} value={anchor} onChange={(e) => setAnchor(e.target.value)} hint="Edd sees this as “Next allowance: next Monday”." />
      </div>
    </Modal>
  );
}

Object.assign(window, { RuleModal });
