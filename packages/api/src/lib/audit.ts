// Parent actions not already implied by a ledger row (report Section 3):
// rule edits/pauses, concept unlocks. Deposits/withdrawals/payouts are
// already self-documenting via cash_entries and don't need a separate
// audit row.
import type { DbHandle } from '../db/connection.ts';
import { auditLog } from '../db/schema.ts';

export interface AuditEntryInput {
  actorUserId: number;
  action: string;
  entityType: string;
  entityId: number;
  detail?: unknown;
}

export function recordAudit(writeDb: DbHandle, input: AuditEntryInput): void {
  writeDb.db
    .insert(auditLog)
    .values({
      actorUserId: input.actorUserId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      detailJson: input.detail !== undefined ? JSON.stringify(input.detail) : null,
      createdAt: new Date().toISOString(),
    })
    .run();
}
