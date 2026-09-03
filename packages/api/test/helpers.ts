import { randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { FastifyInstance } from 'fastify';
import { closeDb, initDb } from '../src/db/connection.ts';
import { runPendingMigrations } from '../src/db/migrate.ts';
import { seedIfEmpty } from '../src/db/seed.ts';
import { buildServer } from '../src/server.ts';

/** Asserts a query fixture was actually found, without a bare `!`
 * non-null assertion (which would silently hand `undefined` fields to
 * the next call instead of failing fast with a clear message). */
export function mustExist<T>(value: T | undefined | null, what: string): T {
  if (value === undefined || value === null) throw new Error(`Expected ${what} to exist.`);
  return value;
}

export interface TestApp {
  app: FastifyInstance;
  dbPath: string;
  parentId: number;
  childId: number;
  teardown: () => Promise<void>;
}

/** Boots a fresh, isolated SQLite file + Fastify app per test file - no
 * shared state between test files, and no dependency on prior test
 * ordering within one. */
export async function setupTestApp(): Promise<TestApp> {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'edw-test-'));
  const dbPath = path.join(dir, `${randomUUID()}.db`);

  const { writeDb } = initDb(dbPath);
  runPendingMigrations(writeDb);
  seedIfEmpty(writeDb);

  const app = await buildServer({});
  await app.ready();

  const profilesResponse = await app.inject({ method: 'GET', url: '/api/auth/profiles' });
  const { profiles } = profilesResponse.json() as {
    profiles: Array<{ id: number; role: string }>;
  };
  const parent = profiles.find((p) => p.role === 'parent');
  const child = profiles.find((p) => p.role === 'child');
  if (!parent || !child) throw new Error('Seed did not produce parent/child profiles.');

  return {
    app,
    dbPath,
    parentId: parent.id,
    childId: child.id,
    teardown: async () => {
      await app.close();
      closeDb();
      rmSync(dir, { recursive: true, force: true });
    },
  };
}

/** Logs in as the given user id (no PIN - the seeded test fixtures never
 * set one) and returns the `Cookie` header value to reuse on subsequent
 * `inject()` calls. */
export async function loginAs(app: FastifyInstance, userId: number): Promise<string> {
  const response = await app.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: { userId },
  });
  if (response.statusCode !== 200) {
    throw new Error(`Login failed for user ${userId}: ${response.statusCode} ${response.body}`);
  }
  const setCookie = response.cookies.find((c) => c.name === 'edw_session');
  if (!setCookie) throw new Error('Login did not set a session cookie.');
  return `${setCookie.name}=${setCookie.value}`;
}
