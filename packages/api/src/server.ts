// Assembles the Fastify app: the global session plugin (applies to every
// route), the public auth routes, the shared read routes (both roles,
// `readDb` only), and the parent-only mutating routes (report Section 2).
//
// The `parentOnlyRoutes` composition below is the structural half of the
// read-only-child-mode gate: `parentOnlyGate` adds a `preValidation` hook
// directly to this one encapsulated child context, and every mutating
// route plugin is registered *inside that same context* (as its
// children), so they inherit the hook. A route registered anywhere else
// in this file never gets it - see
// tests/role-enforcement.test.ts, which diffs Fastify's own route
// registry against a maintained manifest to guarantee that stays true.
import cors from '@fastify/cors';
import staticFiles from '@fastify/static';
import fastify, { type FastifyInstance } from 'fastify';
import { parentOnlyRoutes } from './auth/parent-only.ts';
import sessionPlugin from './auth/plugin.ts';
import { accountRoutes } from './routes/account.ts';
import { allowanceRuleRoutes } from './routes/allowance-rules.ts';
import { authRoutes } from './routes/auth.ts';
import { moneyRoutes } from './routes/money.ts';

export interface BuildServerOptions {
  /** Absolute path to the built SPA's `dist/` directory. When set, the
   * server serves it at `/` and falls back to `index.html` for
   * client-side routes that aren't `/api/*` - the single-process
   * "npm start" mode (data/edw-mvp/brief.md "Running it"). Omitted in
   * dev (the frontend worker's Vite dev server serves the SPA on its own
   * port) and in tests. */
  staticDir?: string;
  /** Origins allowed to make credentialed cross-origin requests - only
   * needed in dev, where the Vite dev server and this API run on
   * different ports (still `127.0.0.1`, so same-site, but a different
   * origin). Never set in production: `npm start` is one origin, one
   * port, and CORS is unnecessary there. */
  corsOrigins?: string[];
  logger?: boolean;
}

export interface RegisteredRoute {
  method: string;
  url: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    /** Every route this app has registered, collected via the `onRoute`
     * hook - the "Fastify's own route registry" side of the
     * role-enforcement suite's manifest diff (report Section 2). */
    routeRegistry: RegisteredRoute[];
  }
}

export async function buildServer(options: BuildServerOptions = {}): Promise<FastifyInstance> {
  const app = fastify({ logger: options.logger ?? false });

  const routeRegistry: RegisteredRoute[] = [];
  app.decorate('routeRegistry', routeRegistry);
  app.addHook('onRoute', (routeOptions) => {
    const methods = Array.isArray(routeOptions.method)
      ? routeOptions.method
      : [routeOptions.method];
    for (const method of methods) {
      routeRegistry.push({ method, url: routeOptions.url });
    }
  });

  if (options.corsOrigins && options.corsOrigins.length > 0) {
    await app.register(cors, { origin: options.corsOrigins, credentials: true });
  }

  await app.register(sessionPlugin);
  await app.register(authRoutes);
  await app.register(accountRoutes);

  // Every mutating route lives inside this one encapsulated context.
  await app.register(async (parentScope) => {
    await parentOnlyRoutes(parentScope, {});
    await parentScope.register(moneyRoutes);
    await parentScope.register(allowanceRuleRoutes);
  });

  if (options.staticDir) {
    await app.register(staticFiles, { root: options.staticDir });
    app.setNotFoundHandler((request, reply) => {
      if (request.raw.url?.startsWith('/api/')) {
        reply.code(404).send({ error: 'not_found', message: 'No such API route.' });
        return;
      }
      reply.sendFile('index.html');
    });
  }

  return app;
}
