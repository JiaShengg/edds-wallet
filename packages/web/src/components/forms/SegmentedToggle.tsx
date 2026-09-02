import type { CSSProperties, ReactNode } from 'react';
import { Icon, type IconName } from '../core/Icon';

export interface SegmentedOption {
  value: string;
  label: ReactNode;
  icon?: IconName;
  /** Colors the active segment. Withdraw uses `error`, deposit uses default brand. */
  tone?: 'brand' | 'success' | 'error';
}

/**
 * Two-or-three-way mode switch inside a form.
 */
export interface SegmentedToggleProps {
  options: SegmentedOption[];
  value?: string;
  onChange?: (value: string) => void;
  size?: 'md' | 'lg';
  style?: CSSProperties;
}

export function SegmentedToggle({
  options = [],
  value,
  onChange,
  size = 'md',
  style,
}: SegmentedToggleProps) {
  const h = size === 'lg' ? 64 : 52;
  return (
    <div
      role="tablist"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.max(options.length, 1)}, 1fr)`,
        gap: 'var(--space-1)',
        background: 'var(--surface-sunken)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-1)',
        ...style,
      }}
    >
      {options.map((o) => {
        const active = o.value === value;
        const tint =
          o.tone === 'error'
            ? 'var(--color-error)'
            : o.tone === 'success'
              ? 'var(--color-success)'
              : 'var(--color-primary)';
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange?.(o.value)}
            style={{
              height: h - 8,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              background: active ? 'var(--surface-card)' : 'transparent',
              boxShadow: active ? 'var(--shadow-card)' : 'none',
              color: active ? tint : 'var(--text-muted)',
              fontFamily: 'var(--font-display)',
              fontWeight: 'var(--weight-semibold)',
              fontSize: size === 'lg' ? 'var(--type-body-lg)' : 'var(--type-body)',
              transition:
                'background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)',
            }}
          >
            {o.icon ? <Icon name={o.icon} size={size === 'lg' ? 26 : 22} /> : null}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
