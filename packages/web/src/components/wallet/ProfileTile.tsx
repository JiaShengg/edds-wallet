import { type CSSProperties, type ReactNode, useState } from 'react';
import { Icon } from '../core/Icon';

/**
 * Big tappable login tile, one per household profile (PRD §3.1).
 */
export interface ProfileTileProps {
  /** Display name read from the account record - never hardcode "Edd" (UX requirement #8). */
  name?: string;
  role?: 'parent' | 'child';
  /** Overrides the default "I'm the Parent" / "I'm {name}" label. */
  label?: ReactNode;
  /** Shows "Needs a PIN" instead of "Just tap". */
  hasPin?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

export function ProfileTile({
  name,
  role = 'child',
  label,
  hasPin,
  onClick,
  style,
}: ProfileTileProps) {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);
  const parent = role === 'parent';
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-4)',
        padding: 'var(--space-8) var(--space-6)',
        minWidth: 220,
        cursor: 'pointer',
        background: 'var(--surface-card)',
        border: `2px solid ${hover ? 'var(--color-primary)' : 'var(--color-hairline)'}`,
        borderRadius: 'var(--radius-xl)',
        boxShadow: pressed ? 'none' : hover ? 'var(--shadow-raised)' : 'var(--shadow-card)',
        transform: pressed
          ? 'translateY(var(--press-translate))'
          : hover
            ? 'translateY(-2px)'
            : 'none',
        transition:
          'transform var(--duration-base) var(--ease-bounce), box-shadow var(--duration-base) var(--ease-out), border-color var(--duration-fast) var(--ease-out)',
        ...style,
      }}
    >
      <span
        style={{
          width: 96,
          height: 96,
          borderRadius: 'var(--radius-lg)',
          display: 'grid',
          placeItems: 'center',
          background: parent ? 'var(--color-secondary-tint)' : 'var(--gradient-brand)',
          color: parent ? 'var(--color-secondary)' : 'var(--text-on-brand)',
        }}
      >
        <Icon name={parent ? 'parent-lock' : 'my-balance'} size={58} />
      </span>
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 'var(--weight-bold)',
          fontSize: 'var(--type-display-md)',
          color: 'var(--color-text)',
        }}
      >
        {label || (parent ? "I'm the Parent" : `I'm ${name}`)}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 'var(--weight-semibold)',
          fontSize: 'var(--type-body-sm)',
          color: 'var(--text-muted)',
        }}
      >
        {hasPin ? 'Needs a PIN' : 'Just tap'}
      </span>
    </button>
  );
}
