// Read routes reachable by *both* roles. Every handler here uses
// `readDb` only (the physical half of the read-only-child-mode gate -
// report Section 2) and scopes every query by
// `resolveManagedAccountId(session)`, never a client-supplied id.

import { transactionsQuerySchema } from '@edds-wallet/shared';
import { and, eq } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';
import { requireSession } from '../auth/plugin.ts';
import { getReadDb } from '../db/connection.ts';
import { allowanceRules, conceptUnlocks } from '../db/schema.ts';
import { resolveManagedAccountId } from '../lib/account-resolver.ts';
import { nextOccurrenceAfter } from '../lib/allowance-schedule.ts';
import { isConceptUnlocked } from '../lib/concepts.ts';
import {
  countAllowancePayouts,
  getDefaultSpendingPocket,
  getPocketBalanceCents,
  listCashEntries,
} from '../lib/ledger.ts';

const DEFAULT_TRANSACTIONS_LIMIT = 50;

export const accountRoutes: FastifyPluginAsync = async (app) => {
  app.get('/api/account/balance', { preHandler: requireSession }, async (request) => {
    const readDb = getReadDb();
    // biome-ignore lint/style/noNonNullAssertion: requireSession already 401s when null.
    const accountId = resolveManagedAccountId(readDb, request.session!);
    const pocket = getDefaultSpendingPocket(readDb, accountId);
    const balanceCents = getPocketBalanceCents(readDb, pocket.id);
    return { pocketId: pocket.id, balanceCents, currencyLabel: 'USD' };
  });

  app.get('/api/account/transactions', { preHandler: requireSession }, async (request, reply) => {
    const parsedQuery = transactionsQuerySchema.safeParse(request.query);
    if (!parsedQuery.success) {
      reply.code(400).send({ error: 'invalid_request', message: parsedQuery.error.message });
      return;
    }
    const readDb = getReadDb();
    // biome-ignore lint/style/noNonNullAssertion: requireSession already 401s when null.
    const accountId = resolveManagedAccountId(readDb, request.session!);
    const pocket = getDefaultSpendingPocket(readDb, accountId);
    const limit = parsedQuery.data.limit ?? DEFAULT_TRANSACTIONS_LIMIT;
    const entries = listCashEntries(readDb, pocket.id, {
      limit,
      beforeId: parsedQuery.data.before,
    });
    const nextCursor = entries.length === limit ? (entries.at(-1)?.id ?? null) : null;
    return {
      entries: entries.map((entry) => ({
        id: entry.id,
        amountCents: entry.amountCents,
        entryType: entry.entryType,
        memo: entry.memo,
        createdAt: entry.createdAt,
        balanceAfterCents: entry.balanceAfterCents,
      })),
      nextCursor,
    };
  });

  app.get('/api/account/allowance/next', { preHandler: requireSession }, async (request) => {
    const readDb = getReadDb();
    // biome-ignore lint/style/noNonNullAssertion: requireSession already 401s when null.
    const session = request.session!;
    const accountId = resolveManagedAccountId(readDb, session);

    if (!isConceptUnlocked(readDb, accountId, 'allowance')) {
      return { nextAllowance: null };
    }

    const rule = readDb.db
      .select()
      .from(allowanceRules)
      .where(and(eq(allowanceRules.accountId, accountId), eq(allowanceRules.active, 1)))
      .get();
    if (!rule) return { nextAllowance: null };

    const paidCount = countAllowancePayouts(readDb, rule.id);
    const nextOccurrenceAt = nextOccurrenceAfter(rule.anchorDate, rule.frequency, paidCount);
    return {
      nextAllowance: {
        nextOccurrenceAt: nextOccurrenceAt.toISOString(),
        amountCents: rule.amountCents,
      },
    };
  });

  app.get('/api/account/concept-unlocks', { preHandler: requireSession }, async (request) => {
    const readDb = getReadDb();
    // biome-ignore lint/style/noNonNullAssertion: requireSession already 401s when null.
    const accountId = resolveManagedAccountId(readDb, request.session!);
    const rows = readDb.db
      .select({ conceptKey: conceptUnlocks.conceptKey, unlockedAt: conceptUnlocks.unlockedAt })
      .from(conceptUnlocks)
      .where(eq(conceptUnlocks.accountId, accountId))
      .all();
    return { unlocks: rows };
  });
};
