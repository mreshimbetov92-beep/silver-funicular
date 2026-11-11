export type DemoSecrets = {
  IDROK_DEMO_EMAIL?: string;
  IDROK_DEMO_PASSWORD?: string;
  IDROK_DEMO_PASSWORD_HASH?: string;
  IDROK_DEMO_SESSION_SECRET?: string;
};

export const COOKIE_NAME = 'idrok_demo_session';
export const SESSION_SECONDS = 8 * 60 * 60;
const encoder = new TextEncoder();
const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store, private', 'Vary': 'Cookie', 'X-Content-Type-Options': 'nosniff' };

function json(body: object, status = 200, cookie?: string) {
  return new Response(JSON.stringify(body), { status, headers: { ...headers, ...(cookie ? { 'Set-Cookie': cookie } : {}) } });
}

function base64url(value: Uint8Array) {
  return btoa(String.fromCharCode(...value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decode(value: string) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('Invalid token');
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(normalized + '='.repeat((4 - normalized.length % 4) % 4)), c => c.charCodeAt(0));
}

async function key(secret: string) {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

async function credentialsMatch(email: string, password: string, secrets: DemoSecrets) {
  if (!secrets.IDROK_DEMO_PASSWORD && secrets.IDROK_DEMO_PASSWORD_HASH) {
    try {
      const [algorithm, iterations, salt, expected] = secrets.IDROK_DEMO_PASSWORD_HASH.split(':');
      if (algorithm !== 'pbkdf2-sha256' || !/^\d+$/.test(iterations) || Number(iterations) < 100000 || Number(iterations) > 1000000 || !/^[a-f0-9]{32}$/.test(salt) || !/^[a-f0-9]{64}$/.test(expected)) return false;
      const passwordKey = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
      const saltBytes = Uint8Array.from(salt.match(/../g)!, part => parseInt(part, 16));
      const actual = new Uint8Array(await crypto.subtle.deriveBits({ name:'PBKDF2', hash:'SHA-256', iterations:Number(iterations), salt:saltBytes }, passwordKey, 256));
      let mismatch = 0;
      for (let i = 0; i < actual.length; i++) mismatch |= actual[i] ^ parseInt(expected.slice(i * 2, i * 2 + 2), 16);
      return mismatch === 0 && email.trim().toLowerCase() === secrets.IDROK_DEMO_EMAIL?.trim().toLowerCase();
    } catch { return false; }
  }
  const actual = new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(email.trim().toLowerCase() + '\0' + password)));
  const expected = new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(secrets.IDROK_DEMO_EMAIL!.trim().toLowerCase() + '\0' + secrets.IDROK_DEMO_PASSWORD!)));
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) mismatch |= actual[i] ^ expected[i];
  return mismatch === 0;
}

async function validSession(request: Request, secrets: DemoSecrets) {
  const value = request.headers.get('cookie')?.split(';').map(v => v.trim()).find(v => v.startsWith(COOKIE_NAME + '='))?.slice(COOKIE_NAME.length + 1);
  if (!value || value.length > 2048 || !secrets.IDROK_DEMO_SESSION_SECRET) return false;
  try {
    const parts = value.split('.');
    if (parts.length !== 2) return false;
    const [payload, signature] = parts;
    if (!await crypto.subtle.verify('HMAC', await key(secrets.IDROK_DEMO_SESSION_SECRET), decode(signature), encoder.encode(payload))) return false;
    const session = JSON.parse(new TextDecoder().decode(decode(payload)));
    return session.aud === 'idrok-demo' && session.email === secrets.IDROK_DEMO_EMAIL?.trim().toLowerCase() && typeof session.exp === 'number' && session.exp > Date.now();
  } catch { return false; }
}

function cookie(request: Request, token: string, maxAge: number) {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`;
}

export async function handleDemoSession(request: Request, secrets: DemoSecrets): Promise<Response> {
  if (request.method === 'GET') return json({ authenticated: await validSession(request, secrets) });
  if (!['POST', 'DELETE'].includes(request.method)) return json({ error: 'So‘rov turi qo‘llab-quvvatlanmaydi.' }, 405);
  if (request.headers.get('origin') !== new URL(request.url).origin) return json({ error: 'So‘rov manbasi tasdiqlanmadi. Sahifani yangilang.' }, 403);
  if (request.method === 'DELETE') return json({ authenticated: false }, 200, cookie(request, '', 0));
  if (!secrets.IDROK_DEMO_EMAIL || (!secrets.IDROK_DEMO_PASSWORD && !secrets.IDROK_DEMO_PASSWORD_HASH) || !secrets.IDROK_DEMO_SESSION_SECRET) return json({ error: 'Demo kirish hozircha sozlanmagan. Keyinroq qayta urinib ko‘ring.' }, 503);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'So‘rov formati noto‘g‘ri.' }, 415);
  const raw = await request.text();
  if (raw.length > 4096) return json({ error: 'So‘rov hajmi juda katta.' }, 413);
  let input: { email?: unknown; password?: unknown };
  try { input = JSON.parse(raw); } catch { return json({ error: 'Login va parolni tekshiring.' }, 400); }
  if (!input || typeof input.email !== 'string' || typeof input.password !== 'string' || input.email.length > 320 || input.password.length > 256) return json({ error: 'Login va parolni kiriting.' }, 400);
  if (!await credentialsMatch(input.email, input.password, secrets)) return json({ error: 'Login yoki parol noto‘g‘ri. Qayta urinib ko‘ring.' }, 401);
  const payload = base64url(encoder.encode(JSON.stringify({ aud: 'idrok-demo', email: secrets.IDROK_DEMO_EMAIL.trim().toLowerCase(), exp: Date.now() + SESSION_SECONDS * 1000 })));
  const signature = base64url(new Uint8Array(await crypto.subtle.sign('HMAC', await key(secrets.IDROK_DEMO_SESSION_SECRET), encoder.encode(payload))));
  return json({ authenticated: true }, 200, cookie(request, `${payload}.${signature}`, SESSION_SECONDS));
}
