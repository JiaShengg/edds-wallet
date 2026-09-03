// The physical half of the two-independent-ways read-only enforcement
// (report Section 2): `readDb`'s underlying connection is opened with
// `{ readonly: true }`, so a write through it fails at the SQLite engine
// level - independent of any application-level role check. This directly
// exercises that guarantee, not just the routing layer around it.
import { randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb, getReadDb, getWriteDb, initDb } from '../src/db/connection.ts';
import { runPendingMigrations } from '../src/db/migrate.ts';
import { accounts, pockets, users } from '../src/db/schema.ts';
import { seedIfEmpty } from '../src/db/seed.ts';
import { mustExist } from './helpers.ts';

let dir: string;
let dbPath: string;

beforeEach(() => {
  dir = mkdtempSync(path.join(os.tmpdir(), 'edw-readonly-test-'));
  dbPath = path.join(dir, `${randomUUID()}.db`);
});

afterEach(() => {
  closeDb();
  rmSync(dir, { recursive: true, force: true });
});

it('a write through readDb is rejected by SQLite itself', () => {
  const { writeDb } = initDb(dbPath);
  runPendingMigrations(writeDb);

  const readDb = getReadDb();
  expect(() => {
    readDb.db.insert(users).values({ role: 'child', displayName: 'Nope', createdAt: 'now' }).run();
  }).toThrow(/readonly database/i);
});

it('reads via readDb still work after writeDb writes', () => {
  const { writeDb } = initDb(dbPath);
  runPendingMigrations(writeDb);
  writeDb.db
    .insert(users)
    .values({ role: 'child', displayName: 'Reader Test', createdAt: 'now' })
    .run();

  const readDb = getReadDb();
  const rows = readDb.db.select().from(users).all();
  expect(rows.some((r) => r.displayName === 'Reader Test')).toBe(true);
});

describe('append-only ledger triggers', () => {
  it('blocks UPDATE and DELETE on cash_entries', () => {
    const { writeDb } = initDb(dbPath);
    runPendingMigrations(writeDb);
    seedIfEmpty(writeDb);
    const write = getWriteDb();

    const child = mustExist(
      write.db.select().from(users).where(eq(users.role, 'child')).get(),
      'seeded child user',
    );
    const account = mustExist(
      write.db.select().from(accounts).where(eq(accounts.childUserId, child.id)).get(),
      "child's account",
    );
    const pocket = mustExist(
      write.db.select().from(pockets).where(eq(pockets.accountId, account.id)).get(),
      'default spending pocket',
    );

    write.raw
      .prepare(
        `INSERT INTO cash_entries
          (pocket_id, amount_cents, entry_type, created_by_user_id, balance_after_cents, created_at)
         VALUES (?, 500, 'deposit', 1, 500, '2026-01-01T00:00:00.000Z')`,
      )
      .run(pocket.id);

    expect(() =>
      write.raw.prepare('UPDATE cash_entries SET amount_cents = 999 WHERE id = 1').run(),
    ).toThrow(/append-only/);
    expect(() => write.raw.prepare('DELETE FROM cash_entries WHERE id = 1').run()).toThrow(
      /append-only/,
    );
  });
});
