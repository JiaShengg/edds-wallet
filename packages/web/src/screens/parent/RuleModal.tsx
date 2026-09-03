import type {
  AllowanceFrequency,
  AllowanceRuleCreateRequest,
  AllowanceRuleResponse,
} from '@edds-wallet/shared';
import { useState } from 'react';
import { Button, Modal } from '../../components/core';
import { Field, SegmentedToggle } from '../../components/forms';
import { parseMoneyInput } from '../../lib/money';

export interface RuleModalProps {
  /** Present when editing an existing rule; omitted when creating a new one. */
  rule?: AllowanceRuleResponse | null;
  submitting: boolean;
  onClose: () => void;
  onSave: (input: AllowanceRuleCreateRequest) => void;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

/**
 * Create/edit allowance rule modal (wireframe UX requirement #4: both
 * create and edit stay in the same modal dialog).
 */
export function RuleModal({ rule, submitting, onClose, onSave }: RuleModalProps) {
  const [amount, setAmount] = useState(rule ? (rule.amountCents / 100).toFixed(2) : '');
  const [frequency, setFrequency] = useState<AllowanceFrequency>(rule?.frequency ?? 'weekly');
  const [anchorDate, setAnchorDate] = useState(rule?.anchorDate ?? todayIso());

  const cents = parseMoneyInput(amount) ?? 0;
  const invalid = !cents || cents <= 0 || !anchorDate;

  return (
    <Modal
      title={rule ? 'Edit allowance rule' : 'New allowance rule'}
      subtitle="Money is added automatically. If the app was closed on payday, it catches up next time you open it."
      onClose={onClose}
      footer={
        <>
          <Button variant="quiet" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={invalid || submitting}
            onClick={() => onSave({ amountCents: cents, frequency, anchorDate })}
          >
            {rule ? 'Save changes' : 'Create rule'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <Field
          label="How much?"
          prefix="$"
          size="lg"
          inputMode="decimal"
          placeholder="5.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <span style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--type-body-sm)' }}>
            How often?
          </span>
          <SegmentedToggle
            value={frequency}
            onChange={(v) => setFrequency(v as AllowanceFrequency)}
            options={[
              { value: 'weekly', label: 'Weekly' },
              { value: 'biweekly', label: 'Every 2 weeks' },
              { value: 'monthly', label: 'Monthly' },
            ]}
          />
        </div>
        <Field
          label="Starting from"
          type="date"
          value={anchorDate}
          onChange={(e) => setAnchorDate(e.target.value)}
        />
      </div>
    </Modal>
  );
}
