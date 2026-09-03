import { defineConfig, devices } from '@playwright/test';

/**
 * E2E smoke test config. Requires a real `@edds-wallet/api` backend
 * already running and reachable at `VITE_API_PROXY_TARGET` (default
 * `http://127.0.0.1:4000`) - the dev server proxies `/api/*` to it, see
 * `vite.config.ts`. See `README.md` "End-to-end test" for how to run the
 * backend from a scratch worktree of `fm/edw-backend`.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
  },
  webServer: process.env.E2E_SKIP_WEBSERVER
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://127.0.0.1:5173',
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
      },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
