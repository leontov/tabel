import { test, expect } from '@playwright/test';

import { existsSync, mkdirSync } from 'node:fs';

const screenshotDir = 'artifacts';
if (!existsSync(screenshotDir)) {
  mkdirSync(screenshotDir, { recursive: true });
}

function screenshotPath(name: string) {
  return `${screenshotDir}/${name}.png`;
}

test('offline navigation and shift flow', async ({ page, context }) => {
  await page.goto('/home');
  await page.waitForLoadState('networkidle');

  await page.locator('select').first().selectOption({ index: 0 });
  await page.getByRole('button', { name: /start/i }).click();
  page.on('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: /stop/i }).click();

  await page.screenshot({ path: screenshotPath('home'), fullPage: true });

  await page.goto('/shifts');
  await expect(page.getByRole('table')).toBeVisible();
  await page.screenshot({ path: screenshotPath('shifts'), fullPage: true });

  await page.goto('/reports');
  await expect(page.getByRole('table').first()).toBeVisible();
  await page.screenshot({ path: screenshotPath('reports'), fullPage: true });

  await page.goto('/settings');
  await expect(page.getByLabel(/Язык|Language/)).toBeVisible();
  await page.screenshot({ path: screenshotPath('settings'), fullPage: true });

  await context.setOffline(true);
  await page.goto('/home');
  await expect(page.getByText(/offline/i)).toBeVisible();

  await page.goto('/reports');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /CSV/i }).first().click()
  ]);
  expect(download.suggestedFilename()).toContain('.csv');
});
