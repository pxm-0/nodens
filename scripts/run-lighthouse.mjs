import { existsSync, readFileSync, rmSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const origin = 'http://127.0.0.1:4321';
const reportPath = resolve('.lighthouse-report.json');
const preview = spawn(process.execPath, ['scripts/serve-dist.mjs'], {
  stdio: 'inherit',
});

async function waitForPreview() {
  const deadline = Date.now() + 30000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(origin + '/', { signal: AbortSignal.timeout(1000) });
      if (response.ok) return;
    } catch {
      // The preview server is still starting.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 250));
  }

  throw new Error('Astro preview did not start within 30 seconds');
}

try {
  await waitForPreview();

  const lighthouseCli = resolve('node_modules/lighthouse/cli/index.js');
  if (!existsSync(lighthouseCli)) throw new Error('Lighthouse CLI is not installed');

  const result = spawnSync(process.execPath, [
    lighthouseCli,
    origin + '/',
    '--only-categories=performance,accessibility,best-practices,seo',
    '--output=json',
    '--output-path=' + reportPath,
    '--chrome-flags=--headless=new --no-sandbox',
  ], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error('Lighthouse did not complete');

  const report = JSON.parse(readFileSync(reportPath, 'utf8'));
  const thresholds = {
    performance: 0.9,
    accessibility: 0.95,
    'best-practices': 0.95,
    seo: 0.95,
  };
  const failures = [];

  for (const [category, minimum] of Object.entries(thresholds)) {
    const score = report.categories[category]?.score ?? 0;
    console.log(category + '=' + Math.round(score * 100));
    if (score < minimum) failures.push(category + ' score ' + score + ' is below ' + minimum);
  }

  if (failures.length) throw new Error(failures.join('\n'));
} finally {
  preview.kill('SIGTERM');
  rmSync(reportPath, { force: true });
}
