import type { TransactionEntry } from '@edds-wallet/shared';
import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ApiError, api } from '../api/client';
import { Button } from '../components/core';
import {
  ActivityRow,
  BalanceCard,
  BrandMark,
  NextAllowanceBanner,
  ReadOnlyNotice,
  SwitchUserButton,
} from '../components/wallet';
import { activityRowKind, formatNextOccurrence, kidActivityCopy } from '../lib/activity';
import { formatMoney } from '../lib/money';
import { useSession } from '../state/SessionContext';

/**
 * Edd's wallet view: read-only balance, "Next allowance" banner, a
 * de-emphasized "Switch user" control (wireframe UX requirement #1), and
 * kid-friendly transaction history. No mutating control is ever rendered
 * here - the backend also enforces read-only server-side, this is just
 * the UI half of that contract.
 */
export function ChildWallet() {
  const navigate = useNavigate();
  const { user, logout } = useSession();

  const [balanceCents, setBalanceCents] = useState<number | null>(null);
  const [activity, setActivity] = useState<TransactionEntry[]>([]);
  const [nextAllowance, setNextAllowance] = useState<{ when: string; amountCents: number } | null>(
    null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshAll = useCallback(async () => {
    try {
      const [balance, transactions, next] = await Promise.all([
        api.account.balance(),
        api.account.transactions({ limit: 50 }),
        api.account.nextAllowance(),
      ]);
      setBalanceCents(balance.balanceCents);
      setActivity(transactions.entries);
      setNextAllowance(
        next.nextAllowance
          ? {
              when: formatNextOccurrence(next.nextAllowance.nextOccurrenceAt),
              amountCents: next.nextAllowance.amountCents,
            }
          : null,
      );
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "Couldn't load your wallet.");
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const switchUser = () => {
    logout().finally(() => navigate('/', { replace: true }));
  };

  if (loadError) {
    return (
      <FullScreenMessage>
        <p style={{ color: 'var(--color-error)', fontWeight: 'var(--weight-bold)' }}>{loadError}</p>
        <Button size="sm" onClick={() => refreshAll()}>
          Try again
        </Button>
      </FullScreenMessage>
    );
  }

  if (balanceCents === null || !user) {
    return (
      <FullScreenMessage>
        <p style={{ color: 'var(--text-muted)' }}>Loading your wallet…</p>
      </FullScreenMessage>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-4) var(--space-8)',
        }}
      >
        <BrandMark size={44} name={`${user.displayName}'s Wallet`} />
        <SwitchUserButton mode="child" onClick={switchUser} />
      </header>

      <main
        style={{
          maxWidth: 760,
          margin: '0 auto',
          padding: '0 var(--pad-screen) var(--space-12)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-5)',
        }}
      >
        <div data-testid="child-balance">
          <BalanceCard label="My balance" amount={formatMoney(balanceCents)} />
        </div>

        {nextAllowance ? (
          <NextAllowanceBanner
            when={nextAllowance.when}
            amount={formatMoney(nextAllowance.amountCents)}
          />
        ) : null}

        <ReadOnlyNotice />

        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--type-display-md)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-text)',
            margin: 'var(--space-3) 0 0',
          }}
        >
          What's happened lately
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {activity.map((t) => {
            const copy = kidActivityCopy(t);
            return (
              <ActivityRow
                key={t.id}
                variant="kid"
                kind={activityRowKind(t)}
                emoji={copy.emoji}
                title={copy.title}
                meta={copy.meta}
                amount={formatMoney(Math.abs(t.amountCents))}
              />
            );
          })}
          {activity.length === 0 ? (
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
              Nothing here yet - check back soon!
            </p>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function FullScreenMessage({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-4)',
        background: 'var(--color-bg)',
      }}
    >
      {children}
    </div>
  );
}
