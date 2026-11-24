import {writeFile,access} from 'node:fs/promises';
try{await access('.env');console.log('Sozlamalar mavjud.');process.exit(0)}catch{}
await writeFile('.env','PORT=3000\nIDROK_DATA_DIR=data\nIDROK_MAX_STORAGE_MB=2048\n',{flag:'wx',mode:0o600});
console.log('Tayyor. npm start buyrug‘ini bajaring va http://localhost:3000 ni oching.');
console.log('Administrator: mr.eshimbetov@gmail.com — belgilangan parol bilan kiring. Boshqalar Gmail bilan ro‘yxatdan o‘tadi.');
