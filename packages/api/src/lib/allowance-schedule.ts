// Pure occurrence-date math for allowance rules, shared by the catch-up
// scheduler (src/jobs/allowance-scheduler.ts, which turns a missed
// occurrence into a cash_entries row) and the read-only "next allowance"
// endpoint (src/routes/account.ts, which just reports a date/amount).
//
// This app is only up when a parent opens it, not a 24/7 daemon (report
// Section 5) - the scheduler doesn't run on a timer between occurrences,
// it recomputes every occurrence since the rule's anchor on every boot.
import type { AllowanceFrequency } from '@edds-wallet/shared';

/** Safety valve against a corrupt/far-past anchor date generating an
 * unbounded loop - 10 years of weekly occurrences, comfortably more than
 * any real gap between app opens. */
const MAX_OCCURRENCES_PER_PASS = 520;

function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function addMonthsClamped(date: Date, months: number): Date {
  const day = date.getUTCDate();
  const result = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1, 0, 0, 0, 0),
  );
  const daysInTargetMonth = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();
  result.setUTCDate(Math.min(day, daysInTargetMonth));
  return result;
}

/** `anchorDate` is a `YYYY-MM-DD` calendar date, interpreted as UTC
 * midnight - allowance day is a calendar day, not a timezone-sensitive
 * instant. Occurrence 0 is the anchor date itself. */
export function occurrenceDate(
  anchorDate: string,
  frequency: AllowanceFrequency,
  index: number,
): Date {
  const anchor = new Date(`${anchorDate}T00:00:00.000Z`);
  switch (frequency) {
    case 'weekly':
      return addDays(anchor, index * 7);
    case 'biweekly':
      return addDays(anchor, index * 14);
    case 'monthly':
      return addMonthsClamped(anchor, index);
    default: {
      const exhaustive: never = frequency;
      throw new Error(`Unknown allowance frequency: ${String(exhaustive)}`);
    }
  }
}

export function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export interface MissedOccurrence {
  index: number;
  occurredAt: Date;
}

/** Every occurrence at index >= `paidCount` whose date is <= `now`. */
export function computeMissedOccurrences(
  anchorDate: string,
  frequency: AllowanceFrequency,
  paidCount: number,
  now: Date,
): MissedOccurrence[] {
  const missed: MissedOccurrence[] = [];
  for (let i = 0; i < MAX_OCCURRENCES_PER_PASS; i += 1) {
    const index = paidCount + i;
    const date = occurrenceDate(anchorDate, frequency, index);
    if (date.getTime() > now.getTime()) break;
    missed.push({ index, occurredAt: date });
  }
  return missed;
}

/** The next occurrence strictly after `now` (or equal to `now`, for a
 * boundary tick), for the child's "Next allowance" banner
 * (data/edw-wireframes/report.md UX decision #6). Assumes the caller has
 * already run the catch-up scheduler this boot, so `paidCount` reflects
 * every occurrence up to `now`. */
export function nextOccurrenceAfter(
  anchorDate: string,
  frequency: AllowanceFrequency,
  paidCount: number,
): Date {
  return occurrenceDate(anchorDate, frequency, paidCount);
}
