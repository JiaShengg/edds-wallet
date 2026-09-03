// Shared boot sequence for both `npm run dev` and `npm start`: open the
// two connections, run any pending migrations, seed on first run, then
// run the catch-up-safe allowance scheduler once before the server
// starts listening (report Section 5 - "the app is only up when opened,
// not a 24/7 daemon").
import { initDb } from './db/connection.ts';
import { runPendingMigrations } from './db/migrate.ts';
import { seedIfEmpty } from './db/seed.ts';
import { runAllowanceScheduler } from './jobs/allowance-scheduler.ts';

export function boot(dbPath?: string): void {
  const { writeDb } = initDb(dbPath);
  runPendingMigrations(writeDb);
  seedIfEmpty(writeDb);
  runAllowanceScheduler(writeDb);
}
