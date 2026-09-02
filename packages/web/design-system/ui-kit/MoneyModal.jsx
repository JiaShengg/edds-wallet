const { Modal, Field, SegmentedToggle, Button } = window.EddSWalletDesignSystem_5fd7ab;

function MoneyModal({ balanceCents, childName, onClose, onSave }) {
  const [mode, setMode] = React.useState('deposit');
  const [amount, setAmount] = React.useState('');
  const [memo, setMemo] = React.useState('');
  const cents = Math.round(parseFloat(amount || '0') * 100);
  const short = mode === 'withdraw' && cents > balanceCents;
  const invalid = !cents || cents <= 0 || short;

  return (
    <Modal
      title="Add or remove money"
      subtitle={"You're changing " + childName + "'s wallet. " + window.money(balanceCents) + " in there now."}
      onClose={onClose}
      footer={<>
        <Button variant="quiet" size="sm" onClick={onClose}>Cancel</Button>
        <Button size="sm" disabled={invalid} onClick={() => onSave({ kind: mode, cents, memo })}>
          {mode === 'deposit' ? 'Add money' : 'Take out'}
        </Button>
      </>}
    >
      <div style={{ display: 'grid', gap: 'var(--space-5)' }}>
        <SegmentedToggle
          value={mode} onChange={setMode}
          options={[
            { value: 'deposit', label: 'Add money', icon: 'add-money' },
            { value: 'withdraw', label: 'Take out', icon: 'take-out', tone: 'error' },
          ]}
        />
        <Field
          label="How much?" prefix="$" size="lg" inputMode="decimal" placeholder="0.00"
          value={amount} onChange={(e) => setAmount(e.target.value)}
          error={short ? 'Not enough in the wallet — ' + window.money(balanceCents) + ' available' : null}
        />
        <Field label="What for?" placeholder="Chores, birthday, a treat…" hint="Optional. Edd sees this in their history." value={memo} onChange={(e) => setMemo(e.target.value)} />
      </div>
    </Modal>
  );
}

Object.assign(window, { MoneyModal });
