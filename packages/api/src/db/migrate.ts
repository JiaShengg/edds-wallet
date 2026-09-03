import path from 'node:path';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import type { DbHandle } from './connection.ts';

const migrationsFolder = path.join(import.meta.dirname, '..', '..', 'drizzle');

/** Runs any pending migrations against `writeDb`. Called on every boot
 * (dev and `npm start` alike) before the server starts listening, per
 * data/edw-mvp/brief.md "Running it" - `npm start` "auto-runs pending
 * migrations before it listens". */
export function runPendingMigrations(writeDb: DbHandle): void {
  migrate(writeDb.db, { migrationsFolder });
}
