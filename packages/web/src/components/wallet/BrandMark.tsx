import { type CSSProperties, useId } from 'react';

export interface BrandMarkProps {
  /** Square size of the piggy squircle in px. */
  size?: number;
  showName?: boolean;
  /** Product name beside the mark. */
  name?: string;
  /** Optional path to assets/logo.svg; when omitted the mark is drawn inline. */
  src?: string;
  style?: CSSProperties;
}

// Happy Piggy app icon - PRD §6.3, gradient squircle + white piggy silhouette (source SVG verbatim).
export function BrandMark({
  size = 40,
  showName = true,
  name = "Edd's Wallet",
  src,
  style,
}: BrandMarkProps) {
  const gid = useId();
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)', ...style }}>
      {src ? (
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          style={{ borderRadius: 'var(--radius-squircle)', display: 'block' }}
        />
      ) : (
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          aria-hidden="true"
          style={{ display: 'block', flex: '0 0 auto' }}
        >
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#FF9DC4" />
              <stop offset="1" stopColor="#FF5DA2" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="23" fill={`url(#${gid})`} />
          <g transform="translate(11 11) scale(0.78)">
            <ellipse cx="50" cy="58" rx="34" ry="26" fill="#fff" />
            <circle cx="78" cy="52" r="10" fill="#fff" />
            <circle cx="82" cy="48" r="2" fill="#4A2A55" />
            <circle cx="82" cy="56" r="2" fill="#4A2A55" />
            <path d="M60 34 L68 22 L72 36 Z" fill="#fff" />
            <path d="M18 50 q-10 -4 -8 -16 q10 2 12 12 Z" fill="#fff" />
            <circle cx="42" cy="52" r="3" fill="#4A2A55" />
            <rect x="46" y="34" width="16" height="4" rx="2" fill="#4A2A55" />
            <rect x="30" y="80" width="8" height="12" rx="3" fill="#fff" />
            <rect x="64" y="80" width="8" height="12" rx="3" fill="#fff" />
          </g>
        </svg>
      )}
      {showName ? (
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--weight-bold)',
            fontSize: Math.round(size * 0.6),
            color: 'var(--color-text)',
          }}
        >
          {name}
        </span>
      ) : null}
    </span>
  );
}
