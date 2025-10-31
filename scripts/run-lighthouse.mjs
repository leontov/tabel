import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadConfig() {
  const configPath = path.join(__dirname, '..', 'lighthouserc.json');
  const raw = await readFile(configPath, 'utf8');
  return JSON.parse(raw);
}

function parseAssertions(assertions = {}) {
  return Object.entries(assertions)
    .filter(([key]) => key.startsWith('categories:'))
    .map(([key, value]) => {
      const [, category] = key.split(':');
      if (Array.isArray(value)) {
        const [severity, options] = value;
        return { category, severity, minScore: options?.minScore ?? 0 };
      }
      return { category, severity: 'error', minScore: value?.minScore ?? 0 };
    });
}

async function run() {
  const config = await loadConfig();
  const url = config?.ci?.collect?.url?.[0] ?? 'http://localhost:4173';
  const outputDir = path.join(__dirname, '..', config?.ci?.upload?.outputDir ?? '.lighthouse');
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'] });

  try {
    const runnerResult = await lighthouse(url, {
      port: chrome.port,
      output: 'json',
      logLevel: 'silent'
    });

    await mkdir(outputDir, { recursive: true });
    const reportPath = path.join(outputDir, 'lhr.json');
    const report = Array.isArray(runnerResult.report) ? runnerResult.report[0] : runnerResult.report;
    await writeFile(reportPath, report, 'utf8');
    console.log(`Lighthouse report saved to ${reportPath}`);

    const checks = parseAssertions(config?.ci?.assert?.assertions);
    let hasError = false;
    for (const check of checks) {
      const categoryScore = runnerResult.lhr.categories[check.category]?.score ?? 0;
      const readableScore = Number(categoryScore).toFixed(2);
      if (categoryScore < check.minScore) {
        const message = `Category ${check.category} score ${readableScore} below required ${check.minScore}`;
        if (check.severity === 'error') {
          console.error(message);
          hasError = true;
        } else {
          console.warn(message);
        }
      } else {
        console.log(`Category ${check.category} score OK: ${readableScore}`);
      }
    }

    if (hasError) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('Lighthouse audit failed', error);
    process.exitCode = 1;
  } finally {
    await chrome.kill();
  }
}

await run();
