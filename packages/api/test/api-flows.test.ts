// Integration coverage for the flow the brief cares about end to end
// (parent deposits -> child sees it, read-only, correct balance) plus
// allowance rule create/edit/pause/resume and the concept-unlock wiring.
// The actual cross-stack Playwright smoke test is the frontend worker's
// to wire, but this proves the API side of that contract on its own.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { loginAs, setupTestApp, type TestApp } from './helpers.ts';

let ctx: TestApp;
let parentCookie: string;
let childCookie: string;

beforeAll(async () => {
  ctx = await setupTestApp();
  parentCookie = await loginAs(ctx.app, ctx.parentId);
  childCookie = await loginAs(ctx.app, ctx.childId);
});

afterAll(async () => {
  await ctx.teardown();
});

describe('parent deposit -> child sees it read-only with the correct balance', () => {
  it('starts at a zero balance', async () => {
    const res = await ctx.app.inject({
      method: 'GET',
      url: '/api/account/balance',
      headers: { cookie: childCookie },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().balanceCents).toBe(0);
  });

  it('parent deposits $12.34', async () => {
    const res = await ctx.app.inject({
      method: 'POST',
      url: '/api/money/actions',
      headers: { cookie: parentCookie, 'content-type': 'application/json' },
      payload: { type: 'deposit', amountCents: 1234, memo: 'Birthday money' },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().balanceCents).toBe(1234);
  });

  it('child sees the updated balance', async () => {
    const res = await ctx.app.inject({
      method: 'GET',
      url: '/api/account/balance',
      headers: { cookie: childCookie },
    });
    expect(res.json().balanceCents).toBe(1234);
  });

  it("child sees the deposit in their transaction history, but can't mutate it", async () => {
    const history = await ctx.app.inject({
      method: 'GET',
      url: '/api/account/transactions',
      headers: { cookie: childCookie },
    });
    const { entries } = history.json() as {
      entries: Array<{ entryType: string; amountCents: number; memo: string | null }>;
    };
    expect(entries[0]).toMatchObject({
      entryType: 'deposit',
      amountCents: 1234,
      memo: 'Birthday money',
    });

    const mutateAttempt = await ctx.app.inject({
      method: 'POST',
      url: '/api/money/actions',
      headers: { cookie: childCookie, 'content-type': 'application/json' },
      payload: { type: 'withdrawal', amountCents: 100 },
    });
    expect(mutateAttempt.statusCode).toBe(403);
  });

  it('parent can withdraw, child balance reflects it, overdraft is rejected', async () => {
    const withdraw = await ctx.app.inject({
      method: 'POST',
      url: '/api/money/actions',
      headers: { cookie: parentCookie, 'content-type': 'application/json' },
      payload: { type: 'withdrawal', amountCents: 34 },
    });
    expect(withdraw.statusCode).toBe(201);
    expect(withdraw.json().balanceCents).toBe(1200);

    const overdraft = await ctx.app.inject({
      method: 'POST',
      url: '/api/money/actions',
      headers: { cookie: parentCookie, 'content-type': 'application/json' },
      payload: { type: 'withdrawal', amountCents: 999_999 },
    });
    expect(overdraft.statusCode).toBe(400);
  });
});

describe('allowance rules: create, next-occurrence banner, pause/resume', () => {
  it('allowance concept starts locked and the banner is null', async () => {
    const unlocks = await ctx.app.inject({
      method: 'GET',
      url: '/api/account/concept-unlocks',
      headers: { cookie: childCookie },
    });
    const allowance = (
      unlocks.json().unlocks as Array<{ conceptKey: string; unlockedAt: string | null }>
    ).find((u) => u.conceptKey === 'allowance');
    expect(allowance?.unlockedAt ?? null).toBeNull();

    const next = await ctx.app.inject({
      method: 'GET',
      url: '/api/account/allowance/next',
      headers: { cookie: childCookie },
    });
    expect(next.json().nextAllowance).toBeNull();
  });

  let ruleId: number;

  it('parent creates a weekly rule anchored today; it unlocks the concept', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const create = await ctx.app.inject({
      method: 'POST',
      url: '/api/account/allowance-rules',
      headers: { cookie: parentCookie, 'content-type': 'application/json' },
      payload: { amountCents: 500, frequency: 'weekly', anchorDate: today },
    });
    expect(create.statusCode).toBe(201);
    ruleId = create.json().rule.id;

    const unlocks = await ctx.app.inject({
      method: 'GET',
      url: '/api/account/concept-unlocks',
      headers: { cookie: childCookie },
    });
    const allowance = (
      unlocks.json().unlocks as Array<{ conceptKey: string; unlockedAt: string | null }>
    ).find((u) => u.conceptKey === 'allowance');
    expect(allowance?.unlockedAt).not.toBeNull();
  });

  it("child sees the next allowance banner, and can't create rules themselves", async () => {
    const next = await ctx.app.inject({
      method: 'GET',
      url: '/api/account/allowance/next',
      headers: { cookie: childCookie },
    });
    expect(next.json().nextAllowance).toMatchObject({ amountCents: 500 });

    const forbidden = await ctx.app.inject({
      method: 'POST',
      url: '/api/account/allowance-rules',
      headers: { cookie: childCookie, 'content-type': 'application/json' },
      payload: { amountCents: 999, frequency: 'weekly', anchorDate: '2026-01-01' },
    });
    expect(forbidden.statusCode).toBe(403);
  });

  it('parent can pause and resume the rule as a single-tap toggle', async () => {
    const pause = await ctx.app.inject({
      method: 'POST',
      url: `/api/account/allowance-rules/${ruleId}/pause`,
      headers: { cookie: parentCookie },
    });
    expect(pause.statusCode).toBe(200);
    expect(pause.json().rule.active).toBe(false);

    const resume = await ctx.app.inject({
      method: 'POST',
      url: `/api/account/allowance-rules/${ruleId}/resume`,
      headers: { cookie: parentCookie },
    });
    expect(resume.statusCode).toBe(200);
    expect(resume.json().rule.active).toBe(true);
  });

  it('parent can edit the amount', async () => {
    const edit = await ctx.app.inject({
      method: 'PATCH',
      url: `/api/account/allowance-rules/${ruleId}`,
      headers: { cookie: parentCookie, 'content-type': 'application/json' },
      payload: { amountCents: 750 },
    });
    expect(edit.statusCode).toBe(200);
    expect(edit.json().rule.amountCents).toBe(750);
  });
});

describe('switch user', () => {
  it('logout revokes the session for either role', async () => {
    const freshChildCookie = await loginAs(ctx.app, ctx.childId);
    const logout = await ctx.app.inject({
      method: 'POST',
      url: '/api/auth/logout',
      headers: { cookie: freshChildCookie },
    });
    expect(logout.statusCode).toBe(204);

    const afterLogout = await ctx.app.inject({
      method: 'GET',
      url: '/api/account/balance',
      headers: { cookie: freshChildCookie },
    });
    expect(afterLogout.statusCode).toBe(401);
  });
});
