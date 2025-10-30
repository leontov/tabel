import { chromium, devices } from 'playwright';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

export async function runOfflineScenario(baseURL = 'http://127.0.0.1:4173', options = {}) {
  const { screenshotDir = 'artifacts' } = options;

  if (!existsSync(screenshotDir)) {
    mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices['Pixel 7'],
    baseURL
  });
  const page = await context.newPage();

  page.on('dialog', (dialog) => dialog.accept());

  const navigate = async (pathname) => {
    await page.goto(pathname, { waitUntil: 'networkidle' });
  };

  await navigate('/home');
  await page.locator('select').first().selectOption({ index: 0 });

  const startButton = page.getByRole('button', { name: /start/i });
  await startButton.click();
  await page.waitForTimeout(300);
  const stopButton = page.getByRole('button', { name: /stop/i });
  await stopButton.click();

  await page.screenshot({ path: path.join(screenshotDir, 'home.png'), fullPage: true });

  await navigate('/shifts');
  assert.equal(await page.getByRole('table').isVisible(), true, 'Shifts table should render');
  await page.screenshot({ path: path.join(screenshotDir, 'shifts.png'), fullPage: true });

  await navigate('/reports');
  assert.equal(await page.getByRole('table').first().isVisible(), true, 'Reports table should render');
  await page.screenshot({ path: path.join(screenshotDir, 'reports.png'), fullPage: true });

  await navigate('/settings');
  assert.equal(await page.getByLabel(/Язык|Language/).isVisible(), true, 'Settings form should render');
  await page.screenshot({ path: path.join(screenshotDir, 'settings.png'), fullPage: true });

  await context.setOffline(true);
  await navigate('/home');
  const offlineBanner = page.locator('text=/offline/i');
  assert.equal(await offlineBanner.isVisible(), true, 'Offline snackbar should be visible');

  await navigate('/reports');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /CSV/i }).first().click()
  ]);
  const filename = download.suggestedFilename();
  assert.ok(filename && filename.endsWith('.csv'), 'CSV export should trigger download');

  await browser.close();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runOfflineScenario().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
