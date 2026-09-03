import { defineConfig } from 'drizzle-kit';

// Migrations are generated here but hand-reviewed/patched (STRICT tables,
// append-only triggers - see drizzle/0000_init.sql's header comment)
// before being committed, per data/edw-tech-research/report.md's "plain
// SQL migrations you can read and review" rationale for choosing Drizzle.
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
});
