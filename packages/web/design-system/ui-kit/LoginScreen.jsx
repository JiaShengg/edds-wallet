const { ProfileTile, PinPad, BrandMark, Button } = window.EddSWalletDesignSystem_5fd7ab;

function LoginScreen({ household, onLogin }) {
  const [step, setStep] = React.useState('tiles');
  const [pin, setPin] = React.useState('');
  const [error, setError] = React.useState(null);

  const submit = (value) => {
    if (value === household.parentPin) { onLogin('parent'); }
    else { setError("That's not it — try again"); setTimeout(() => { setPin(''); setError(null); }, 900); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-10)', padding: 'var(--space-10)' }}>
      <BrandMark size={56} />
      {step === 'tiles' ? (
        <>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--type-display-md)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text)' }}>Who's using the wallet?</h1>
          <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
            <ProfileTile role="parent" hasPin={household.parentHasPin} onClick={() => setStep('pin')} />
            <ProfileTile role="child" name={household.childName} onClick={() => onLogin('child')} />
          </div>
        </>
      ) : (
        <>
          <PinPad value={pin} onChange={setPin} onSubmit={submit} error={error} />
          <Button variant="ghost" size="sm" onClick={() => { setStep('tiles'); setPin(''); setError(null); }}>Back</Button>
        </>
      )}
      <p style={{ margin: 0, fontSize: 'var(--type-body-sm)', color: 'var(--text-muted)' }}>Runs on this computer only. No real money moves.</p>
    </div>
  );
}

Object.assign(window, { LoginScreen });
