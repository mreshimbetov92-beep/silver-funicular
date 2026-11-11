import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, sep, extname } from 'node:path';
import { handleDemoSession } from './lib/demo-session.ts';
import demoAccount from './config/demo-account.json' with { type: 'json' };

const root = fileURLToPath(new URL('./dist/', import.meta.url));
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.ico':'image/x-icon', '.woff2':'font/woff2' };
const baseHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
};

export function createAppServer(environment = process.env) {
  environment = { IDROK_DEMO_EMAIL:demoAccount.email, IDROK_DEMO_PASSWORD_HASH:demoAccount.passwordHash, ...environment };
  const port = Number(environment.PORT || 3000);
  // Use the configured public origin so HTTPS cookies and CSRF checks also work behind Render's proxy.
  const origin = new URL(environment.APP_ORIGIN || environment.RENDER_EXTERNAL_URL || `http://localhost:${port}`).origin;
  return http.createServer(async (req, res) => {
    const send = (status, body, headers = {}) => {
      res.writeHead(status, { ...baseHeaders, 'Cache-Control': 'no-store', ...headers });
      res.end(req.method === 'HEAD' ? undefined : body);
    };
    try {
      const pathname = decodeURIComponent((req.url || '/').split('?')[0]);
      if (pathname === '/health') {
        if (!['GET', 'HEAD'].includes(req.method)) return send(405, '', { Allow: 'GET, HEAD' });
        return send(200, JSON.stringify({ status:'ok' }), { 'Content-Type':'application/json' });
      }
      if (pathname === '/api/demo-session') {
        if (!['GET', 'POST', 'DELETE'].includes(req.method)) return send(405, '', { Allow:'GET, POST, DELETE' });
        const chunks = [];
        let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 4096) return send(413, JSON.stringify({ error:'So‘rov hajmi juda katta.' }), { 'Content-Type':'application/json' });
          chunks.push(chunk);
        }
        const headers = new Headers();
        for (const [key, value] of Object.entries(req.headers)) {
          if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
        }
        const request = new Request(origin + '/api/demo-session', {
          method: req.method, headers,
          ...(req.method === 'POST' ? { body:Buffer.concat(chunks).toString('utf8') } : {})
        });
        const result = await handleDemoSession(request, environment);
        return send(result.status, Buffer.from(await result.arrayBuffer()), Object.fromEntries(result.headers));
      }
      if (!['GET', 'HEAD'].includes(req.method)) return send(405, '', { Allow:'GET, HEAD' });
      // Serve only the build directory. Never expose source, environment variables or dotfiles.
      if (!pathname.startsWith('/') || pathname.includes('\\') || pathname.includes('\0') || pathname.split('/').some(part => part.startsWith('.'))) return send(404, 'Not found');
      const file = pathname === '/' ? resolve(root, 'index.html') : resolve(root, '.' + pathname);
      if (!file.startsWith(root.endsWith(sep) ? root : root + sep)) return send(404, 'Not found');
      try {
        const body = await readFile(file);
        return send(200, body, {
          'Content-Type': types[extname(file)] || 'application/octet-stream',
          'Cache-Control': pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache'
        });
      } catch (error) {
        if (['ENOENT', 'EISDIR', 'ENOTDIR'].includes(error.code)) return send(404, 'Not found');
        throw error;
      }
    } catch (error) {
      if (error instanceof URIError) return send(400, 'Bad request');
      console.error('Request failed:', error.name);
      if (!res.headersSent) send(500, 'Server error');
      else res.end();
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const required = ['IDROK_DEMO_SESSION_SECRET'];
  if (required.some(key => !process.env[key])) {
    console.error('Login sozlanmagan. Avval npm run setup yoki hosting Environment sozlamalarini bajaring.');
    process.exit(1);
  }
  const port = Number(process.env.PORT || 3000);
  const server = createAppServer();
  server.listen(port, '0.0.0.0', () => console.log(`Idrok server ready on port ${port}`));
  process.on('SIGTERM', () => server.close(() => process.exit(0)));
  process.on('SIGINT', () => server.close(() => process.exit(0)));
}
