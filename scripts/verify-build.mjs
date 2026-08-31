import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

const dist = resolve('dist');
const siteOrigin = new URL(process.env.PUBLIC_SITE_URL ?? 'https://nodens.dev').origin;
const errors = [];

function fail(message) {
  errors.push(message);
}

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const file = join(directory, entry);
    return statSync(file).isDirectory() ? walk(file) : [file];
  });
}

function routeFor(file) {
  const filePath = relative(dist, file);
  if (filePath === 'index.html') return '/';
  if (filePath === '404.html') return '/404/';
  if (filePath.endsWith('/index.html')) return '/' + filePath.slice(0, -'index.html'.length);
  return '/' + filePath;
}

function fileForPathname(pathname) {
  const cleanPath = decodeURIComponent(pathname).replace(/^\/+/, '');
  if (!cleanPath) return join(dist, 'index.html');
  if (cleanPath === '404' || cleanPath === '404/') return join(dist, '404.html');
  if (extname(cleanPath)) return join(dist, cleanPath);
  return join(dist, cleanPath, 'index.html');
}

function escapeRegex(value) {
  return value.replace(/[.*+?^$()|[\]\\{}]/g, '\\$&');
}

function hasMeta(html, attribute, value) {
  return new RegExp('<meta\\b[^>]*\\b' + attribute + '="' + escapeRegex(value) + '"', 'i').test(html);
}

function checkReference(value, sourceRoute, sourceFile) {
  if (/^(?:data|javascript|mailto|tel):/i.test(value)) return;

  let url;
  try {
    url = new URL(value, new URL(sourceRoute, siteOrigin));
  } catch {
    fail(relative(dist, sourceFile) + ' has an invalid URL: ' + value);
    return;
  }
  if (url.origin !== siteOrigin) return;

  const target = fileForPathname(url.pathname);
  if (!existsSync(target)) {
    fail(relative(dist, sourceFile) + ' links to missing ' + url.pathname);
    return;
  }
  if (url.hash && extname(target) === '.html') {
    const fragment = decodeURIComponent(url.hash.slice(1));
    const targetHtml = readFileSync(target, 'utf8');
    if (!new RegExp('\\bid="' + escapeRegex(fragment) + '"').test(targetHtml)) {
      fail(relative(dist, sourceFile) + ' links to missing fragment ' + url.hash);
    }
  }
}

if (!existsSync(dist)) {
  throw new Error('dist is missing; run npm run build first');
}

const allFiles = walk(dist);
const htmlFiles = allFiles.filter((file) => file.endsWith('.html'));
const publicRoutes = new Set(htmlFiles.map(routeFor).filter((route) => route !== '/404/'));
const linkedRoutes = new Set(['/']);

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const route = routeFor(file);
  const expectedCanonical = new URL(route, siteOrigin).href;
  const canonical = html.match(/<link\b[^>]*\brel="canonical"[^>]*\bhref="([^"]+)"/i)?.[1];

  if (canonical !== expectedCanonical) {
    fail(relative(dist, file) + ' has canonical ' + (canonical ?? 'missing') + ', expected ' + expectedCanonical);
  }

  for (const [attribute, value] of [
    ['name', 'description'],
    ['name', 'robots'],
    ['property', 'og:title'],
    ['property', 'og:description'],
    ['property', 'og:url'],
    ['property', 'og:image'],
    ['name', 'twitter:card'],
    ['name', 'twitter:title'],
    ['name', 'twitter:description'],
    ['name', 'twitter:image'],
  ]) {
    if (!hasMeta(html, attribute, value)) fail(relative(dist, file) + ' is missing ' + value + ' metadata');
  }

  if (!/type="application\/ld\+json"/i.test(html)) fail(relative(dist, file) + ' is missing JSON-LD');

  for (const script of html.matchAll(/<script\b[^>]*>/gi)) {
    if (/type=["']application\/ld\+json/i.test(script[0])) continue;
    if (!/\bsrc=["']/i.test(script[0])) fail(relative(dist, file) + ' has an executable inline script');
  }

  for (const reference of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
    checkReference(reference[1], route, file);
  }

  for (const anchor of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)) {
    const url = new URL(anchor[1], new URL(route, siteOrigin));
    if (url.origin !== siteOrigin) continue;
    const target = fileForPathname(url.pathname);
    if (existsSync(target) && target.endsWith('.html')) linkedRoutes.add(routeFor(target));
  }
}

const robots = join(dist, 'robots.txt');
if (!existsSync(robots)) {
  fail('robots.txt is missing');
} else if (!readFileSync(robots, 'utf8').includes('Sitemap: ' + new URL('/sitemap-index.xml', siteOrigin).href)) {
  fail('robots.txt does not use the configured canonical origin');
}

if (!existsSync(join(dist, 'social-card.png'))) fail('social-card.png is missing');

const sitemapFiles = allFiles.filter((file) => file.endsWith('.xml'));
const sitemap = sitemapFiles.map((file) => readFileSync(file, 'utf8')).join('\n');
if (!sitemap.includes(new URL('/', siteOrigin).href)) fail('sitemap does not include the home route');
if (sitemap.includes('/engineering/projects/')) fail('sitemap includes a maintenance route');
if (sitemap.includes('/404')) fail('sitemap includes the 404 route');

for (const file of htmlFiles.filter((candidate) => relative(dist, candidate).startsWith('engineering/projects/'))) {
  const html = readFileSync(file, 'utf8');
  if (!hasMeta(html, 'name', 'robots') || !/name="robots" content="noindex,follow"/i.test(html)) {
    fail(relative(dist, file) + ' is not noindex,follow');
  }
  if (!html.includes('<h1>Server migration in progress.</h1>') || !html.includes('Verified destinations remain available below.')) {
    fail(relative(dist, file) + ' is missing the maintenance copy');
  }
}

for (const route of publicRoutes) {
  if (!linkedRoutes.has(route)) fail('public route is orphaned: ' + route);
}

if (errors.length) throw new Error(errors.join('\n'));
console.log('Verified ' + htmlFiles.length + ' HTML routes, internal references, metadata, robots, and sitemap.');
