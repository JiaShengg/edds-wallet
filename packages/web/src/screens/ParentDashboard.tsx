import type {
  AllowanceRuleCreateRequest,
  AllowanceRuleResponse,
  TransactionEntry,
} from '@edds-wallet/shared';
import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ApiError, api } from '../api/client';
import { Badge, Button, Card } from '../components/core';
import {
  ActivityRow,
  AllowanceRuleRow,
  BalanceCard,
  BrandMark,
  SwitchUserButton,
} from '../components/wallet';
import {
  activityRowKind,
  allowanceFrequencyLabel,
  formatActivityDate,
  formatNextOccurrence,
  parentActivityCopy,
} from '../lib/activity';
import { formatMoney } from '../lib/money';
import { useSession } from '../state/SessionContext';
import { MoneyModal } from './parent/MoneyModal';
import { RuleModal } from './parent/RuleModal';

type RuleModalState = { mode: 'create' } | { mode: 'edit'; rule: AllowanceRuleResponse } | null;

/**
 * Parent dashboard: balance, a single combined "Add or remove money"
 * control, allowance rules (create/edit/pause), and recent activity - the
 * captain-approved layout from the wireframe report. Every mutation here
 * hits a parent-only backend route; child mode never renders this screen.
 */
export function ParentDashboard() {
  const navigate = useNavigate();
  const { logout } = useSession();

  const [childName, setChildName] = useState<string | null>(null);
  const [balanceCents, setBalanceCents] = useState<number | null>(null);
  const [activity, setActivity] = useState<TransactionEntry[]>([]);
  const [rules, setRules] = useState<AllowanceRuleResponse[]>([]);
  const [nextOccurrenceAt, setNextOccurrenceAt] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [moneyModalOpen, setMoneyModalOpen] = useState(false);
  const [ruleModal, setRuleModal] = useState<RuleModalState>(null);
  const [submitting, setSubmitting] = useState(false);

  const refreshAll = useCallback(async () => {
    try {
      const [profiles, balance, transactions, rulesRes, nextAllowance] = await Promise.all([
        api.auth.profiles(),
        api.account.balance(),
        api.account.transactions({ limit: 50 }),
        api.allowanceRules.list(),
        api.account.nextAllowance(),
      ]);
      setChildName(profiles.profiles.find((p) => p.role === 'child')?.displayName ?? 'Your child');
      setBalanceCents(balance.balanceCents);
      setActivity(transactions.entries);
      setRules(rulesRes.rules);
      setNextOccurrenceAt(nextAllowance.nextAllowance?.nextOccurrenceAt ?? null);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "Couldn't load the dashboard.");
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const switchUser = () => {
    logout().finally(() => navigate('/', { replace: true }));
  };

  const saveMoney = async (input: {
    mode: 'deposit' | 'withdraw';
    amountCents: number;
    memo?: string;
  }) => {
    setSubmitting(true);
    setActionError(null);
    try {
      await api.money.act({
        type: input.mode === 'deposit' ? 'deposit' : 'withdrawal',
        amountCents: input.amountCents,
        memo: input.memo,
      });
      setMoneyModalOpen(false);
      await refreshAll();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "That didn't go through - try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const saveRule = async (input: AllowanceRuleCreateRequest) => {
    setSubmitting(true);
    setActionError(null);
    try {
      if (ruleModal?.mode === 'edit') {
        await api.allowanceRules.update(ruleModal.rule.id, input);
      } else {
        await api.allowanceRules.create(input);
      }
      setRuleModal(null);
      await refreshAll();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "That didn't save - try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const togglePause = async (rule: AllowanceRuleResponse) => {
    setActionError(null);
    try {
      if (rule.active) {
        await api.allowanceRules.pause(rule.id);
      } else {
        await api.allowanceRules.resume(rule.id);
      }
      await refreshAll();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "That didn't save - try again.");
    }
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

  if (balanceCents === null || childName === null) {
    return (
      <FullScreenMessage>
        <p style={{ color: 'var(--text-muted)' }}>Loading dashboard…</p>
      </FullScreenMessage>
    );
  }

  // The backend's "next allowance" read is a single household-wide value
  // (report Section 5's "next occurrence" concept, not per-rule) - only
  // attribute it to a specific rule row when there's exactly one active
  // rule, so we never show a next-payout date next to the wrong rule.
  const activeRules = rules.filter((r) => r.active);
  const soleActiveRuleId = activeRules.length === 1 ? activeRules[0]?.id : null;
  const lastChange = activity[0] ? formatActivityDate(activity[0].createdAt) : null;
  const entryNoun = activity.length === 1 ? 'entry' : 'entries';
  const balanceCaption = lastChange
    ? `${activity.length} ${entryNoun} · last change ${lastChange}`
    : `${activity.length} ${entryNoun}`;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-4) var(--space-8)',
          background: 'var(--surface-card)',
          borderBottom: '1px solid var(--color-hairline)',
        }}
      >
        <BrandMark size={40} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <Badge tone="brand" icon="parent-lock">
            Parent mode
          </Badge>
          <SwitchUserButton mode="parent" onClick={switchUser} />
        </div>
      </header>

      <main
        style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: 'var(--pad-screen)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--gap-card)',
        }}
      >
        {actionError ? (
          <p
            style={{
              margin: 0,
              color: 'var(--color-error)',
              fontWeight: 'var(--weight-bold)',
              fontSize: 'var(--type-body-sm)',
            }}
          >
            {actionError}
          </p>
        ) : null}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: 'var(--gap-card)',
            alignItems: 'stretch',
          }}
        >
          <div data-testid="parent-balance">
            <BalanceCard
              tone="surface"
              size="md"
              label={`${childName}'s balance`}
              amount={formatMoney(balanceCents)}
              caption={balanceCaption}
            />
          </div>
          <Card
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 'var(--space-3)',
            }}
          >
            <Button icon="add-money" fullWidth onClick={() => setMoneyModalOpen(true)}>
              Add or remove money
            </Button>
            <p
              style={{
                margin: 0,
                fontSize: 'var(--type-body-sm)',
                color: 'var(--text-muted)',
                textAlign: 'center',
              }}
            >
              Record a real-world payment or take money out.
            </p>
          </Card>
        </div>

        <Card
          title="Allowance Rules"
          action={
            <Button variant="quiet" size="sm" onClick={() => setRuleModal({ mode: 'create' })}>
              + New rule
            </Button>
          }
        >
          <p
            style={{
              margin: '0 0 var(--space-4)',
              fontSize: 'var(--type-body-sm)',
              color: 'var(--text-muted)',
            }}
          >
            Recurring payouts into {childName}'s wallet. Create, edit, or pause any rule.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-row)' }}>
            {rules.map((rule) => (
              <AllowanceRuleRow
                key={rule.id}
                amount={formatMoney(rule.amountCents)}
                frequency={`/ ${allowanceFrequencyLabel(rule.frequency)}`}
                nextDate={
                  // AllowanceRuleRow only reads `paused` for its own "Resumes
                  // when you turn it back on" copy once `nextDate` is
                  // truthy at all - the placeholder value itself is never
                  // shown in that branch.
                  !rule.active
                    ? 'paused'
                    : rule.id === soleActiveRuleId && nextOccurrenceAt
                      ? formatNextOccurrence(nextOccurrenceAt)
                      : undefined
                }
                paused={!rule.active}
                onEdit={() => setRuleModal({ mode: 'edit', rule })}
                onTogglePause={() => togglePause(rule)}
              />
            ))}
            {rules.length === 0 ? (
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--type-body-sm)' }}>
                No rules yet. Add one and allowance pays itself.
              </p>
            ) : null}
          </div>
          {soleActiveRuleId && nextOccurrenceAt ? (
            <p
              style={{
                margin: 'var(--space-4) 0 0',
                fontSize: 'var(--type-body-sm)',
                color: 'var(--text-muted)',
              }}
            >
              {childName} sees "Next allowance: {formatNextOccurrence(nextOccurrenceAt)} —{' '}
              {formatMoney(activeRules[0]?.amountCents ?? 0)}".
            </p>
          ) : null}
        </Card>

        <Card title="Recent Activity">
          <div>
            {activity.slice(0, 6).map((t) => {
              const copy = parentActivityCopy(t);
              return (
                <ActivityRow
                  key={t.id}
                  kind={activityRowKind(t)}
                  title={copy.title}
                  meta={copy.meta}
                  amount={formatMoney(Math.abs(t.amountCents))}
                />
              );
            })}
            {activity.length === 0 ? (
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--type-body-sm)' }}>
                Nothing yet - add money to get started.
              </p>
            ) : null}
          </div>
        </Card>
      </main>

      {moneyModalOpen ? (
        <MoneyModal
          childName={childName}
          balanceCents={balanceCents}
          submitting={submitting}
          onClose={() => setMoneyModalOpen(false)}
          onSave={saveMoney}
        />
      ) : null}

      {ruleModal ? (
        <RuleModal
          rule={ruleModal.mode === 'edit' ? ruleModal.rule : null}
          submitting={submitting}
          onClose={() => setRuleModal(null)}
          onSave={saveRule}
        />
      ) : null}
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
