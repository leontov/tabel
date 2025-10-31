import { spawn } from 'node:child_process';
import { once } from 'node:events';
import process from 'node:process';
import waitOn from 'wait-on';

import { runOfflineScenario } from '../tests/e2e/offline.mjs';

const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4173';
const previewArgs = ['run', 'preview', '--', '--host', '127.0.0.1', '--port', new URL(baseURL).port || '4173'];

async function main() {
  const preview = spawn('npm', previewArgs, {
    stdio: 'inherit',
    shell: false
  });

  const cleanExit = async () => {
    if (!preview.killed) {
      preview.kill('SIGTERM');
      try {
        await once(preview, 'exit');
      } catch (error) {
        console.warn('Preview process termination error:', error);
      }
    }
  };

  preview.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.error(`vite preview exited with code ${code}`);
      process.exitCode = code;
    }
  });

  try {
    await waitOn({
      resources: [baseURL],
      timeout: 60000,
      interval: 500,
      validateStatus: (status) => status >= 200 && status < 500
    });
    await runOfflineScenario(baseURL, { screenshotDir: 'tests/e2e/artifacts' });
  } catch (error) {
    console.error('E2E offline scenario failed:', error);
    process.exitCode = 1;
  } finally {
    await cleanExit();
  }
}

main();
