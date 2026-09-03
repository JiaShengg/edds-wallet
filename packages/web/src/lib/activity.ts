import type { AllowanceFrequency, CashEntryType, TransactionEntry } from '@edds-wallet/shared';
import { formatMoney } from './money';

/** Plain-language date for activity rows - "Today", "Yesterday", or "Mon 14 Apr". */
export function formatActivityDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOf(now) - startOf(date)) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date);
}

/**
 * Turns the server-computed, catch-up-safe `nextOccurrenceAt` instant
 * (`GET /api/account/allowance/next`) into the wireframe's plain-language
 * banner copy ("next Monday", "1 May"). The date math itself stays
 * server-side (data/edw-wireframes/report.md recommendation #3) - this is
 * presentation only.
 */
export function formatNextOccurrence(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOf(date) - startOf(now)) / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  // A weekly cadence always lands exactly 7 days out - keep that reading as
  // "next {weekday}" (the wireframe's approved copy), and only fall back to
  // an absolute date for cadences further out (biweekly/monthly).
  if (days <= 7)
    return `next ${new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date)}`;
  return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' }).format(date);
}

const PARENT_LABEL: Partial<Record<CashEntryType, string>> = {
  deposit: 'Deposit',
  withdrawal: 'Withdraw',
  allowance_payout: 'Allowance',
};

/** Parent-mode activity row copy - plain, no jargon, but not dressed up for a kid. */
export function parentActivityCopy(t: TransactionEntry) {
  const label = PARENT_LABEL[t.entryType] ?? 'Money moved';
  return {
    title: t.memo ? `${label} · ${t.memo}` : label,
    meta: `${formatActivityDate(t.createdAt)} · ${t.entryType === 'allowance_payout' ? 'automatic' : 'recorded by you'}`,
  };
}

/** Kid-mode activity row copy - warm, first-person, one emoji per row (voice guide). */
export function kidActivityCopy(t: TransactionEntry) {
  const amount = formatMoney(Math.abs(t.amountCents));
  const date = formatActivityDate(t.createdAt);
  if (t.entryType === 'allowance_payout') {
    return { emoji: '📅', title: 'Your allowance showed up', meta: date };
  }
  if (t.entryType === 'withdrawal' || t.amountCents < 0) {
    return {
      emoji: '🛍️',
      title: `${amount} left your wallet`,
      meta: t.memo ? `${t.memo} · ${date}` : date,
    };
  }
  return {
    emoji: '🎉',
    title: `You got ${amount}!`,
    meta: t.memo ? `${t.memo} · ${date}` : date,
  };
}

/** ActivityRow's `kind` prop only knows deposit/withdraw/allowance - map the ledger's entry type onto it. */
export function activityRowKind(t: TransactionEntry): 'deposit' | 'withdraw' | 'allowance' {
  if (t.entryType === 'allowance_payout') return 'allowance';
  if (t.entryType === 'withdrawal' || t.amountCents < 0) return 'withdraw';
  return 'deposit';
}

const FREQUENCY_LABEL: Record<AllowanceFrequency, string> = {
  weekly: 'week',
  biweekly: '2 weeks',
  monthly: 'month',
};

/** "$5.00 / week" - the wireframe's approved allowance-rule amount/frequency copy. */
export function allowanceFrequencyLabel(frequency: AllowanceFrequency): string {
  return FREQUENCY_LABEL[frequency];
}
