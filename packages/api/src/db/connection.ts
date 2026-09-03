// The physical half of the two-independent-ways read-only enforcement
// (data/edw-mvp/brief.md "Non-negotiable correctness requirements";
// data/edw-tech-research/report.md Section 2). `writeDb` and `readDb`
// point at the same SQLite file, but `readDb`'s underlying connection is
// opened with `{ readonly: true }` - a write attempted through it is
// rejected by SQLite itself, not by an `if` statement.
//
// `writeDb` must only be imported by mutating route handlers (registered
// inside the `parentOnly` plugin - src/auth/parent-only.ts) and by the
// allowance scheduler job (src/jobs/allowance-scheduler.ts). Every other
// module - in particular anything reachable by a child session - must use
// `readDb`.
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { ensureDbDirectory, resolveDbPath } from './paths.ts';
import * as schema from './schema.ts';

export interface DbHandle {
  raw: Database.Database;
  db: ReturnType<typeof drizzle<typeof schema>>;
}

let writeHandle: DbHandle | undefined;
let readHandle: DbHandle | undefined;

function openWriteConnection(dbPath: string): DbHandle {
  const raw = new Database(dbPath);
  raw.pragma('journal_mode = WAL');
  raw.pragma('foreign_keys = ON');
  return { raw, db: drizzle(raw, { schema }) };
}

function openReadConnection(dbPath: string): DbHandle {
  const raw = new Database(dbPath, { readonly: true });
  raw.pragma('foreign_keys = ON');
  return { raw, db: drizzle(raw, { schema }) };
}

/** Idempotent: safe to call multiple times (e.g. once per test file). */
export function initDb(dbPath: string = resolveDbPath()): { writeDb: DbHandle; readDb: DbHandle } {
  if (!writeHandle || !readHandle) {
    ensureDbDirectory(dbPath);
    writeHandle = openWriteConnection(dbPath);
    readHandle = openReadConnection(dbPath);
  }
  return { writeDb: writeHandle, readDb: readHandle };
}

export function getWriteDb(): DbHandle {
  if (!writeHandle) throw new Error('initDb() must be called before getWriteDb()');
  return writeHandle;
}

export function getReadDb(): DbHandle {
  if (!readHandle) throw new Error('initDb() must be called before getReadDb()');
  return readHandle;
}

export function closeDb(): void {
  writeHandle?.raw.close();
  readHandle?.raw.close();
  writeHandle = undefined;
  readHandle = undefined;
}
