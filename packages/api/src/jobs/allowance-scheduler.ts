// Catch-up-safe allowance scheduler (report Section 5): run on every
// boot, before the server starts listening, so a rule that was due while
// the app was closed still gets paid the moment it's opened again - this
// is one of the two places (with src/routes/allowance-rules.ts) allowed
// to import `writeDb`.

import { SYSTEM_USER_ID } from '@edds-wallet/shared';
import { eq } from 'drizzle-orm';
import type { DbHandle } from '../db/connection.ts';
import { allowanceRules } from '../db/schema.ts';
import { computeMissedOccurrences } from '../lib/allowance-schedule.ts';
import { countAllowancePayouts, insertCashEntry } from '../lib/ledger.ts';

export interface AllowanceRunResult {
  ruleId: number;
  payoutsCreated: number;
}

/** Runs the catch-up pass for every active allowance rule. Idempotent:
 * calling it twice in a row produces zero new payouts the second time,
 * since the occurrence cursor is derived from already-recorded payouts
 * (`countAllowancePayouts`), not from a separate "last run at" timestamp. */
export function runAllowanceScheduler(
  writeDb: DbHandle,
  now: Date = new Date(),
): AllowanceRunResult[] {
  const activeRules = writeDb.db
    .select()
    .from(allowanceRules)
    .where(eq(allowanceRules.active, 1))
    .all();

  const results: AllowanceRunResult[] = [];
  for (const rule of activeRules) {
    const paidCount = countAllowancePayouts(writeDb, rule.id);
    const missed = computeMissedOccurrences(rule.anchorDate, rule.frequency, paidCount, now);

    for (const occurrence of missed) {
      insertCashEntry(writeDb, {
        pocketId: rule.pocketId,
        amountCents: rule.amountCents,
        entryType: 'allowance_payout',
        createdByUserId: SYSTEM_USER_ID,
        createdAt: occurrence.occurredAt.toISOString(),
        memo: rule.memo,
        sourceType: 'allowance_rule',
        sourceId: rule.id,
      });
    }

    if (missed.length > 0) {
      results.push({ ruleId: rule.id, payoutsCreated: missed.length });
    }
  }
  return results;
}
