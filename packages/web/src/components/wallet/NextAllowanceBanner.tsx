import type { CSSProperties, ReactNode } from 'react';
import { Icon } from '../core/Icon';

/**
 * "Next allowance: <when> — <amount>" banner on the child's view (UX requirement #6).
 * Renders nothing when either value is missing, matching the rule that it is hidden
 * entirely when no active allowance rule exists.
 */
export interface NextAllowanceBannerProps {
  /** Plain-language date, computed server-side, e.g. "next Monday". */
  when?: ReactNode;
  /** Pre-formatted amount, e.g. "$5.00". */
  amount?: ReactNode;
  style?: CSSProperties;
}

export function NextAllowanceBanner({ when, amount, style }: NextAllowanceBannerProps) {
  if (!when || !amount) return null;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        background: 'var(--color-accent-tint)',
        color: '#136B5E',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4) var(--space-5)',
        ...style,
      }}
    >
      <Icon name="allowance-day" size={36} />
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--font-display)',
          fontWeight: 'var(--weight-semibold)',
          fontSize: 'var(--type-body-lg)',
        }}
      >
        Next allowance: {when} — {amount}
      </p>
    </div>
  );
}
