import { useState } from 'react';
import { Button, Modal } from '../../components/core';
import { Field, SegmentedToggle } from '../../components/forms';
import { formatMoney, parseMoneyInput } from '../../lib/money';

export interface MoneyModalProps {
  childName: string;
  balanceCents: number;
  submitting: boolean;
  onClose: () => void;
  onSave: (input: { mode: 'deposit' | 'withdraw'; amountCents: number; memo?: string }) => void;
}

/**
 * The single "Add or remove money" control (wireframe UX requirement #3):
 * one modal, a Deposit/Withdraw segmented toggle inside, shared amount +
 * memo fields and insufficient-balance validation.
 */
export function MoneyModal({
  childName,
  balanceCents,
  submitting,
  onClose,
  onSave,
}: MoneyModalProps) {
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');

  const cents = parseMoneyInput(amount) ?? 0;
  const short = mode === 'withdraw' && cents > balanceCents;
  const invalid = !cents || cents <= 0 || short;

  return (
    <Modal
      title="Add or remove money"
      subtitle={`You're changing ${childName}'s wallet. ${formatMoney(balanceCents)} in there now.`}
      onClose={onClose}
      footer={
        <>
          <Button variant="quiet" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={invalid || submitting}
            onClick={() => onSave({ mode, amountCents: cents, memo: memo.trim() || undefined })}
          >
            {mode === 'deposit' ? 'Add money' : 'Take out'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <SegmentedToggle
          value={mode}
          onChange={(v) => setMode(v as 'deposit' | 'withdraw')}
          options={[
            { value: 'deposit', label: 'Add money', icon: 'add-money' },
            { value: 'withdraw', label: 'Take out', icon: 'take-out', tone: 'error' },
          ]}
        />
        <Field
          label="How much?"
          prefix="$"
          size="lg"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={short ? `Not enough in the wallet — ${formatMoney(balanceCents)} available` : null}
        />
        <Field
          label="What for?"
          placeholder="Chores, birthday, a treat…"
          hint={`Optional. ${childName} sees this in their history.`}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </div>
    </Modal>
  );
}
