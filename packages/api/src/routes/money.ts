// The single combined "add or remove money" action
// (data/edw-wireframes/report.md UX decision #3 - one control with a
// deposit/withdraw toggle on the client; still two distinct `entry_type`
// ledger rows server-side). MUST only ever be registered inside
// `parentOnlyRoutes` (src/server.ts) - this file imports `writeDb`, one
// of exactly two allowed importers (the other is
// src/jobs/allowance-scheduler.ts).

import { moneyActionRequestSchema } from '@edds-wallet/shared';
import type { FastifyPluginAsync } from 'fastify';
import { getWriteDb } from '../db/connection.ts';
import { resolveManagedAccountId } from '../lib/account-resolver.ts';
import {
  getDefaultSpendingPocket,
  getPocketBalanceCents,
  InsufficientBalanceError,
  insertCashEntry,
} from '../lib/ledger.ts';

export const moneyRoutes: FastifyPluginAsync = async (app) => {
  app.post('/api/money/actions', async (request, reply) => {
    const parsed = moneyActionRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.code(400).send({ error: 'invalid_request', message: parsed.error.message });
      return;
    }

    const writeDb = getWriteDb();
    // biome-ignore lint/style/noNonNullAssertion: parentOnlyRoutes already 401/403s otherwise.
    const session = request.session!;
    const accountId = resolveManagedAccountId(writeDb, session);
    const pocket = getDefaultSpendingPocket(writeDb, accountId);

    const signedAmountCents =
      parsed.data.type === 'deposit' ? parsed.data.amountCents : -parsed.data.amountCents;

    try {
      const entry = insertCashEntry(writeDb, {
        pocketId: pocket.id,
        amountCents: signedAmountCents,
        entryType: parsed.data.type,
        createdByUserId: session.userId,
        createdAt: new Date().toISOString(),
        memo: parsed.data.memo,
        sourceType: 'manual',
        disallowOverdraft: parsed.data.type === 'withdrawal',
      });
      reply.code(201);
      return {
        pocketId: pocket.id,
        balanceCents: entry.balanceAfterCents,
        entry: {
          id: entry.id,
          amountCents: entry.amountCents,
          entryType: entry.entryType,
          memo: entry.memo,
          createdAt: entry.createdAt,
          balanceAfterCents: entry.balanceAfterCents,
        },
      };
    } catch (error) {
      if (error instanceof InsufficientBalanceError) {
        reply.code(400).send({
          error: 'insufficient_balance',
          message: `Can't take out more than what's there (balance is ${getPocketBalanceCents(writeDb, pocket.id)} cents).`,
        });
        return;
      }
      throw error;
    }
  });
};
