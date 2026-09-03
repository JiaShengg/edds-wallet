// Concept gate helpers (report Section 2/5) - a pedagogy device, not a
// security boundary. Filters what a *child's* read routes return; a
// parent's routes never filter by this.

import type { ConceptKey } from '@edds-wallet/shared';
import { and, eq } from 'drizzle-orm';
import type { DbHandle } from '../db/connection.ts';
import { conceptUnlocks } from '../db/schema.ts';

export function isConceptUnlocked(
  db: DbHandle,
  accountId: number,
  conceptKey: ConceptKey,
): boolean {
  const row = db.db
    .select({ unlockedAt: conceptUnlocks.unlockedAt })
    .from(conceptUnlocks)
    .where(and(eq(conceptUnlocks.accountId, accountId), eq(conceptUnlocks.conceptKey, conceptKey)))
    .get();
  return row?.unlockedAt != null;
}

/** Upsert-unlock: a no-op if already unlocked, so it's safe to call every
 * time an action that implies a concept happens (e.g. every allowance
 * rule creation), per report Section 5's "unlocked automatically" rows. */
export function unlockConcept(
  writeDb: DbHandle,
  accountId: number,
  conceptKey: ConceptKey,
  unlockedByUserId: number | null,
): void {
  const existing = writeDb.db
    .select({ id: conceptUnlocks.id, unlockedAt: conceptUnlocks.unlockedAt })
    .from(conceptUnlocks)
    .where(and(eq(conceptUnlocks.accountId, accountId), eq(conceptUnlocks.conceptKey, conceptKey)))
    .get();

  if (existing?.unlockedAt) return;

  const now = new Date().toISOString();
  if (existing) {
    writeDb.db
      .update(conceptUnlocks)
      .set({ unlockedAt: now, unlockedByUserId })
      .where(eq(conceptUnlocks.id, existing.id))
      .run();
  } else {
    writeDb.db
      .insert(conceptUnlocks)
      .values({ accountId, conceptKey, unlockedAt: now, unlockedByUserId })
      .run();
  }
}

export function lockConcept(writeDb: DbHandle, accountId: number, conceptKey: ConceptKey): void {
  const existing = writeDb.db
    .select({ id: conceptUnlocks.id })
    .from(conceptUnlocks)
    .where(and(eq(conceptUnlocks.accountId, accountId), eq(conceptUnlocks.conceptKey, conceptKey)))
    .get();
  if (existing) {
    writeDb.db
      .update(conceptUnlocks)
      .set({ unlockedAt: null, unlockedByUserId: null })
      .where(eq(conceptUnlocks.id, existing.id))
      .run();
  } else {
    writeDb.db.insert(conceptUnlocks).values({ accountId, conceptKey }).run();
  }
}
