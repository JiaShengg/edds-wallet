// Required ledger-math unit tests (data/edw-mvp/brief.md): the derived
// balance (via the app's own SUM()-based helper, and via a completely
// separate manual SUM query against the raw SQLite file) must agree
// across deposits, withdrawals, and allowance payouts produced by the
// catch-up scheduler.
import { randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { DbHandle } from '../src/db/connection.ts';
import { closeDb, initDb } from '../src/db/connection.ts';
import { runPendingMigrations } from '../src/db/migrate.ts';
import { accounts, allowanceRules, users } from '../src/db/schema.ts';
import { seedIfEmpty } from '../src/db/seed.ts';
import { runAllowanceScheduler } from '../src/jobs/allowance-scheduler.ts';
import {
  getDefaultSpendingPocket,
  getPocketBalanceCents,
  insertCashEntry,
} from '../src/lib/ledger.ts';
import { mustExist } from './helpers.ts';

let dir: string;
let dbPath: string;

beforeEach(() => {
  dir = mkdtempSync(path.join(os.tmpdir(), 'edw-ledger-test-'));
  dbPath = path.join(dir, `${randomUUID()}.db`);
});

afterEach(() => {
  closeDb();
  rmSync(dir, { recursive: true, force: true });
});

/** Independent of the app's own drizzle/better-sqlite3 connections -
 * opens a brand new connection to the same file and runs a plain manual
 * `SUM` query, so this genuinely cross-checks the app's derivation logic
 * rather than re-testing the same code path. */
function manualSumBalance(pocketId: number): number {
  const raw = new Database(dbPath, { readonly: true });
  try {
    const row = raw
      .prepare(
        'SELECT COALESCE(SUM(amount_cents), 0) as total FROM cash_entries WHERE pocket_id = ?',
      )
      .get(pocketId) as { total: number };
    return row.total;
  } finally {
    raw.close();
  }
}

/** Boots a fresh seeded DB and returns the seeded fixture ids/pocket. */
function seedFixtures(writeDb: DbHandle) {
  runPendingMigrations(writeDb);
  seedIfEmpty(writeDb);

  const child = mustExist(
    writeDb.db.select().from(users).where(eq(users.role, 'child')).get(),
    'seeded child user',
  );
  const parent = mustExist(
    writeDb.db.select().from(users).where(eq(users.role, 'parent')).get(),
    'seeded parent user',
  );
  const account = mustExist(
    writeDb.db.select().from(accounts).where(eq(accounts.childUserId, child.id)).get(),
    "child's account",
  );
  const pocket = getDefaultSpendingPocket(writeDb, account.id);

  return { childId: child.id, parentId: parent.id, accountId: account.id, pocket };
}

describe('derived balance matches a manual SUM over the ledger', () => {
  it('across deposits and withdrawals', () => {
    const { writeDb } = initDb(dbPath);
    const { childId, pocket } = seedFixtures(writeDb);

    const now = () => new Date().toISOString();
    insertCashEntry(writeDb, {
      pocketId: pocket.id,
      amountCents: 1000,
      entryType: 'deposit',
      createdByUserId: childId,
      createdAt: now(),
      sourceType: 'manual',
    });
    insertCashEntry(writeDb, {
      pocketId: pocket.id,
      amountCents: -300,
      entryType: 'withdrawal',
      createdByUserId: childId,
      createdAt: now(),
      sourceType: 'manual',
      disallowOverdraft: true,
    });
    insertCashEntry(writeDb, {
      pocketId: pocket.id,
      amountCents: 250,
      entryType: 'deposit',
      createdByUserId: childId,
      createdAt: now(),
      sourceType: 'manual',
    });

    const derived = getPocketBalanceCents(writeDb, pocket.id);
    expect(derived).toBe(1000 - 300 + 250);
    expect(derived).toBe(manualSumBalance(pocket.id));
  });

  it('across allowance payouts produced by the catch-up scheduler', () => {
    const { writeDb } = initDb(dbPath);
    const { accountId, parentId, pocket } = seedFixtures(writeDb);

    // An anchor far enough in the past that "now" has definitely passed
    // several weekly occurrences - exercises the catch-up (not just
    // "pay one occurrence") path.
    const anchor = new Date();
    anchor.setUTCDate(anchor.getUTCDate() - 25); // ~3.5 weekly occurrences back
    const anchorDate = anchor.toISOString().slice(0, 10);

    const now = new Date().toISOString();
    writeDb.db
      .insert(allowanceRules)
      .values({
        accountId,
        pocketId: pocket.id,
        amountCents: 500,
        frequency: 'weekly',
        anchorDate,
        active: 1,
        createdByUserId: parentId,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    insertCashEntry(writeDb, {
      pocketId: pocket.id,
      amountCents: 1000,
      entryType: 'deposit',
      createdByUserId: parentId,
      createdAt: now,
      sourceType: 'manual',
    });

    const results = runAllowanceScheduler(writeDb, new Date());
    expect(results.length).toBe(1);
    expect(results[0]?.payoutsCreated).toBeGreaterThanOrEqual(4);

    const derived = getPocketBalanceCents(writeDb, pocket.id);
    expect(derived).toBe(manualSumBalance(pocket.id));
    expect(derived).toBe(1000 + (results[0]?.payoutsCreated ?? 0) * 500);

    // Idempotency: running it again the same "now" must not double-pay.
    const secondPass = runAllowanceScheduler(writeDb, new Date());
    expect(secondPass).toEqual([]);
    expect(getPocketBalanceCents(writeDb, pocket.id)).toBe(manualSumBalance(pocket.id));
  });

  it('rejects a withdrawal that would overdraw the pocket', () => {
    const { writeDb } = initDb(dbPath);
    const { childId, pocket } = seedFixtures(writeDb);

    expect(() =>
      insertCashEntry(writeDb, {
        pocketId: pocket.id,
        amountCents: -100,
        entryType: 'withdrawal',
        createdByUserId: childId,
        createdAt: new Date().toISOString(),
        sourceType: 'manual',
        disallowOverdraft: true,
      }),
    ).toThrow(/Insufficient balance/);

    expect(getPocketBalanceCents(writeDb, pocket.id)).toBe(0);
  });
});
