import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'src/tests/e2e',
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    viewport: { width: 390, height: 844 }
  }
});
