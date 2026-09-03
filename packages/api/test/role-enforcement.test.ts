// The non-negotiable role-enforcement suite (data/edw-mvp/brief.md):
// every mutating route returns 403 for a valid child session, and the
// manifest is diffed against Fastify's own route registry so a new
// mutating route can't silently escape the check in either direction.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { isMutatingMethod, ROUTE_MANIFEST } from '../src/lib/route-manifest.ts';
import { loginAs, setupTestApp, type TestApp } from './helpers.ts';

function fillParams(url: string): string {
  return url.replace(/:[^/]+/g, '1');
}

function key(method: string, url: string): string {
  return `${method.toUpperCase()} ${url}`;
}

let ctx: TestApp;
let childCookie: string;

beforeAll(async () => {
  ctx = await setupTestApp();
  childCookie = await loginAs(ctx.app, ctx.childId);
});

afterAll(async () => {
  await ctx.teardown();
});

describe("route manifest vs. Fastify's live route registry", () => {
  // Fastify auto-registers a HEAD route for every GET - it's not a
  // distinct handler to classify, so it's excluded from both directions
  // of the diff below. Computed lazily (not at describe-body eval time,
  // before `ctx` exists) via this getter.
  const liveRoutes = () => ctx.app.routeRegistry.filter((r) => r.method !== 'HEAD');

  it('has no stale manifest entries (every entry corresponds to a real route)', () => {
    const live = new Set(liveRoutes().map((r) => key(r.method, r.url)));
    const stale = ROUTE_MANIFEST.filter((entry) => !live.has(key(entry.method, entry.url)));
    expect(
      stale,
      `Stale manifest entries with no matching live route: ${JSON.stringify(stale)}`,
    ).toEqual([]);
  });

  it('has no unclassified live routes (every registered route is in the manifest)', () => {
    const manifestKeys = new Set(ROUTE_MANIFEST.map((entry) => key(entry.method, entry.url)));
    const unclassified = liveRoutes().filter(
      (route) => !manifestKeys.has(key(route.method, route.url)),
    );
    expect(
      unclassified,
      `Routes registered but missing from ROUTE_MANIFEST: ${JSON.stringify(unclassified)}`,
    ).toEqual([]);
  });

  it('requires an explicit, reviewed reason for every mutating route not gated to parent', () => {
    const unexplained = ROUTE_MANIFEST.filter(
      (entry) =>
        isMutatingMethod(entry.method) &&
        entry.requiredRole !== 'parent' &&
        !entry.mutatingExceptionReason,
    );
    expect(unexplained).toEqual([]);
  });
});

describe('every parent-only mutating route 403s a valid child session', () => {
  const parentGatedMutatingRoutes = ROUTE_MANIFEST.filter(
    (entry) => isMutatingMethod(entry.method) && entry.requiredRole === 'parent',
  );

  it('the manifest actually contains parent-gated mutating routes to test', () => {
    // Guards against this whole describe block silently testing nothing
    // if the manifest were ever emptied out.
    expect(parentGatedMutatingRoutes.length).toBeGreaterThan(0);
  });

  for (const route of parentGatedMutatingRoutes) {
    it(`${route.method} ${route.url} -> 403 for a child session`, async () => {
      const response = await ctx.app.inject({
        method: route.method as 'POST' | 'PATCH' | 'PUT' | 'DELETE',
        url: fillParams(route.url),
        headers: { cookie: childCookie, 'content-type': 'application/json' },
        // Deliberately malformed/empty body: the role gate runs at
        // preValidation, one stage before schema validation, so it must
        // win regardless of body content.
        payload: {},
      });
      expect(response.statusCode).toBe(403);
    });
  }
});

describe('sanity: the gate does not just always-403', () => {
  it('a parent session can perform a parent-only mutating action', async () => {
    const parentCookie = await loginAs(ctx.app, ctx.parentId);
    const response = await ctx.app.inject({
      method: 'POST',
      url: '/api/money/actions',
      headers: { cookie: parentCookie, 'content-type': 'application/json' },
      payload: { type: 'deposit', amountCents: 500 },
    });
    expect(response.statusCode).toBe(201);
  });

  it('an unauthenticated request to a parent-only route gets 401, not 403', async () => {
    const response = await ctx.app.inject({
      method: 'POST',
      url: '/api/money/actions',
      payload: { type: 'deposit', amountCents: 500 },
    });
    expect(response.statusCode).toBe(401);
  });
});
