import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: { baseURL: process.env.BASE_URL || 'http://localhost:3101', trace: 'retain-on-failure' },
  webServer: process.env.BASE_URL ? undefined : {
    command: 'node --require ./e2e/mock-services.cjs ./node_modules/next/dist/bin/next start --port 3101',
    url: 'http://localhost:3101',
    reuseExistingServer: false,
    env: { NEXT_BUILD_DIR: '.next-e2e', GITHUB_TOKEN: '', SUPABASE_SERVICE_ROLE_KEY: '', CRON_SECRET: 'local-e2e-secret' },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
