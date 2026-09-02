import appIcon from './assets/icons/app-icon-happy-piggy.svg';
import addMoneyIcon from './assets/icons/icon-add-money.svg?raw';
import allowanceDayIcon from './assets/icons/icon-allowance-day.svg?raw';
import myBalanceIcon from './assets/icons/icon-my-balance.svg?raw';
import parentLockIcon from './assets/icons/icon-parent-lock.svg?raw';
import takeOutIcon from './assets/icons/icon-take-out.svg?raw';
import unlockedIcon from './assets/icons/icon-unlocked.svg?raw';

const chunkyFilledIcons = [
  { label: 'Add money', raw: addMoneyIcon },
  { label: 'Take out', raw: takeOutIcon },
  { label: 'Allowance day', raw: allowanceDayIcon },
  { label: 'My balance', raw: myBalanceIcon },
  { label: 'Parent lock', raw: parentLockIcon },
  { label: 'Unlocked!', raw: unlockedIcon },
];

/**
 * Design-system sanity check - NOT a product screen.
 *
 * Proves the three foundation pieces this package ships load and compose
 * correctly: design tokens (src/styles/tokens.css), fonts
 * (src/styles/fonts.css), and the icon set (src/assets/icons/). The
 * "Chunky Filled" icons use `stroke="currentColor"`, so they're inlined
 * (via Vite's `?raw` import) inside an element whose `color` is set from a
 * token, demonstrating that the icons tint correctly wherever they're used.
 *
 * Frontend feature work should replace this file's contents with the real
 * app shell/router - just keep importing fonts.css/tokens.css from
 * src/main.tsx.
 */
export default function App() {
  return (
    <main style={{ padding: '2rem', maxWidth: 640, margin: '0 auto' }}>
      <img src={appIcon} alt="Edd's Wallet app icon" width={72} height={72} />
      <h1>Edd&apos;s Wallet</h1>
      <p>Design system foundation - tokens, fonts, and icons are wired up.</p>

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
        {chunkyFilledIcons.map((icon) => (
          <div key={icon.label} style={{ textAlign: 'center', fontSize: '0.75rem' }}>
            <span
              style={{
                display: 'inline-block',
                width: 40,
                height: 40,
                color: 'var(--color-primary)',
              }}
              // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted, build-time SVG source files, not user input
              dangerouslySetInnerHTML={{ __html: icon.raw }}
            />
            <div>{icon.label}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
