import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createAppServer } from '../server.mjs';

const origin = 'https://idrok-test.onrender.com';
const environment = { RENDER_EXTERNAL_URL:origin, IDROK_DEMO_EMAIL:'test@example.com', IDROK_DEMO_PASSWORD:'test-only-password', IDROK_DEMO_SESSION_SECRET:'test-only-key-with-more-than-thirty-two-characters' };
const server = createAppServer(environment);
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}`;
try {
  assert.deepEqual(await (await fetch(url + '/health')).json(), { status:'ok' });
  const page = await fetch(url);
  assert.equal(page.status, 200);
  assert.match(page.headers.get('content-type'), /text\/html/);
  const html = await page.text();
  assert.match(html, /Idrok/);
  const asset = html.match(/src="([^"]+\.js)"/)[1];
  const javascript = await (await fetch(url + asset)).text();
  assert(javascript.length > 1000);
  assert(!javascript.includes(environment.IDROK_DEMO_PASSWORD));
  assert(!javascript.includes(environment.IDROK_DEMO_SESSION_SECRET));
  assert(!javascript.includes('chatgpt'));
  assert.equal((await fetch(url + '/favicon.svg')).status, 200);
  assert.equal((await fetch(url, { method:'HEAD' })).status, 200);
  for (const path of ['/.env', '/server.mjs', '/lib/demo-session.ts', '/%2e%2e%2fpackage.json', '/missing.js']) {
    assert.equal((await fetch(url + path)).status, 404, path);
  }
  assert.equal((await fetch(url + '/api/demo-session', { method:'PUT' })).status, 405);
  const login = (password, source = origin) => fetch(url + '/api/demo-session', {
    method:'POST', headers:{ Origin:source, 'Content-Type':'application/json' },
    body:JSON.stringify({ email:environment.IDROK_DEMO_EMAIL, password })
  });
  assert.equal((await login('wrong')).status, 401);
  assert.equal((await login(environment.IDROK_DEMO_PASSWORD, 'https://other.test')).status, 403);
  const response = await login(environment.IDROK_DEMO_PASSWORD);
  assert.equal(response.status, 200);
  const cookie = response.headers.get('set-cookie');
  for (const flag of ['HttpOnly', 'Secure', 'SameSite=Strict']) assert(cookie.includes(flag));
  const session = await fetch(url + '/api/demo-session', { headers:{ Cookie:cookie.split(';')[0] } });
  assert.deepEqual(await session.json(), { authenticated:true });
  assert.match(session.headers.get('cache-control'), /no-store/);
  const logout = await fetch(url + '/api/demo-session', { method:'DELETE', headers:{ Origin:origin } });
  assert(logout.headers.get('set-cookie').includes('Max-Age=0'));
  assert.equal((await fetch(url + '/api/demo-session', { method:'POST', headers:{ Origin:origin, 'Content-Type':'application/json' }, body:'x'.repeat(5000) })).status, 413);
  const blueprint = await readFile(new URL('../render.yaml', import.meta.url), 'utf8');
  assert.match(blueprint, /plan: free/);
  assert.match(blueprint, /generateValue: true/);
  console.log('PASS: HTTP server, assets, Render HTTPS origin, demo login, signed session, logout, private-file isolation and body limits.');
} finally {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
