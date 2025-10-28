import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:4173',
    viewport: { width: 390, height: 844 }
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Pixel 7'] }
    }
  ]
});
