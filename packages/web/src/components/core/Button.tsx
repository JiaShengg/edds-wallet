import { type CSSProperties, type MouseEvent, type ReactNode, useState } from 'react';
import { Icon, type IconName } from './Icon';

/**
 * The system's pressable action. Primary pink is the one call to action per screen.
 */
export interface ButtonProps {
  /** primary = the screen's one main action; secondary = purple alternate; quiet = white with hairline; ghost = text-only (used for "Switch user" in parent mode). */
  variant?: 'primary' | 'secondary' | 'quiet' | 'ghost';
  /** sm for dense parent views, md default, lg for kid-facing taps. */
  size?: 'sm' | 'md' | 'lg';
  /** Optional leading Chunky Filled icon. */
  icon?: IconName;
  fullWidth?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  style?: CSSProperties;
}

const VARIANTS: Record<
  NonNullable<ButtonProps['variant']>,
  { background: string; color: string; edge: string; border: string }
> = {
  primary: {
    background: 'var(--action-primary)',
    color: 'var(--text-on-brand)',
    edge: 'var(--edge-primary)',
    border: 'none',
  },
  secondary: {
    background: 'var(--action-secondary)',
    color: 'var(--text-on-brand)',
    edge: 'var(--edge-secondary)',
    border: 'none',
  },
  quiet: {
    background: 'var(--surface-card)',
    color: 'var(--color-text)',
    edge: 'var(--edge-neutral)',
    border: '2px solid var(--color-hairline)',
  },
  ghost: { background: 'transparent', color: 'var(--text-brand)', edge: 'none', border: 'none' },
};

const SIZES: Record<
  NonNullable<ButtonProps['size']>,
  { minHeight: string; padding: string; fontSize: string; radius: string; icon: number }
> = {
  sm: {
    minHeight: 'var(--tap-min-parent)',
    padding: '0 var(--space-4)',
    fontSize: 'var(--type-body-sm)',
    radius: 'var(--radius-md)',
    icon: 20,
  },
  md: {
    minHeight: 'var(--tap-min)',
    padding: '0 var(--space-6)',
    fontSize: 'var(--type-body)',
    radius: 'var(--radius-lg)',
    icon: 24,
  },
  lg: {
    minHeight: '72px',
    padding: '0 var(--space-8)',
    fontSize: 'var(--type-body-lg)',
    radius: 'var(--radius-xl)',
    icon: 32,
  },
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth,
  disabled,
  children,
  onClick,
  type = 'button',
  style,
  ...rest
}: ButtonProps) {
  const [pressed, setPressed] = useState(false);
  const [hover, setHover] = useState(false);
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2)',
        width: fullWidth ? '100%' : undefined,
        minHeight: s.minHeight,
        padding: s.padding,
        borderRadius: s.radius,
        fontFamily: 'var(--font-display)',
        fontWeight: 'var(--weight-semibold)',
        fontSize: s.fontSize,
        background: v.background,
        color: v.color,
        border: v.border,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: pressed || variant === 'ghost' ? 'none' : v.edge,
        transform: pressed ? 'translateY(var(--press-translate))' : 'none',
        filter: hover && !disabled && variant !== 'ghost' ? 'brightness(1.04)' : 'none',
        textDecoration: variant === 'ghost' && hover ? 'underline' : 'none',
        opacity: disabled ? 0.45 : 1,
        transition:
          'transform var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out), filter var(--duration-fast) var(--ease-out)',
        ...style,
      }}
      {...rest}
    >
      {icon ? <Icon name={icon} size={s.icon} /> : null}
      {children}
    </button>
  );
}
