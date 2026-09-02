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
  },
});
