import type { CSSProperties, ReactElement } from 'react';

// Chunky Filled icon set - PRD §6.4. Bodies are the source SVGs verbatim
// (soft 0.15 fill + 3.5 rounded stroke, all driven by currentColor).
export type IconName =
  | 'add-money'
  | 'take-out'
  | 'allowance-day'
  | 'my-balance'
  | 'parent-lock'
  | 'unlocked';

export interface IconProps {
  /** One of the six Chunky Filled icons (PRD §6.4). */
  name: IconName;
  /** Rendered square size in px. Default 32. */
  size?: number;
  /** Overrides currentColor; pass a palette token like var(--color-primary). */
  color?: string;
  /** Accessible label. Omit for decorative icons. */
  title?: string;
  style?: CSSProperties;
}

const PATHS: Record<IconName, ReactElement> = {
  'add-money': (
    <>
      <circle cx="24" cy="26" r="16" fill="currentColor" opacity="0.15" />
      <circle cx="24" cy="26" r="16" stroke="currentColor" strokeWidth="3.5" />
      <path
        d="M24 19v14M18 24l6-6 6 6"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  'take-out': (
    <>
      <circle cx="24" cy="26" r="16" fill="currentColor" opacity="0.15" />
      <circle cx="24" cy="26" r="16" stroke="currentColor" strokeWidth="3.5" />
      <path
        d="M24 19v14M18 27l6 6 6-6"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  'allowance-day': (
    <>
      <rect
        x="9"
        y="12"
        width="30"
        height="26"
        rx="6"
        fill="currentColor"
        opacity="0.15"
        stroke="currentColor"
        strokeWidth="3.5"
      />
      <path d="M9 20h30" stroke="currentColor" strokeWidth="3.5" />
      <path d="M16 8v8M32 8v8" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="24" cy="29" r="4" fill="currentColor" />
    </>
  ),
  'my-balance': (
    <>
      <ellipse
        cx="24"
        cy="27"
        rx="16"
        ry="12"
        fill="currentColor"
        opacity="0.15"
        stroke="currentColor"
        strokeWidth="3.5"
      />
      <circle
        cx="36"
        cy="24"
        r="5"
        fill="currentColor"
        opacity="0.15"
        stroke="currentColor"
        strokeWidth="3"
      />
      <rect x="20" y="16" width="8" height="3" rx="1.5" fill="currentColor" />
      <circle cx="18" cy="27" r="2" fill="currentColor" />
    </>
  ),
  'parent-lock': (
    <>
      <rect
        x="12"
        y="22"
        width="24"
        height="18"
        rx="5"
        fill="currentColor"
        opacity="0.15"
        stroke="currentColor"
        strokeWidth="3.5"
      />
      <path
        d="M17 22v-6a7 7 0 0 1 14 0v6"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="24" cy="30" r="2.5" fill="currentColor" />
    </>
  ),
  unlocked: (
    <path
      d="M24 8 L28.5 19 L40 20 L31 27.5 L34 39 L24 32.5 L14 39 L17 27.5 L8 20 L19.5 19 Z"
      fill="currentColor"
      opacity="0.2"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinejoin="round"
    />
  ),
};

export function Icon({ name, size = 32, color, title, style }: IconProps): ReactElement | null {
  const body = PATHS[name];
  if (!body) return null;
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: title is optional; decorative icons (the common case) are aria-hidden via role="presentation" below.
    <svg
      viewBox="0 0 48 48"
      fill="none"
      width={size}
      height={size}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      style={{ color: color || 'currentColor', display: 'block', flex: '0 0 auto', ...style }}
    >
      {title ? <title>{title}</title> : null}
      {body}
    </svg>
  );
}
