// The structural half of the two-independent-ways read-only enforcement
// (data/edw-mvp/brief.md; report Section 2). This is a deliberately
// *un-encapsulated-by-`fastify-plugin`* plugin: Fastify's encapsulation
// model means a hook registered inside a plain `register()`ed plugin only
// applies to routes registered inside that same plugin instance
// (fastify.dev/docs/latest/Reference/Encapsulation/). Every mutating
// route in this API is registered *inside* `parentOnlyRoutes` (see
// src/routes/*.ts) - there is no route that both mutates and lives
// outside this gate; that would have to be a visible, deliberate mistake
// in one file (which routes/*.ts registers a POST/PUT/PATCH/DELETE
// outside `parentOnlyRoutes`?), not a missed `if` three files away.
//
// The check runs at `preValidation`, one stage *before* Fastify's own
// request-body schema validation, so a child session gets 403 even when
// the request body is missing or malformed - the role gate always wins
// over a validation error.
import type { FastifyInstance, FastifyPluginAsync } from 'fastify';

export const parentOnlyRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.addHook('preValidation', async (request, reply) => {
    if (!request.session) {
      reply.code(401).send({ error: 'unauthorized', message: 'Sign in required.' });
      return;
    }
    if (request.session.role !== 'parent') {
      reply.code(403).send({ error: 'forbidden', message: 'Parent mode only.' });
    }
  });
};
