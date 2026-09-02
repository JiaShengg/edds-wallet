import type { CSSProperties, MouseEvent, ReactNode } from 'react';

export interface ModalProps {
  open?: boolean;
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Called on backdrop click. Modals are parent-mode only. */
  onClose?: () => void;
  /** Right-aligned action row, typically a quiet Cancel plus a primary confirm. */
  footer?: ReactNode;
  width?: number;
  children?: ReactNode;
  style?: CSSProperties;
}

export function Modal({
  open = true,
  title,
  subtitle,
  onClose,
  footer,
  width = 480,
  children,
  style,
}: ModalProps) {
  if (!open) return null;
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click-to-dismiss; the dialog content below is the focusable, keyboard-operable surface.
    <div
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === 'string' ? title : undefined}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6)',
        background: 'rgba(74,42,85,0.36)',
        backdropFilter: 'blur(3px)',
        zIndex: 50,
      }}
      onClick={(e: MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: width,
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-modal)',
          padding: 'var(--space-6)',
          animation: 'none',
          ...style,
        }}
      >
        {(title || subtitle) && (
          <header style={{ marginBottom: 'var(--space-5)' }}>
            {title ? (
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--type-display-md)',
                  fontWeight: 'var(--weight-bold)',
                  color: 'var(--color-text)',
                }}
              >
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p
                style={{
                  margin: 'var(--space-1) 0 0',
                  fontSize: 'var(--type-body-sm)',
                  color: 'var(--text-muted)',
                }}
              >
                {subtitle}
              </p>
            ) : null}
          </header>
        )}
        {children}
        {footer ? (
          <footer
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
              justifyContent: 'flex-end',
              marginTop: 'var(--space-6)',
            }}
          >
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
