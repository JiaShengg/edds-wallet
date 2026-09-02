import type { CSSProperties } from 'react';
import { Button } from '../core/Button';
import { IconButton } from '../core/IconButton';

export interface SwitchUserButtonProps {
  /** parent = normal-weight labelled button; child = small muted icon-only (UX requirement #1). */
  mode?: 'parent' | 'child';
  onClick?: () => void;
  style?: CSSProperties;
}

export function SwitchUserButton({ mode = 'parent', onClick, style }: SwitchUserButtonProps) {
  if (mode === 'child') {
    return (
      <IconButton
        icon="parent-lock"
        label="Switch user"
        size="sm"
        muted
        onClick={onClick}
        style={style}
      />
    );
  }
  return (
    <Button variant="ghost" size="sm" icon="parent-lock" onClick={onClick} style={style}>
      Switch user
    </Button>
  );
}
