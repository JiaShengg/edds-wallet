import { type CSSProperties, useState } from 'react';
import { Icon, type IconName } from './Icon';

export interface IconButtonProps {
  icon: IconName;
  /** Required accessible label - icon-only controls carry no visible text. */
  label: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'neutral' | 'brand' | 'accent';
  /** Borderless, low-contrast treatment. Used for the child-mode "Switch user" control. */
  muted?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  style?: CSSProperties;
}

export function IconButton({
  icon,
  label,
  size = 'md',
  tone = 'neutral',
  muted,
  onClick,
  disabled,
  style,
}: IconButtonProps) {
  const [pressed, setPressed] = useState(false);
  const box = size === 'sm' ? 36 : size === 'lg' ? 64 : 48;
  const tones: Record<
    NonNullable<IconButtonProps['tone']>,
    { color: string; background: string }
  > = {
    neutral: { color: 'var(--color-text)', background: 'var(--surface-card)' },
    brand: { color: 'var(--color-primary-dark)', background: 'var(--color-primary-tint)' },
    accent: { color: '#1E9E8B', background: 'var(--color-accent-tint)' },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        width: box,
        height: box,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-md)',
        border: muted ? 'none' : '2px solid var(--color-hairline)',
        background: muted ? 'transparent' : t.background,
        color: muted ? 'var(--color-muted)' : t.color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transform: pressed ? 'translateY(var(--press-translate))' : 'none',
        transition: 'transform var(--duration-fast) var(--ease-out)',
        ...style,
      }}
    >
      <Icon name={icon} size={Math.round(box * 0.6)} />
    </button>
  );
}
