// Global session-resolution plugin. Registered once at the app root so
// its `onRequest` hook runs for every route, public or protected: it
// looks up the session cookie against `sessions`/`users` (via `readDb` -
// this is always a read) and sets `request.session`. The client never
// sends a role or account id the server trusts; only the opaque cookie
// (report Section 4, point 5).
import cookie from '@fastify/cookie';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { getReadDb } from '../db/connection.ts';
import { type AuthenticatedSession, resolveSession, SESSION_COOKIE_NAME } from './session.ts';

declare module 'fastify' {
  interface FastifyRequest {
    session: AuthenticatedSession | null;
  }
}

async function sessionPlugin(app: FastifyInstance): Promise<void> {
  await app.register(cookie);

  app.decorateRequest('session', null);

  app.addHook('onRequest', async (request: FastifyRequest) => {
    const token = request.cookies[SESSION_COOKIE_NAME];
    request.session = token ? resolveSession(getReadDb(), token) : null;
  });
}

export default fp(sessionPlugin, { name: 'edw-session-plugin' });

/** Use on any route (read or write) that requires *some* signed-in user,
 * regardless of role. Declared `async` (even though it never actually
 * awaits anything) so Fastify treats it unambiguously as a
 * promise-returning hook rather than the legacy `(request, reply, done)`
 * callback style - a plain sync 2-arg function is ambiguous to Fastify's
 * hook runner and, without calling `done`, never lets the request
 * proceed. */
export async function requireSession(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (!request.session) {
    reply.code(401).send({ error: 'unauthorized', message: 'Sign in required.' });
  }
}
