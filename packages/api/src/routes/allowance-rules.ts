// Allowance rule create/edit/pause (report Section 5/6). MUST only ever
// be registered inside `parentOnlyRoutes` - see src/routes/money.ts's
// header comment for why (this file also imports `writeDb`).

import { allowanceRuleCreateSchema, allowanceRuleUpdateSchema } from '@edds-wallet/shared';
import { and, eq } from 'drizzle-orm';
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { getWriteDb } from '../db/connection.ts';
import { allowanceRules } from '../db/schema.ts';
import { runAllowanceScheduler } from '../jobs/allowance-scheduler.ts';
import { resolveManagedAccountId } from '../lib/account-resolver.ts';
import { occurrenceDate, toDateOnly } from '../lib/allowance-schedule.ts';
import { recordAudit } from '../lib/audit.ts';
import { unlockConcept } from '../lib/concepts.ts';
import { getDefaultSpendingPocket } from '../lib/ledger.ts';

function serializeRule(rule: typeof allowanceRules.$inferSelect) {
  return {
    id: rule.id,
    amountCents: rule.amountCents,
    frequency: rule.frequency,
    anchorDate: rule.anchorDate,
    active: rule.active === 1,
    memo: rule.memo,
    createdAt: rule.createdAt,
    updatedAt: rule.updatedAt,
  };
}

