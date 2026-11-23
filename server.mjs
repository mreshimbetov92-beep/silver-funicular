import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, sep, extname } from 'node:path';
import { createAIHandler } from './lib/ai-service.mjs';
import {createAccounts} from './lib/accounts.mjs';
import {createSharedHandler} from './lib/shared-content.mjs';
import {createLiveQuiz} from './lib/live-quiz.mjs';
import {createTexHandler} from './lib/tex-compiler.mjs';
import {createWorkspaceHandler} from './lib/workspace-api.mjs';

const root = fileURLToPath(new URL('./dist/', import.meta.url));
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.ico':'image/x-icon', '.woff2':'font/woff2', '.woff':'font/woff', '.ttf':'font/ttf', '.wasm':'application/wasm' };
const baseHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; frame-src 'self' blob: https://www.geogebra.org https://embed.kahoot.it https://www.desmos.com https://desmos.com https://phet.colorado.edu https://docs.google.com https://www.wolframcloud.com https://wolframcloud.com; font-src 'self' blob:; connect-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
};

export function createAppServer(environment = process.env) {
  const port = Number(environment.PORT || 3000);
  // Use the configured public origin so HTTPS cookies and CSRF checks also work behind Render's proxy.
  const origin = new URL(environment.APP_ORIGIN || environment.RENDER_EXTERNAL_URL || `http://localhost:${port}`).origin;
  const accounts=createAccounts(environment), handleWorkspace=createWorkspaceHandler(accounts,environment);
  const handleShared=createSharedHandler(accounts);
  const handleLive=createLiveQuiz(accounts,environment),handleTex=createTexHandler(accounts,environment);
  const handleAI = createAIHandler(environment,fetch,request=>Promise.resolve(!!accounts.user(request)));
  const server=http.createServer(async (req, res) => {
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
      if(pathname.startsWith('/api/')) {
        if (!['GET', 'POST', 'PUT', 'DELETE'].includes(req.method)) return send(405, '', { Allow:'GET, POST, PUT, DELETE' });
        const earlyHeaders=new Headers();
        for(const [key,value] of Object.entries(req.headers))if(value!==undefined)earlyHeaders.set(key,Array.isArray(value)?value.join(', '):value);
        if(!pathname.startsWith('/api/auth/')&&!accounts.user(new Request(origin+pathname,{headers:earlyHeaders})))return send(401,JSON.stringify({error:'Hisobga kiring.'}),{'Content-Type':'application/json'});
        if(!['GET','HEAD'].includes(req.method)&&earlyHeaders.get('origin')!==origin)return send(403,JSON.stringify({error:'So‘rov manbasi tasdiqlanmadi.'}),{'Content-Type':'application/json'});
        const chunks = [];
        let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > (pathname === '/api/files' ? 30*1024*1024 : pathname === '/api/state' ? 6*1024*1024 : pathname === '/api/tex' ? 12*1024*1024 : pathname.startsWith('/api/live') ? 50000 : pathname === '/api/works' ? 25000 : pathname === '/api/ai' ? 150000 : 4096)) return send(413, JSON.stringify({ error:'So‘rov hajmi juda katta.' }), { 'Content-Type':'application/json' });
          chunks.push(chunk);
        }
        const headers = new Headers();
        for (const [key, value] of Object.entries(req.headers)) {
          if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
        }
        const request = new Request(origin + pathname, {
          method: req.method, headers,
          ...(['POST','PUT'].includes(req.method) ? { body:Buffer.concat(chunks).toString('utf8') } : {})
        });
        const ip=environment.IDROK_TRUST_PROXY==='1' ? String(req.headers['x-forwarded-for']||req.socket.remoteAddress).split(',')[0].trim() : req.socket.remoteAddress;
        const result = pathname.startsWith('/api/auth/') ? await accounts.handle(request,ip) : pathname==='/api/admin'||pathname.startsWith('/api/shared') ? await handleShared(request) : pathname==='/api/ai' ? await handleAI(request) : pathname==='/api/tex' ? await handleTex(request) : pathname==='/api/live'||pathname.startsWith('/api/live/') ? await handleLive(request) : await handleWorkspace(request);
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
  server.on('close',()=>accounts.close());
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const port = Number(process.env.PORT || 3000);
  const server = createAppServer();
  server.listen(port, '0.0.0.0', () => console.log(`Idrok server ready on port ${port}`));
  process.on('SIGTERM', () => server.close(() => process.exit(0)));
  process.on('SIGINT', () => server.close(() => process.exit(0)));
}
