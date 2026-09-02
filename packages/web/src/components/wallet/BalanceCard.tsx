import type { CSSProperties, ReactNode } from 'react';
import { Icon, type IconName } from '../core/Icon';

/**
 * The balance stat card - the anchor of both the child wallet view and the parent dashboard.
 */
export interface BalanceCardProps {
  label?: ReactNode;
  /** Pre-formatted currency string, e.g. "$42.50". Amounts are integer cents server-side. */
  amount: ReactNode;
  caption?: ReactNode;
  /** brand/play = kid-facing gradient; surface = restrained parent-dashboard version. */
  tone?: 'brand' | 'play' | 'surface';
  size?: 'lg' | 'md';
  icon?: IconName;
  style?: CSSProperties;
}

export function BalanceCard({
  label = 'My balance',
  amount,
  caption,
  tone = 'brand',
  size = 'lg',
  icon = 'my-balance',
  style,
}: BalanceCardProps) {
  const kid = tone === 'brand' || tone === 'play';
  return (
    <section
      style={{
        background:
          tone === 'brand'
            ? 'var(--gradient-brand)'
            : tone === 'play'
              ? 'var(--gradient-play)'
              : 'var(--surface-card)',
        color: kid ? 'var(--text-on-brand)' : 'var(--color-text)',
        border: kid ? 'none' : '1px solid var(--color-hairline)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--pad-card)',
        boxShadow: kid ? 'var(--shadow-raised)' : 'var(--shadow-card)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-5)',
        ...style,
      }}
    >
      <div
        style={{
          width: size === 'lg' ? 88 : 56,
          height: size === 'lg' ? 88 : 56,
          flex: '0 0 auto',
          borderRadius: 'var(--radius-lg)',
          display: 'grid',
          placeItems: 'center',
          background: kid ? 'rgba(255,255,255,0.22)' : 'var(--color-primary-tint)',
          color: kid ? 'var(--text-on-brand)' : 'var(--color-primary-dark)',
        }}
      >
        <Icon name={icon} size={size === 'lg' ? 52 : 34} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-body)',
            fontWeight: 'var(--weight-bold)',
            fontSize: 'var(--type-body)',
            opacity: kid ? 0.9 : 1,
            color: kid ? 'inherit' : 'var(--text-muted)',
          }}
        >
          {label}
        </p>
        <p
          style={{
            margin: '2px 0 0',
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--weight-bold)',
            fontSize: size === 'lg' ? 'var(--type-balance)' : 'var(--type-display-lg)',
            lineHeight: 'var(--leading-tight)',
            letterSpacing: 'var(--tracking-tight)',
          }}
        >
          {amount}
        </p>
        {caption ? (
          <p
            style={{
              margin: 'var(--space-2) 0 0',
              fontSize: 'var(--type-body-sm)',
              opacity: kid ? 0.9 : 1,
              color: kid ? 'inherit' : 'var(--text-muted)',
            }}
          >
            {caption}
          </p>
        ) : null}
      </div>
    </section>
  );
}
