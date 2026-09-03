// `npm run dev` entry: the API runs as its own process/port alongside
// the Vite dev server (packages/web, port 5173) - see report Section 1
// ("Two dev processes ... started by one typed command") and the root
// package.json's `dev` script, which runs both via `concurrently`.
//
// Same-site (both `127.0.0.1`) but cross-port in dev, so the session
// cookie is sent (SameSite=Lax only restricts cross-*site* requests) but
// the browser still needs an explicit CORS allow for the fetch itself -
// hence `corsOrigins` here, and nowhere in src/start.ts (single origin
// in production, no CORS needed at all).
import { boot } from './boot.ts';
import { buildServer } from './server.ts';

const HOST = '127.0.0.1';
const PORT = Number(process.env.EDW_API_PORT ?? 3001);
const WEB_DEV_ORIGIN = process.env.EDW_WEB_DEV_ORIGIN ?? 'http://127.0.0.1:5173';

async function main() {
  boot();
  const app = await buildServer({ corsOrigins: [WEB_DEV_ORIGIN], logger: true });
  await app.listen({ host: HOST, port: PORT });
  app.log.info(`Edd's Wallet API (dev) listening on http://${HOST}:${PORT}`);
  app.log.info(`CORS allowed for ${WEB_DEV_ORIGIN}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
