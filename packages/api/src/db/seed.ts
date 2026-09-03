// First-run seed (report Section 4, point 1): the reserved `system` user
// (id=1, used as `created_by_user_id` on every automated ledger row), one
// `parent` user, and - per data/edw-mvp/brief.md captain decision #1
// (single child named Edd for Phase 0) - one `child` user with their
// account, default spending pocket, and the always-unlocked `balance`
// concept.
//
// Idempotent: does nothing if any users already exist, so it's safe to
// call on every boot alongside the migration runner.
import { hashPin } from '../auth/pin.ts';
import type { DbHandle } from './connection.ts';
import { accounts, conceptUnlocks, pockets, users } from './schema.ts';

const CHILD_DISPLAY_NAME = process.env.EDW_CHILD_NAME?.trim() || 'Edd';
const PARENT_DISPLAY_NAME = process.env.EDW_PARENT_NAME?.trim() || 'Parent';

function nowIso(): string {
  return new Date().toISOString();
}

export function seedIfEmpty(writeDb: DbHandle): void {
  const existing = writeDb.db.select({ id: users.id }).from(users).limit(1).get();
  if (existing) return;

  writeDb.db.transaction((tx) => {
    const now = nowIso();

    // Reserved system user - relies on this being the very first insert
    // so SQLite's AUTOINCREMENT assigns it id 1, matching
    // @edds-wallet/shared's SYSTEM_USER_ID.
    tx.insert(users).values({ role: 'system', displayName: 'System', createdAt: now }).run();

    const parentPin = process.env.EDW_PARENT_PIN;
    const parentPinHash = parentPin ? hashPin(parentPin) : null;
    const parent = tx
      .insert(users)
      .values({
        role: 'parent',
        displayName: PARENT_DISPLAY_NAME,
        pinHash: parentPinHash?.hash ?? null,
        pinSalt: parentPinHash?.salt ?? null,
        createdAt: now,
      })
      .returning()
      .get();

    const childPin = process.env.EDW_CHILD_PIN;
    const childPinHash = childPin ? hashPin(childPin) : null;
    const child = tx
      .insert(users)
      .values({
        role: 'child',
        displayName: CHILD_DISPLAY_NAME,
        pinHash: childPinHash?.hash ?? null,
        pinSalt: childPinHash?.salt ?? null,
        createdAt: now,
      })
      .returning()
      .get();

    const account = tx
      .insert(accounts)
      .values({ childUserId: child.id, currencyLabel: 'USD', createdAt: now })
      .returning()
      .get();

    tx.insert(pockets)
      .values({
        accountId: account.id,
        kind: 'spending',
        name: 'Spending',
        isDefault: 1,
        createdAt: now,
      })
      .run();

    // "Balance" is always unlocked at account creation (report Section 5,
    // row 1). "Allowance" stays locked until the parent creates the first
    // allowance rule (src/routes/allowance-rules.ts).
    tx.insert(conceptUnlocks)
      .values({
        accountId: account.id,
        conceptKey: 'balance',
        unlockedAt: now,
        unlockedByUserId: parent.id,
      })
      .run();
  });
}
