import type { CSSProperties, ReactNode } from 'react';
import { Badge } from '../core/Badge';
import { Button } from '../core/Button';
import { Icon } from '../core/Icon';

export interface AllowanceRuleRowProps {
  /** Pre-formatted amount, e.g. "$5.00". */
  amount: ReactNode;
  /** Human frequency, e.g. "every Monday" or "monthly on the 1st". */
  frequency: ReactNode;
  /** Next payout date in plain language, e.g. "next Monday". */
  nextDate?: ReactNode;
  paused?: boolean;
  onEdit?: () => void;
  /** Instant one-tap toggle - no confirmation dialog (UX requirement #7). */
  onTogglePause?: () => void;
  style?: CSSProperties;
}

export function AllowanceRuleRow({
  amount,
  frequency,
  nextDate,
  paused,
  onEdit,
  onTogglePause,
  style,
}: AllowanceRuleRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        padding: 'var(--space-4)',
        background: 'var(--surface-card)',
        border: '1px solid var(--color-hairline)',
        borderRadius: 'var(--radius-md)',
        opacity: paused ? 0.72 : 1,
        ...style,
      }}
    >
      <span
        style={{
          width: 48,
          height: 48,
          flex: '0 0 auto',
          borderRadius: 'var(--radius-sm)',
          display: 'grid',
          placeItems: 'center',
          background: paused ? 'var(--color-warning-tint)' : 'var(--color-primary-tint)',
          color: paused ? '#8A6100' : 'var(--color-primary-dark)',
        }}
      >
        <Icon name="allowance-day" size={30} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--weight-semibold)',
            fontSize: 'var(--type-body-lg)',
            color: 'var(--color-text)',
          }}
        >
          {amount} {frequency}
          <Badge tone={paused ? 'warning' : 'success'}>{paused ? 'Paused' : 'Active'}</Badge>
        </p>
        {nextDate ? (
          <p
            style={{
              margin: '2px 0 0',
              fontSize: 'var(--type-body-sm)',
              color: 'var(--text-muted)',
            }}
          >
            {paused ? 'Resumes when you turn it back on' : `Next: ${nextDate}`}
          </p>
        ) : null}
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <Button variant="quiet" size="sm" onClick={onEdit}>
          Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={onTogglePause}>
          {paused ? 'Resume' : 'Pause'}
        </Button>
      </div>
    </div>
  );
}
