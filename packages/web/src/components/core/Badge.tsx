import type { CSSProperties, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

export interface BadgeProps {
  /** Semantic tone. `success` = active rule, `warning` = paused rule (PRD §6.1). */
  tone?: 'success' | 'warning' | 'error' | 'info' | 'brand' | 'accent' | 'neutral';
  icon?: IconName;
  children?: ReactNode;
  style?: CSSProperties;
}

const TONES: Record<NonNullable<BadgeProps['tone']>, { background: string; color: string }> = {
  success: { background: 'var(--color-success-tint)', color: '#1B8A5F' },
  warning: { background: 'var(--color-warning-tint)', color: '#8A6100' },
  error: { background: 'var(--color-error-tint)', color: '#B23434' },
  info: { background: 'var(--color-info-tint)', color: '#2C6DB5' },
  brand: { background: 'var(--color-primary-tint)', color: 'var(--color-primary-dark)' },
  accent: { background: 'var(--color-accent-tint)', color: '#1E9E8B' },
  neutral: { background: 'var(--surface-sunken)', color: 'var(--color-muted)' },
};

export function Badge({ tone = 'neutral', icon, children, style }: BadgeProps) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        background: t.background,
        color: t.color,
        borderRadius: 'var(--radius-pill)',
        padding: '4px 12px',
        fontFamily: 'var(--font-body)',
        fontWeight: 'var(--weight-bold)',
        fontSize: 'var(--type-caption)',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {icon ? <Icon name={icon} size={14} /> : null}
      {children}
    </span>
  );
}
