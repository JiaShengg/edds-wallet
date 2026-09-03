import type { CSSProperties, ReactNode } from 'react';
import { Icon } from '../core/Icon';

export interface ReadOnlyNoticeProps {
  /** Defaults to the canonical child-mode line. Keep the wording warm and non-scolding. */
  children?: ReactNode;
  style?: CSSProperties;
}

export function ReadOnlyNotice({
  children = 'Only a grown-up can add or take away money.',
  style,
}: ReadOnlyNoticeProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        background: 'var(--color-secondary-tint)',
        color: '#4B33B8',
        borderRadius: 'var(--radius-pill)',
        padding: 'var(--space-3) var(--space-5)',
        fontFamily: 'var(--font-body)',
        fontWeight: 'var(--weight-semibold)',
        fontSize: 'var(--type-body-sm)',
        ...style,
      }}
    >
      <Icon name="parent-lock" size={24} />
      <span>{children}</span>
    </div>
  );
}
