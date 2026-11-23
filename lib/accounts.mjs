import {bootstrapAdmin} from './admin-bootstrap.mjs';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomBytes, randomUUID, createHash, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt=promisify(scryptCallback);
export const accountCookie='idrok_session';
const hash=s=>createHash('sha256').update(s).digest('hex');
const reply=(status,body,headers={})=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, private',...headers}});
export function gmailAddress(value){
 if(typeof value!=='string'||value.length>254)return null;
 const email=value.trim().toLowerCase();
 if(!/^[a-z0-9]+(?:\.[a-z0-9]+)*(?:\+[a-z0-9._-]+)?@gmail\.com$/.test(email)||email.split('@')[0].length>64)return null;
 return {email,key:email.split('@')[0].split('+')[0].replaceAll('.','')+'@gmail.com'};
}
async function passwordHash(password){const salt=randomBytes(16).toString('hex'),key=await scrypt(password,salt,64,{N:16384,r:8,p:1,maxmem:64*1024*1024});return salt+':'+key.toString('hex')}
async function passwordMatches(password,stored){try{const [salt,hex]=stored.split(':'),key=await scrypt(password,salt,64,{N:16384,r:8,p:1,maxmem:64*1024*1024});return hex.length===128&&timingSafeEqual(key,Buffer.from(hex,'hex'))}catch{return false}}
const publicUser=u=>({id:u.id,email:u.email,name:u.name,role:u.role==='admin'?'admin':'student',emailVerified:false});
export function createAccounts(env){
 const dir=resolve(env.IDROK_DATA_DIR||'data');mkdirSync(dir,{recursive:true,mode:0o700});
 const db=new DatabaseSync(resolve(dir,'idrok.sqlite'),{timeout:5000,allowExtension:false});
 db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
 CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT NOT NULL,email_key TEXT UNIQUE NOT NULL,name TEXT NOT NULL,password TEXT NOT NULL,recovery TEXT NOT NULL,created INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS rate_limits(key TEXT PRIMARY KEY,count INTEGER NOT NULL,until INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS states(user_id TEXT NOT NULL REFERENCES users(id),key TEXT NOT NULL,value TEXT NOT NULL,revision INTEGER NOT NULL,PRIMARY KEY(user_id,key));
 CREATE TABLE IF NOT EXISTS files(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),name TEXT NOT NULL,mime TEXT NOT NULL,kind TEXT NOT NULL,size INTEGER NOT NULL,metadata TEXT NOT NULL,bytes BLOB NOT NULL,created INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS works(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),value TEXT NOT NULL,revision INTEGER NOT NULL,created INTEGER NOT NULL);
 `);
 bootstrapAdmin(db,env);
 const timer=setInterval(()=>{db.prepare('DELETE FROM sessions WHERE expires < ?').run(Date.now());db.prepare('DELETE FROM rate_limits WHERE until < ?').run(Date.now())},300000);timer.unref();
 function limited(key,maximum,period){const now=Date.now();db.prepare('DELETE FROM rate_limits WHERE key=? AND until<?').run(key,now);db.prepare('INSERT INTO rate_limits(key,count,until) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1').run(key,now+period);return db.prepare('SELECT count FROM rate_limits WHERE key=?').get(key).count>maximum}
 function cookie(request,token='',maxAge=0){return `${accountCookie}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${new URL(request.url).protocol==='https:'?'; Secure':''}`}
 function tokenOf(request){return request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(accountCookie+'='))?.slice(accountCookie.length+1)||''}
 function user(request){const token=tokenOf(request);if(!/^[A-Za-z0-9_-]{43}$/.test(token))return null;const u=db.prepare('SELECT users.* FROM users JOIN sessions ON users.id=sessions.user_id WHERE sessions.token=? AND sessions.expires>?').get(hash(token),Date.now());return u?publicUser(u):null}
 function session(request,u,extra={}){const token=randomBytes(32).toString('base64url');db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(hash(token),u.id,Date.now()+8*3600000);return reply(200,{authenticated:true,user:publicUser(u),...extra},{'Set-Cookie':cookie(request,token,8*3600)})}
 let hashing=0;
 async function handle(request,ip){const path=new URL(request.url).pathname;
  if(path==='/api/auth/session'&&request.method==='GET'){const u=user(request);return reply(200,{authenticated:!!u,user:u})}
  if(request.headers.get('origin')!==new URL(request.url).origin)return reply(403,{error:'So‘rov manbasi tasdiqlanmadi.'});
  if(path==='/api/auth/session'&&request.method==='DELETE'){db.prepare('DELETE FROM sessions WHERE token=?').run(hash(tokenOf(request)));return reply(200,{authenticated:false},{'Set-Cookie':cookie(request)})}
  if(request.method!=='POST'||!['/api/auth/login','/api/auth/register','/api/auth/recover','/api/auth/password'].includes(path))return reply(405,{error:'So‘rov turi noto‘g‘ri.'});
  if(!request.headers.get('content-type')?.startsWith('application/json'))return reply(415,{error:'JSON formati kerak.'});
  if(limited('auth:'+ip,60,15*60000))return reply(429,{error:'Juda ko‘p urinish. 15 daqiqadan keyin qayta urinib ko‘ring.'});
  let v;try{v=await request.json()}catch{return reply(400,{error:'So‘rov noto‘g‘ri.'})}
  if(path==='/api/auth/password'){
   const current=user(request);if(!current)return reply(401,{error:'Hisobga kiring.'});
   if(!v||typeof v.currentPassword!=='string'||v.currentPassword.length>128||typeof v.newPassword!=='string'||v.newPassword.length<10||v.newPassword.length>128)return reply(400,{error:'Joriy va yangi (10–128 belgi) parolni kiriting.'});
   if(limited('password:'+current.id,8,900000)||hashing>=4)return reply(429,{error:'Urinishlar limiti. Keyinroq urinib ko‘ring.'});hashing++;
   try{const found=db.prepare('SELECT * FROM users WHERE id=?').get(current.id);if(!await passwordMatches(v.currentPassword,found.password))return reply(401,{error:'Joriy parol noto‘g‘ri.'});const next=await passwordHash(v.newPassword),recoveryCode=randomBytes(24).toString('base64url');
    db.exec('BEGIN IMMEDIATE');try{const changed=db.prepare('UPDATE users SET password=?,recovery=? WHERE id=? AND password=?').run(next,hash(recoveryCode),current.id,found.password);if(changed.changes!==1){db.exec('ROLLBACK');return reply(409,{error:'Parol boshqa sessiyada yangilangan.'})}db.prepare('DELETE FROM sessions WHERE user_id=?').run(current.id);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}
    return session(request,found,{recoveryCode});
   }finally{hashing--}
  }
  const address=gmailAddress(v?.email);
  if(!address)return reply(400,{error:'Faqat @gmail.com manzilini kiriting.'});
  if(typeof v.password!=='string'||v.password.length>128||v.password.length<(path.endsWith('/login')?1:10))return reply(400,{error:'Parol 10–128 belgidan iborat bo‘lsin.'});
  if(limited('email:'+hash(address.key),30,15*60000))return reply(429,{error:'Urinishlar limiti tugadi. Keyinroq urinib ko‘ring.'});
  if(hashing>=4)return reply(429,{error:'Server band. Birozdan keyin urinib ko‘ring.'});
  hashing++;
  try{
   const found=db.prepare('SELECT * FROM users WHERE email_key=?').get(address.key);
   if(path.endsWith('/login')){const valid=await passwordMatches(v.password,found?.password||('0'.repeat(32)+':'+ '0'.repeat(128)));if(!found||!valid||db.prepare('SELECT password FROM users WHERE id=?').get(found.id)?.password!==found.password)return reply(401,{error:'Gmail yoki parol noto‘g‘ri.'});return session(request,found)}
   if(path.endsWith('/recover')){if(!found||typeof v.code!=='string'||!timingSafeEqual(Buffer.from(found.recovery,'hex'),Buffer.from(hash(v.code.trim()),'hex')))return reply(401,{error:'Gmail yoki tiklash kodi noto‘g‘ri.'});const recoveryCode=randomBytes(24).toString('base64url'),password=await passwordHash(v.password);db.exec('BEGIN IMMEDIATE');try{const changed=db.prepare('UPDATE users SET password=?,recovery=? WHERE id=? AND recovery=?').run(password,hash(recoveryCode),found.id,found.recovery);if(changed.changes!==1){db.exec('ROLLBACK');return reply(401,{error:'Tiklash kodi ishlatilgan. Yangi kod bilan urinib ko‘ring.'})}db.prepare('DELETE FROM sessions WHERE user_id=?').run(found.id);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}return session(request,found,{recoveryCode})}
   if(typeof v.name!=='string'||!v.name.trim()||v.name.trim().length>60)return reply(400,{error:'Ism 1–60 belgidan iborat bo‘lsin.'});
   if(found)return reply(409,{error:'Bu Gmail uchun hisob mavjud. Hisobga kiring yoki tiklash kodidan foydalaning.'});
   if(limited('register:'+ip,10,3600000))return reply(429,{error:'Ro‘yxatdan o‘tish limiti tugadi. Bir soatdan keyin urinib ko‘ring.'});
   const recoveryCode=randomBytes(24).toString('base64url'),u={id:randomUUID(),email:address.email,name:v.name.trim()},password=await passwordHash(v.password);
   try{db.prepare('INSERT INTO users(id,email,email_key,name,password,recovery,created) VALUES(?,?,?,?,?,?,?)').run(u.id,u.email,address.key,u.name,password,hash(recoveryCode),Date.now())}catch(e){if(e.code?.startsWith('ERR_SQLITE'))return reply(409,{error:'Bu Gmail uchun hisob mavjud.'});throw e}
   return session(request,u,{recoveryCode});
  }finally{hashing--}
 }
 return {db,user,handle,limited,close(){clearInterval(timer);db.close()}};
}
