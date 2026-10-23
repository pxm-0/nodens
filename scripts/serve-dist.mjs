import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';

const root = resolve('dist');
const port = Number(process.env.PORT ?? 4321);
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

if (!existsSync(root)) throw new Error('dist is missing; run npm run build first');
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be a valid TCP port');

function isFile(file) {
  try {
    return statSync(file).isFile();
  } catch {
    return false;
  }
}

function fileFor(pathname) {
  let candidate;
  try {
    candidate = resolve(root, '.' + decodeURIComponent(pathname));
  } catch {
    return null;
  }
  if (candidate !== root && !candidate.startsWith(root + sep)) return null;
  if (isFile(candidate)) return candidate;

  const index = join(candidate, 'index.html');
  return isFile(index) ? index : null;
}

const server = createServer((request, response) => {
  if (!request.url || !['GET', 'HEAD'].includes(request.method ?? '')) {
    response.writeHead(405);
    response.end();
    return;
  }

  const pathname = new URL(request.url, 'http://127.0.0.1').pathname;
  if (pathname === '/healthz') {
    response.writeHead(200, { 'cache-control': 'no-store', 'content-type': 'text/plain; charset=utf-8' });
    response.end(request.method === 'HEAD' ? undefined : 'ok\n');
    return;
  }

  const file = fileFor(pathname);
  const responseFile = file ?? join(root, '404.html');
  if (!isFile(responseFile)) {
    response.writeHead(404);
    response.end();
    return;
  }

  response.writeHead(file ? 200 : 404, {
    'content-type': contentTypes[extname(responseFile)] ?? 'application/octet-stream',
  });
  if (request.method === 'HEAD') {
    response.end();
    return;
  }
  createReadStream(responseFile).pipe(response);
});

server.listen(port, '127.0.0.1', () => {
  console.log('Serving ' + root + ' at http://127.0.0.1:' + port);
});

process.once('SIGTERM', () => server.close(() => process.exit(0)));
process.once('SIGINT', () => server.close(() => process.exit(0)));
