import {
  type ChangeEvent,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
  useId,
  useState,
} from 'react';

export interface FieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'style' | 'prefix'> {
  label?: ReactNode;
  /** Helper line under the input. Replaced by `error` when set. */
  hint?: ReactNode;
  /** Validation message, e.g. "Not enough in the wallet". Turns the border red. */
  error?: ReactNode;
  id?: string;
  type?: string;
  value?: string | number;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  /** Static leading glyph, e.g. "$" on amount fields. */
  prefix?: ReactNode;
  /** lg renders the value in Fredoka at display size - used for amounts. */
  size?: 'md' | 'lg';
  style?: CSSProperties;
}

export function Field({
  label,
  hint,
  error,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  prefix,
  size = 'md',
  style,
  ...rest
}: FieldProps) {
  const [focus, setFocus] = useState(false);
  const generatedId = useId();
  const inputId = id || generatedId;
  const pad = size === 'lg' ? '0 var(--space-5)' : '0 var(--space-4)';
  const h = size === 'lg' ? 64 : 52;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', ...style }}>
      {label ? (
        <label
          htmlFor={inputId}
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 'var(--weight-bold)',
            fontSize: 'var(--type-body-sm)',
            color: 'var(--color-text)',
          }}
        >
          {label}
        </label>
      ) : null}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          height: h,
          padding: pad,
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-md)',
          border: `2px solid ${error ? 'var(--color-error)' : focus ? 'var(--color-secondary)' : 'var(--color-hairline)'}`,
          boxShadow: focus ? 'var(--ring-focus)' : 'none',
          transition:
            'border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)',
        }}
      >
        {prefix ? (
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: size === 'lg' ? 'var(--type-display-sm)' : 'var(--type-body-lg)',
              color: 'var(--text-muted)',
            }}
          >
            {prefix}
          </span>
        ) : null}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            flex: 1,
            minWidth: 0,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: size === 'lg' ? 'var(--font-display)' : 'var(--font-body)',
            fontWeight: size === 'lg' ? 'var(--weight-semibold)' : 'var(--weight-medium)',
            fontSize: size === 'lg' ? 'var(--type-display-sm)' : 'var(--type-body)',
            color: 'var(--color-text)',
          }}
          {...rest}
        />
      </div>
      {error ? (
        <p
          style={{
            margin: 0,
            fontSize: 'var(--type-body-sm)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-error)',
          }}
        >
          {error}
        </p>
      ) : hint ? (
        <p style={{ margin: 0, fontSize: 'var(--type-body-sm)', color: 'var(--text-muted)' }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
