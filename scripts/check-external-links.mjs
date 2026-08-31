import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dist = resolve('dist');
const siteOrigin = new URL(process.env.PUBLIC_SITE_URL ?? 'https://nodens.dev').origin;

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const file = join(directory, entry);
    return statSync(file).isDirectory() ? walk(file) : [file];
  });
}

if (!existsSync(dist)) throw new Error('dist is missing; run npm run build first');

const links = new Set();
for (const file of walk(dist).filter((candidate) => candidate.endsWith('.html'))) {
  const html = readFileSync(file, 'utf8');
  for (const match of html.matchAll(/<a\b[^>]*\bhref=["'](https?:[^"']+)["']/gi)) {
    const url = new URL(match[1]);
    if (url.origin !== siteOrigin) links.add(url.href);
  }
}

const failures = [];
for (const url of links) {
  try {
    const response = await fetch(url, {
      headers: { 'user-agent': 'Nodens link checker (+https://nodens.dev)' },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) failures.push(url + ' returned ' + response.status);
    else console.log(response.status + ' ' + url);
  } catch (error) {
    failures.push(url + ' failed: ' + error.message);
  }
}

if (failures.length) throw new Error(failures.join('\n'));
console.log('Verified ' + links.size + ' external destinations.');
