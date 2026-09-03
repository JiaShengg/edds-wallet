// Mock-auth session system (report Section 4): a real session system with
// a fake front door. Opaque random tokens, only a SHA-256 hash stored
// server-side, httpOnly cookie holds the raw token. Swapping in real auth
// later only touches src/routes/auth.ts's login handler - everything
// downstream (this module, the parentOnly gate, every route) is
// untouched.
import { createHash, randomBytes } from 'node:crypto';
import type { UserRole } from '@edds-wallet/shared';
import { eq } from 'drizzle-orm';
import type { DbHandle } from '../db/connection.ts';
import { sessions, users } from '../db/schema.ts';

const SESSION_COOKIE_NAME = 'edw_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days - a local trusted-device app.

export { SESSION_COOKIE_NAME };

export interface AuthenticatedSession {
  sessionId: number;
  userId: number;
  role: UserRole;
  displayName: string;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function nowIso(): string {
  return new Date().toISOString();
}

/** Creates a session row and returns the raw token to set as the cookie.
 * Only the token's hash is ever persisted. */
export function createSession(
  writeDb: DbHandle,
  userId: number,
): { token: string; expiresAt: string } {
  const token = randomBytes(32).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS).toISOString();
  writeDb.db
    .insert(sessions)
    .values({
      userId,
      tokenHash: hashToken(token),
      createdAt: now.toISOString(),
      expiresAt,
    })
    .run();
  return { token, expiresAt };
}

/** Looks up a session by its raw (cookie) token. Always a read - uses
 * `readDb`, since resolving "who is this request from" runs ahead of
 * every route, including ones a child session will reach. Returns null
 * for a missing, expired, or revoked session - the caller treats that as
 * "no session", never as an error to surface details about. */
export function resolveSession(readDb: DbHandle, token: string): AuthenticatedSession | null {
  const tokenHash = hashToken(token);
  const row = readDb.db
    .select({
      sessionId: sessions.id,
      expiresAt: sessions.expiresAt,
      revokedAt: sessions.revokedAt,
      userId: users.id,
      role: users.role,
      displayName: users.displayName,
      archivedAt: users.archivedAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.tokenHash, tokenHash))
    .get();

  if (!row) return null;
  if (row.revokedAt) return null;
  if (row.archivedAt) return null;
  if (row.expiresAt <= nowIso()) return null;

  return {
    sessionId: row.sessionId,
    userId: row.userId,
    role: row.role as UserRole,
    displayName: row.displayName,
  };
}

export function revokeSessionByToken(writeDb: DbHandle, token: string): void {
  const tokenHash = hashToken(token);
  writeDb.db
    .update(sessions)
    .set({ revokedAt: nowIso() })
    .where(eq(sessions.tokenHash, tokenHash))
    .run();
}
