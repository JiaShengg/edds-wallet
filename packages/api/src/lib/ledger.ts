// The ledger is the source of truth: every balance is derived via SUM()
// over cash_entries, never a stored counter (report Section 3). This
// module is the only place that inserts cash_entries rows, so the
// "compute balance, then insert the next row" step is always one atomic
// transaction - no other writer can race it.

import type { CashEntrySourceType, CashEntryType } from '@edds-wallet/shared';
import { and, desc, eq, isNull, lt, sql } from 'drizzle-orm';
import type { DbHandle } from '../db/connection.ts';
import { cashEntries, pockets } from '../db/schema.ts';

export class InsufficientBalanceError extends Error {
  readonly balanceCents: number;
  readonly requestedCents: number;

  constructor(balanceCents: number, requestedCents: number) {
    super(`Insufficient balance: has ${balanceCents}, requested ${requestedCents}.`);
    this.name = 'InsufficientBalanceError';
    this.balanceCents = balanceCents;
    this.requestedCents = requestedCents;
  }
}

export function getDefaultSpendingPocket(db: DbHandle, accountId: number) {
  const pocket = db.db
    .select()
    .from(pockets)
    .where(
      and(
        eq(pockets.accountId, accountId),
        eq(pockets.kind, 'spending'),
        eq(pockets.isDefault, 1),
        isNull(pockets.archivedAt),
      ),
    )
    .get();
  if (!pocket) throw new Error(`Account ${accountId} has no default spending pocket.`);
  return pocket;
}

/** `SELECT SUM(amount_cents) FROM cash_entries WHERE pocket_id = ?` -
 * exactly the derivation formula in report Section 3. Never a mutable
 * counter. */
export function getPocketBalanceCents(db: DbHandle, pocketId: number): number {
  return balanceCentsQuery(db.db, pocketId);
}

interface SelectCapable {
  select: DbHandle['db']['select'];
}

function balanceCentsQuery<Q extends SelectCapable>(qb: Q, pocketId: number): number {
  const row = qb
    .select({ total: sql<number>`coalesce(sum(${cashEntries.amountCents}), 0)` })
    .from(cashEntries)
    .where(eq(cashEntries.pocketId, pocketId))
    .get();
  return row?.total ?? 0;
}

export interface InsertCashEntryInput {
  pocketId: number;
  amountCents: number;
  entryType: CashEntryType;
  createdByUserId: number;
  createdAt: string;
  memo?: string | null;
  sourceType?: CashEntrySourceType | null;
  sourceId?: number | null;
  transferGroupId?: string | null;
  /** When true, a negative resulting balance throws
   * `InsufficientBalanceError` instead of being written. Withdrawals set
   * this; system-generated entries (allowance payouts) do not need to
   * (a payout is always additive). */
  disallowOverdraft?: boolean;
}

/** Appends one ledger row. Atomic: balance is read and the row is written
 * inside a single transaction on `writeDb`, so concurrent requests can't
 * derive a stale `balance_after_cents` snapshot. */
export function insertCashEntry(writeDb: DbHandle, input: InsertCashEntryInput) {
  return writeDb.db.transaction((tx) => {
    const currentBalance = balanceCentsQuery(tx, input.pocketId);
    const balanceAfterCents = currentBalance + input.amountCents;
    if (input.disallowOverdraft && balanceAfterCents < 0) {
      throw new InsufficientBalanceError(currentBalance, -input.amountCents);
    }
    return tx
      .insert(cashEntries)
      .values({
        pocketId: input.pocketId,
        amountCents: input.amountCents,
        entryType: input.entryType,
        transferGroupId: input.transferGroupId ?? null,
        sourceType: input.sourceType ?? null,
        sourceId: input.sourceId ?? null,
        memo: input.memo ?? null,
        createdByUserId: input.createdByUserId,
        balanceAfterCents,
        createdAt: input.createdAt,
      })
      .returning()
      .get();
  });
}

export interface ListCashEntriesOptions {
  limit: number;
  beforeId?: number;
}

/** Reverse-chronological (newest first), matching
 * data/edw-wireframes/report.md UX decision #5 (flat list, no date-header
 * grouping). */
export function listCashEntries(db: DbHandle, pocketId: number, options: ListCashEntriesOptions) {
  return db.db
    .select()
    .from(cashEntries)
    .where(
      and(
        eq(cashEntries.pocketId, pocketId),
        options.beforeId !== undefined ? lt(cashEntries.id, options.beforeId) : undefined,
      ),
    )
    .orderBy(desc(cashEntries.id))
    .limit(options.limit)
    .all();
}

/** How many payouts a given allowance rule has already produced - the
 * catch-up scheduler's occurrence cursor (src/jobs/allowance-scheduler.ts). */
export function countAllowancePayouts(db: DbHandle, allowanceRuleId: number): number {
  const row = db.db
    .select({ count: sql<number>`count(*)` })
    .from(cashEntries)
    .where(
      and(eq(cashEntries.sourceType, 'allowance_rule'), eq(cashEntries.sourceId, allowanceRuleId)),
    )
    .get();
  return row?.count ?? 0;
}
