import { Badge, Icon, type IconName } from './components/core';
import { BrandMark } from './components/wallet';

const iconNames: { label: string; name: IconName }[] = [
  { label: 'Add money', name: 'add-money' },
  { label: 'Take out', name: 'take-out' },
  { label: 'Allowance day', name: 'allowance-day' },
  { label: 'My balance', name: 'my-balance' },
  { label: 'Parent lock', name: 'parent-lock' },
  { label: 'Unlocked!', name: 'unlocked' },
];

/**
 * Design-system sanity check - NOT a product screen.
 *
 * Proves the design system this package ships compiles and renders:
 * tokens (src/styles/tokens/), the brand mark (src/components/wallet/BrandMark),
 * and the six "Chunky Filled" icons via the typed Icon component
 * (src/components/core/Icon). See packages/web/design-system/README.md
 * for the full map of what's available.
 *
 * Frontend feature work should replace this file's contents with the real
 * app shell/router - just keep importing `styles/tokens/index.css` from
 * src/main.tsx, and keep building on top of src/components/.
 */
export default function App() {
  return (
    <main style={{ padding: '2rem', maxWidth: 640, margin: '0 auto' }}>
      <BrandMark size={72} />
      <p>Design system - tokens, assets, and components are wired up.</p>

      <h2>Palette tokens</h2>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {(
          [
            ['--color-primary', 'Primary'],
            ['--color-secondary', 'Secondary'],
            ['--color-accent', 'Accent'],
            ['--color-success', 'Success'],
            ['--color-warning', 'Warning'],
            ['--color-error', 'Error'],
            ['--color-info', 'Info'],
          ] as const
        ).map(([token, label]) => (
          <div key={token} style={{ textAlign: 'center', fontSize: '0.75rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: `var(${token})`,
                border: '1px solid var(--color-muted)',
              }}
            />
            {label}
          </div>
        ))}
      </div>

      <h2>Chunky Filled icons</h2>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {iconNames.map(({ label, name }) => (
          <div key={name} style={{ textAlign: 'center', fontSize: '0.75rem' }}>
            <Icon name={name} size={40} color="var(--color-primary)" />
            <div>{label}</div>
          </div>
        ))}
      </div>

      <h2>Component sample</h2>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Badge tone="success">Active</Badge>
        <Badge tone="warning">Paused</Badge>
        <Badge tone="brand" icon="my-balance">
          Balance
        </Badge>
      </div>
    </main>
  );
}
