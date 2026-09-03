import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Edd's Wallet is a localhost-only local-first app (see
// data/edw-tech-research/report.md Section 2 and the MVP brief's captain
// decisions): the dev server binds to 127.0.0.1 only, matching the API's
// eventual bind address, so nothing on the home network can reach either.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    // Dev-only convenience: proxy /api to a separately-run backend so the
    // SPA can be developed/tested against a real `@edds-wallet/api`
    // process (e.g. a scratch worktree checked out from `fm/edw-backend`)
    // without the two needing to share a port yet. The unified single-
    // process `npm start` serve (SPA + API on one origin/port) is the
    // backend package's responsibility and is verified at final
    // integration on main - this proxy only exists for local dev/test.
    proxy: {
      '/api': {
        // Matches @edds-wallet/api's `npm run dev` default (EDW_API_PORT,
        // see packages/api/README.md) - override if the backend worktree
        // uses a different port.
        target: process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
});
