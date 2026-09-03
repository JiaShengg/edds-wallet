import { mkdirSync } from 'node:fs';
import path from 'node:path';

/** Where the SQLite file lives. Overridable via `EDW_DB_PATH` (used by
 * tests to point at an isolated throwaway file per test run). Defaults to
 * `<repo root>/data/edds-wallet.db` - `*.db` is gitignored at the repo
 * root (see .gitignore), so this never gets committed. */
export function resolveDbPath(): string {
  const configured = process.env.EDW_DB_PATH;
  if (configured) return path.resolve(configured);
  // packages/api/src/db -> repo root is four levels up.
  const repoRoot = path.resolve(import.meta.dirname, '../../../..');
  return path.join(repoRoot, 'data', 'edds-wallet.db');
}

export function ensureDbDirectory(dbPath: string): void {
  mkdirSync(path.dirname(dbPath), { recursive: true });
}