export const allowanceRuleRoutes: FastifyPluginAsync = async (app) => {
  app.get('/api/account/allowance-rules', async (request) => {
    const writeDb = getWriteDb();
    // biome-ignore lint/style/noNonNullAssertion: parentOnlyRoutes already 401/403s otherwise.
    const accountId = resolveManagedAccountId(writeDb, request.session!);
    const rules = writeDb.db
      .select()
      .from(allowanceRules)
      .where(eq(allowanceRules.accountId, accountId))
      .all();
    return { rules: rules.map(serializeRule) };
  });

  app.post('/api/account/allowance-rules', async (request, reply) => {
    const parsed = allowanceRuleCreateSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.code(400).send({ error: 'invalid_request', message: parsed.error.message });
      return;
    }

    const writeDb = getWriteDb();
    // biome-ignore lint/style/noNonNullAssertion: parentOnlyRoutes already 401/403s otherwise.
    const session = request.session!;
    const accountId = resolveManagedAccountId(writeDb, session);
    const pocket = getDefaultSpendingPocket(writeDb, accountId);
    const now = new Date().toISOString();

    const rule = writeDb.db
      .insert(allowanceRules)
      .values({
        accountId,
        pocketId: pocket.id,
        amountCents: parsed.data.amountCents,
        frequency: parsed.data.frequency,
        anchorDate: parsed.data.anchorDate,
        memo: parsed.data.memo,
        active: 1,
        createdByUserId: session.userId,
        createdAt: now,
        updatedAt: now,
      })
      .returning()
      .get();

    // Allowance is unlocked automatically the moment a rule is created
    // (report Section 5, row 2 - mirrors how savings unlocks on first
    // savings pocket).
    unlockConcept(writeDb, accountId, 'allowance', session.userId);
    recordAudit(writeDb, {
      actorUserId: session.userId,
      action: 'allowance_rule.create',
      entityType: 'allowance_rule',
      entityId: rule.id,
    });
    // Pays out immediately if the chosen anchor date is already in the
    // past, rather than waiting for the next boot.
    runAllowanceScheduler(writeDb);

    reply.code(201);
    return { rule: serializeRule(rule) };
  });

  app.patch('/api/account/allowance-rules/:id', async (request, reply) => {
    const params = request.params as { id: string };
    const ruleId = Number(params.id);
    if (!Number.isInteger(ruleId)) {
      reply.code(400).send({ error: 'invalid_request', message: 'Invalid rule id.' });
      return;
    }
    const parsed = allowanceRuleUpdateSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.code(400).send({ error: 'invalid_request', message: parsed.error.message });
      return;
    }

    const writeDb = getWriteDb();
    // biome-ignore lint/style/noNonNullAssertion: parentOnlyRoutes already 401/403s otherwise.
    const session = request.session!;
    const accountId = resolveManagedAccountId(writeDb, session);
    const existing = writeDb.db
      .select()
      .from(allowanceRules)
      .where(and(eq(allowanceRules.id, ruleId), eq(allowanceRules.accountId, accountId)))
      .get();
    if (!existing) {
      reply.code(404).send({ error: 'not_found', message: 'No such allowance rule.' });
      return;
    }

    const updated = writeDb.db
      .update(allowanceRules)
      .set({
        amountCents: parsed.data.amountCents ?? existing.amountCents,
        frequency: parsed.data.frequency ?? existing.frequency,
        anchorDate: parsed.data.anchorDate ?? existing.anchorDate,
        memo: parsed.data.memo ?? existing.memo,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(allowanceRules.id, ruleId))
      .returning()
      .get();

    recordAudit(writeDb, {
      actorUserId: session.userId,
      action: 'allowance_rule.update',
      entityType: 'allowance_rule',
      entityId: ruleId,
      detail: parsed.data,
    });
    runAllowanceScheduler(writeDb);

    return { rule: serializeRule(updated) };
  });

  app.post('/api/account/allowance-rules/:id/pause', async (request, reply) => {
    const result = await setActive(request, reply, false);
    if (result) return { rule: serializeRule(result) };
  });

  app.post('/api/account/allowance-rules/:id/resume', async (request, reply) => {
    const result = await setActive(request, reply, true);
    if (result) return { rule: serializeRule(result) };
  });

  /** Pause/resume as a single-tap toggle, no confirmation
   * (data/edw-wireframes/report.md UX decision #7).
   *
   * Resuming intentionally does NOT retroactively pay out occurrences
   * that fell inside the paused window (that would silently hand out a
   * lump-sum backlog the parent never intended), and does NOT trigger an
   * immediate payout on the resume moment itself. It re-anchors the rule
   * one full period ahead of "now", so the schedule restarts cleanly:
   * the next payout is exactly one period after resuming. This is a
   * deliberate Phase 0 simplification (no dedicated occurrence-cursor
   * column) - see packages/api/API.md. */
  async function setActive(request: FastifyRequest, reply: FastifyReply, active: boolean) {
    const params = request.params as { id: string };
    const ruleId = Number(params.id);
    if (!Number.isInteger(ruleId)) {
      reply.code(400).send({ error: 'invalid_request', message: 'Invalid rule id.' });
      return undefined;
    }

    const writeDb = getWriteDb();
    // biome-ignore lint/style/noNonNullAssertion: parentOnlyRoutes already 401/403s otherwise.
    const session = request.session!;
    const accountId = resolveManagedAccountId(writeDb, session);
    const existing = writeDb.db
      .select()
      .from(allowanceRules)
      .where(and(eq(allowanceRules.id, ruleId), eq(allowanceRules.accountId, accountId)))
      .get();
    if (!existing) {
      reply.code(404).send({ error: 'not_found', message: 'No such allowance rule.' });
      return undefined;
    }

    const now = new Date().toISOString();
    const nextAnchorDate = active
      ? toDateOnly(occurrenceDate(toDateOnly(new Date()), existing.frequency, 1))
      : existing.anchorDate;

    const updated = writeDb.db
      .update(allowanceRules)
      .set({ active: active ? 1 : 0, anchorDate: nextAnchorDate, updatedAt: now })
      .where(eq(allowanceRules.id, ruleId))
      .returning()
      .get();

    recordAudit(writeDb, {
      actorUserId: session.userId,
      action: active ? 'allowance_rule.resume' : 'allowance_rule.pause',
      entityType: 'allowance_rule',
      entityId: ruleId,
    });

    return updated;
  }
};
