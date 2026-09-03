// `npm start` entry: single process, single port, serves the built SPA +
// API, auto-runs pending migrations before listening
// (data/edw-mvp/brief.md "Running it"). Binds 127.0.0.1 only - this is a
// localhost-only local-first app, nothing on the home network can reach
// it (report Section 2, captain decision #4).

import { existsSync } from 'node:fs';
import path from 'node:path';
import { boot } from './boot.ts';
import { buildServer } from './server.ts';

const HOST = '127.0.0.1';
const PORT = Number(process.env.PORT ?? 4000);

async function main() {
  boot();

  const staticDir = path.join(import.meta.dirname, '..', '..', 'web', 'dist');
  if (!existsSync(staticDir)) {
    throw new Error(
      `Built SPA not found at ${staticDir}. Run "npm run build" first (builds ` +
        '@edds-wallet/web to packages/web/dist).',
    );
  }

  const app = await buildServer({ staticDir, logger: true });
  await app.listen({ host: HOST, port: PORT });
  app.log.info(`Edd's Wallet listening on http://${HOST}:${PORT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
