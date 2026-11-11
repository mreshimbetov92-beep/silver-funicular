import { randomBytes } from 'node:crypto';
import { writeFile, access } from 'node:fs/promises';

try { await access('.env'); console.log('Sozlamalar mavjud. Tayyor demo hisob bilan kirishingiz mumkin.'); process.exit(0); } catch {}
await writeFile('.env', 'IDROK_DEMO_SESSION_SECRET=' + randomBytes(48).toString('base64url') + '\nPORT=3000\n', { flag:'wx', mode:0o600 });
console.log('Tayyor. Demo login: mr.eshimbetov@gmail.com. Parol: suhbatda belgilangan demo parol.');
console.log('npm start buyrug‘ini bajaring va http://localhost:3000 ni oching.');
