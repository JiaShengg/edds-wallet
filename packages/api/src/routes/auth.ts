// Mock auth's public surface (report Section 4). Only this file needs to
// change to add real auth later - every downstream role/session check
// (src/auth/plugin.ts, src/auth/parent-only.ts) stays the same.

import { loginRequestSchema } from '@edds-wallet/shared';
import { and, eq, isNull } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';
import { verifyPin } from '../auth/pin.ts';
import { requireSession } from '../auth/plugin.ts';
import { createSession, revokeSessionByToken, SESSION_COOKIE_NAME } from '../auth/session.ts';
import { getReadDb, getWriteDb } from '../db/connection.ts';
import { users } from '../db/schema.ts';

const SESSION_COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export const authRoutes: FastifyPluginAsync = async (app) => {
  // Public: the login screen's tappable tiles need to know which
  // profiles exist and whether each needs a PIN pad, before any session
  // exists. Never returns the PIN hash/salt.
  app.get('/api/auth/profiles', async () => {
    const readDb = getReadDb();
    const rows = readDb.db
      .select({
        id: users.id,
        role: users.role,
        displayName: users.displayName,
        pinHash: users.pinHash,
      })
      .from(users)
      .where(and(isNull(users.archivedAt)))
      .all()
      .filter((row) => row.role !== 'system');
    return {
      profiles: rows.map((row) => ({
        id: row.id,
        role: row.role,
        displayName: row.displayName,
        hasPin: row.pinHash !== null,
      })),
    };
  });

  app.post('/api/auth/login', async (request, reply) => {
    const parsed = loginRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.code(400).send({ error: 'invalid_request', message: parsed.error.message });
      return;
    }

    const readDb = getReadDb();
    const user = readDb.db
      .select()
      .from(users)
      .where(and(eq(users.id, parsed.data.userId), isNull(users.archivedAt)))
      .get();

    if (!user || user.role === 'system') {
      reply.code(401).send({ error: 'invalid_credentials', message: 'Unknown profile.' });
      return;
    }

    if (user.pinHash && user.pinSalt) {
      const providedPin = parsed.data.pin;
      const pinOk =
        providedPin !== undefined &&
        verifyPin(providedPin, { hash: user.pinHash, salt: user.pinSalt });
      if (!pinOk) {
        reply.code(401).send({ error: 'invalid_credentials', message: 'Incorrect PIN.' });
        return;
      }
    }

    const writeDb = getWriteDb();
    const { token, expiresAt } = createSession(writeDb, user.id);
    reply.setCookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      expires: new Date(expiresAt),
      maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
    });
    return { user: { id: user.id, role: user.role, displayName: user.displayName } };
  });

  app.post('/api/auth/logout', { preHandler: requireSession }, async (request, reply) => {
    const token = request.cookies[SESSION_COOKIE_NAME];
    if (token) {
      revokeSessionByToken(getWriteDb(), token);
    }
    reply.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
    reply.code(204);
  });

  app.get('/api/auth/session', { preHandler: requireSession }, async (request) => {
    // biome-ignore lint/style/noNonNullAssertion: requireSession already 401s when null.
    const session = request.session!;
    return {
      user: { id: session.userId, role: session.role, displayName: session.displayName },
    };
  });
};
