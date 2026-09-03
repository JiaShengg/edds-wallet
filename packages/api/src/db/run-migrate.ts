// Standalone CLI: run pending migrations without starting the server or
// seeding. `npm start`/`npm run dev` already do this automatically on
// boot (src/boot.ts) - this is for scripting/CI convenience only.
import { initDb } from './connection.ts';
import { runPendingMigrations } from './migrate.ts';

const { writeDb } = initDb();
runPendingMigrations(writeDb);
console.log('Migrations up to date.');
