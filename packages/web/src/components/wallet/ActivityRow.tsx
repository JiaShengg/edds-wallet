import type { CSSProperties, ReactNode } from 'react';
import { Icon } from '../core/Icon';

export interface ActivityRowProps {
  kind?: 'deposit' | 'withdraw' | 'allowance';
  /** Kid copy: "You got $5!" - parent copy: "Deposit · Chores". */
  title: ReactNode;
  /** Secondary line: date, memo, or who recorded it. */
  meta?: ReactNode;
  /** Pre-formatted amount without a sign; the sign is derived from `kind`. */
  amount?: ReactNode;
  /** Kid-mode leading emoji (🎉 📅 🛍️), used instead of the icon. */
  emoji?: string;
  /** kid = chunky standalone cards; parent = dense hairline-separated ledger rows. */
  variant?: 'kid' | 'parent';
  style?: CSSProperties;
}

export function ActivityRow({
  kind = 'deposit',
  title,
  meta,
  amount,
  emoji,
  variant = 'parent',
  style,
}: ActivityRowProps) {
  const positive = kind !== 'withdraw';
  const kid = variant === 'kid';
  const tint =
    kind === 'withdraw'
      ? 'var(--color-error-tint)'
      : kind === 'allowance'
        ? 'var(--color-accent-tint)'
        : 'var(--color-success-tint)';
  const ink = kind === 'withdraw' ? '#B23434' : kind === 'allowance' ? '#1E9E8B' : '#1B8A5F';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        padding: kid ? 'var(--space-4)' : 'var(--space-3) var(--space-4)',
        background: kid ? 'var(--surface-card)' : 'transparent',
        borderRadius: kid ? 'var(--radius-md)' : 0,
        borderBottom: kid ? 'none' : '1px solid var(--color-hairline)',
        boxShadow: kid ? 'var(--shadow-card)' : 'none',
        ...style,
      }}
    >
      <span
        style={{
          width: kid ? 52 : 40,
          height: kid ? 52 : 40,
          flex: '0 0 auto',
          borderRadius: 'var(--radius-sm)',
          display: 'grid',
          placeItems: 'center',
          background: tint,
          color: ink,
          fontSize: kid ? 26 : 20,
        }}
      >
        {kid && emoji ? (
          emoji
        ) : (
          <Icon
            name={
              kind === 'withdraw'
                ? 'take-out'
                : kind === 'allowance'
                  ? 'allowance-day'
                  : 'add-money'
            }
            size={kid ? 32 : 26}
          />
        )}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontFamily: kid ? 'var(--font-display)' : 'var(--font-body)',
            fontWeight: kid ? 'var(--weight-semibold)' : 'var(--weight-bold)',
            fontSize: kid ? 'var(--type-body-lg)' : 'var(--type-body)',
            color: 'var(--color-text)',
          }}
        >
          {title}
        </p>
        {meta ? (
          <p
            style={{
              margin: '2px 0 0',
              fontSize: 'var(--type-body-sm)',
              color: 'var(--text-muted)',
            }}
          >
            {meta}
          </p>
        ) : null}
      </div>
      {amount ? (
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--weight-bold)',
            fontSize: kid ? 'var(--type-display-sm)' : 'var(--type-body-lg)',
            color: positive ? '#1B8A5F' : 'var(--color-error)',
            whiteSpace: 'nowrap',
          }}
        >
          {positive ? '+' : '−'}
          {amount}
        </span>
      ) : null}
    </div>
  );
}
