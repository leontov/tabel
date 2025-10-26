import { test, expect } from '@playwright/test';

test.describe('PWA offline flow', () => {
  test('loads landing screen', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page.getByText('PWA · Offline-first')).toBeVisible();
  });
});
