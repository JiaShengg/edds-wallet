import type { CSSProperties, ReactNode } from 'react';

/**
 * Optional per-profile PIN entry - a "seatbelt", not a security control (PRD §4.1).
 */
export interface PinPadProps {
  /** Digits in the PIN. Default 4. */
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  /** Fired when the last digit is entered. */
  onSubmit?: (value: string) => void;
  error?: ReactNode;
  label?: ReactNode;
  style?: CSSProperties;
}

export function PinPad({
  length = 4,
  value = '',
  onChange,
  onSubmit,
  error,
  label = 'Enter your PIN',
  style,
}: PinPadProps) {
  const press = (d: string) => {
    if (value.length >= length) return;
    const next = value + d;
    onChange?.(next);
    if (next.length === length && onSubmit) onSubmit(next);
  };
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-6)',
        ...style,
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--type-display-sm)',
          fontWeight: 'var(--weight-semibold)',
          color: 'var(--color-text)',
        }}
      >
        {label}
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        {Array.from({ length }).map((_, i) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length dot row, no reordering
            key={i}
            style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background:
                i < value.length
                  ? error
                    ? 'var(--color-error)'
                    : 'var(--color-primary)'
                  : 'var(--color-hairline)',
              transform: i < value.length ? 'scale(1.15)' : 'scale(1)',
              transition:
                'transform var(--duration-base) var(--ease-bounce), background var(--duration-fast) var(--ease-out)',
              display: 'inline-block',
            }}
          />
        ))}
      </div>
      {error ? (
        <p
          style={{
            margin: 0,
            color: 'var(--color-error)',
            fontWeight: 'var(--weight-bold)',
            fontSize: 'var(--type-body-sm)',
          }}
        >
          {error}
        </p>
      ) : null}
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 72px)', gap: 'var(--space-3)' }}
      >
        {keys.map((k, i) =>
          k === '' ? (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed 3x4 keypad layout, no reordering
            <span key={i} />
          ) : (
            <button
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed 3x4 keypad layout, no reordering
              key={i}
              type="button"
              onClick={() => (k === 'del' ? onChange?.(value.slice(0, -1)) : press(k))}
              style={{
                height: 72,
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                cursor: 'pointer',
                background: k === 'del' ? 'transparent' : 'var(--surface-card)',
                boxShadow: k === 'del' ? 'none' : 'var(--edge-neutral)',
                fontFamily: 'var(--font-display)',
                fontWeight: 'var(--weight-semibold)',
                fontSize: k === 'del' ? 'var(--type-body)' : 'var(--type-display-md)',
                color: k === 'del' ? 'var(--text-muted)' : 'var(--color-text)',
              }}
            >
              {k === 'del' ? 'Delete' : k}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
