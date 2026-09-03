// Resolves "which account does this session act on" entirely server-side
// - never from a client-supplied id (report Section 2/4).
//
// Phase 0 is single-child only (data/edw-mvp/brief.md captain decision
// #1): a child session's account is simply their own; a parent session
// has no account of their own; it manages the household's one child
// account. This resolver is the single place that simplification lives,
// so a later multi-child phase only has to change this function (e.g. to
// take an explicit, parent-owned child id and *authorize* it against the
// parent's children server-side) rather than every route.
import { and, eq, isNull } from 'drizzle-orm';
import type { AuthenticatedSession } from '../auth/session.ts';
import type { DbHandle } from '../db/connection.ts';
import { accounts, users } from '../db/schema.ts';

export class NoManagedAccountError extends Error {
  constructor() {
    super('No child account exists yet.');
    this.name = 'NoManagedAccountError';
  }
}

export function resolveManagedAccountId(db: DbHandle, session: AuthenticatedSession): number {
  if (session.role === 'child') {
    const row = db.db
      .select({ id: accounts.id })
      .from(accounts)
      .where(eq(accounts.childUserId, session.userId))
      .get();
    if (!row) throw new NoManagedAccountError();
    return row.id;
  }

  // Parent (or, in principle, system): Phase 0 has exactly one child, so
  // find the sole non-archived child's account.
  const row = db.db
    .select({ id: accounts.id })
    .from(accounts)
    .innerJoin(users, eq(accounts.childUserId, users.id))
    .where(and(eq(users.role, 'child'), isNull(users.archivedAt)))
    .get();
  if (!row) throw new NoManagedAccountError();
  return row.id;
}
