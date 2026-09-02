import type { CSSProperties, ReactNode } from 'react';

/**
 * Elevated container for every grouped block on both parent and child surfaces.
 */
export interface CardProps {
  /** surface = white default; sunken = pink wash for nested rows; brand/play = gradient hero cards (kid surfaces only). */
  tone?: 'surface' | 'sunken' | 'brand' | 'play';
  padding?: string;
  radius?: string;
  raised?: boolean;
  /** Optional Fredoka section heading. */
  title?: ReactNode;
  /** Right-aligned control in the header, e.g. a "+ New rule" Button. */
  action?: ReactNode;
  children?: ReactNode;
  style?: CSSProperties;
}

const TONES: Record<
  NonNullable<CardProps['tone']>,
  { background: string; border: string; color: string }
> = {
  surface: {
    background: 'var(--surface-card)',
    border: '1px solid var(--color-hairline)',
    color: 'var(--color-text)',
  },
  sunken: { background: 'var(--surface-sunken)', border: 'none', color: 'var(--color-text)' },
  brand: { background: 'var(--gradient-brand)', border: 'none', color: 'var(--text-on-brand)' },
  play: { background: 'var(--gradient-play)', border: 'none', color: 'var(--text-on-brand)' },
};

export function Card({
  tone = 'surface',
  padding = 'var(--pad-card)',
  radius = 'var(--radius-lg)',
  raised,
  title,
  action,
  children,
  style,
}: CardProps) {
  const t = TONES[tone] || TONES.surface;
  return (
    <section
      style={{
        background: t.background,
        border: t.border,
        color: t.color,
        borderRadius: radius,
        padding,
        boxShadow: raised
          ? 'var(--shadow-raised)'
          : tone === 'sunken'
            ? 'none'
            : 'var(--shadow-card)',
        ...style,
      }}
    >
      {(title || action) && (
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
          }}
        >
          {title ? (
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--type-display-sm)',
                fontWeight: 'var(--weight-semibold)',
              }}
            >
              {title}
            </h3>
          ) : (
            <span />
          )}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
