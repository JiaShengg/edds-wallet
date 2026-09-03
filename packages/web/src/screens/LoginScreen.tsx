import type { AuthProfile, UserRole } from '@edds-wallet/shared';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ApiError, api } from '../api/client';
import { Button } from '../components/core';
import { PinPad } from '../components/forms';
import { BrandMark, ProfileTile } from '../components/wallet';
import { useSession } from '../state/SessionContext';

/** Login tiles only ever show household profiles, never the reserved `system` user
 * (the backend's `/api/auth/profiles` already filters it out server-side; this
 * narrows the type to match). */
type DisplayableProfile = AuthProfile & { role: 'parent' | 'child' };

function isDisplayableProfile(profile: AuthProfile): profile is DisplayableProfile {
  return profile.role === 'parent' || profile.role === 'child';
}

type Step = { name: 'tiles' } | { name: 'pin'; profile: DisplayableProfile };

/**
 * Login / profile selector - the login screen AND the "Switch user"
 * destination for both roles, per the wireframe report's sitemap. Big
 * tappable tiles, an optional PIN pad for profiles that have one set.
 */
export function LoginScreen() {
  const navigate = useNavigate();
  const { login } = useSession();
  const [profiles, setProfiles] = useState<DisplayableProfile[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>({ name: 'tiles' });
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.auth
      .profiles()
      .then((res) => {
        if (!cancelled) setProfiles(res.profiles.filter(isDisplayableProfile));
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(err instanceof ApiError ? err.message : 'Could not load profiles.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // The backend never issues a session for the reserved `system` user
  // (auth.ts 401s it), so any real login response is 'parent' or 'child' -
  // this just satisfies the broader `UserRole` type from a login response.
  const goToRole = useCallback(
    (role: UserRole) => {
      navigate(role === 'parent' ? '/parent' : '/child', { replace: true });
    },
    [navigate],
  );

  const tapTile = (profile: DisplayableProfile) => {
    if (profile.hasPin) {
      setPin('');
      setPinError(null);
      setStep({ name: 'pin', profile });
      return;
    }
    setSubmitting(true);
    login(profile.id)
      .then((user) => goToRole(user.role))
      .catch((err: unknown) => {
        setSubmitting(false);
        setLoadError(err instanceof ApiError ? err.message : 'Could not log in.');
      });
  };

  const submitPin = (value: string) => {
    if (step.name !== 'pin') return;
    setSubmitting(true);
    login(step.profile.id, value)
      .then((user) => goToRole(user.role))
      .catch(() => {
        setSubmitting(false);
        setPinError("That's not it — try again");
        setTimeout(() => {
          setPin('');
          setPinError(null);
        }, 900);
      });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-10)',
        padding: 'var(--space-10)',
      }}
    >
      <BrandMark size={56} />

      {step.name === 'tiles' ? (
        <>
          <div style={{ textAlign: 'center' }}>
            <h1
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--type-display-md)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--color-text)',
              }}
            >
              Who's using Edd's Wallet?
            </h1>
            <p style={{ margin: 'var(--space-2) 0 0', color: 'var(--text-muted)' }}>
              Tap your name to continue
            </p>
          </div>

          {loadError ? (
            <p style={{ color: 'var(--color-error)', fontWeight: 'var(--weight-bold)' }}>
              {loadError}
            </p>
          ) : profiles === null ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading profiles…</p>
          ) : (
            <div
              style={{
                display: 'flex',
                gap: 'var(--space-6)',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {profiles.map((profile) => (
                <ProfileTile
                  key={profile.id}
                  role={profile.role}
                  name={profile.displayName}
                  hasPin={profile.hasPin}
                  onClick={() => tapTile(profile)}
                  style={submitting ? { pointerEvents: 'none', opacity: 0.6 } : undefined}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <PinPad
            value={pin}
            onChange={setPin}
            onSubmit={submitPin}
            error={pinError}
            label={`Enter ${step.profile.displayName}'s PIN`}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStep({ name: 'tiles' });
              setPin('');
              setPinError(null);
            }}
          >
            Back
          </Button>
        </>
      )}

      <p
        style={{
          margin: 0,
          maxWidth: 420,
          textAlign: 'center',
          fontSize: 'var(--type-body-sm)',
          color: 'var(--text-muted)',
        }}
      >
        A PIN here is an optional "seatbelt" so a sibling can't casually tap into Parent mode - it
        isn't real security. Runs on this computer only. No real money moves.
      </p>
    </div>
  );
}
