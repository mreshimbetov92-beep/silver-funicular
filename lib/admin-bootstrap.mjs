import {readFileSync} from 'node:fs';
import {randomBytes,randomUUID,createHash} from 'node:crypto';
import {initialCatalogue} from '../src/app/catalogue.ts';
export function bootstrapAdmin(db,env){
 if(!db.prepare('PRAGMA table_info(users)').all().some(c=>c.name==='role'))db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'student'");
 db.exec('CREATE TABLE IF NOT EXISTS app_meta(key TEXT PRIMARY KEY,value TEXT NOT NULL)');
 if(env.IDROK_BOOTSTRAP_ADMIN==='0')return;
 const seed=JSON.parse(readFileSync(new URL('../private/admin-seed.json',import.meta.url),'utf8'));
 if(seed.email!=='mr.eshimbetov@gmail.com'||! /^[a-f0-9]{32}:[a-f0-9]{128}$/.test(seed.passwordHash))throw new Error('Admin seed noto‘g‘ri.');
 const key='admin-bootstrap-v1:'+seed.email;
 db.exec('BEGIN IMMEDIATE');try{
  if(db.prepare('SELECT value FROM app_meta WHERE key=?').get(key)){db.exec('COMMIT');return}
  const emailKey=seed.email.split('@')[0].split('+')[0].replaceAll('.','')+'@gmail.com',old=db.prepare('SELECT id FROM users WHERE email_key=?').get(emailKey),id=old?.id||randomUUID();
  // One-time explicit owner migration: claimed old sessions/recovery never retain admin access.
  const recovery=createHash('sha256').update(randomBytes(32)).digest('hex');
  if(old){db.prepare("UPDATE users SET role='admin',password=?,recovery=? WHERE id=?").run(seed.passwordHash,recovery,id);db.prepare('DELETE FROM sessions WHERE user_id=?').run(id)}
  else db.prepare('INSERT INTO users(id,email,email_key,name,password,recovery,created,role) VALUES(?,?,?,?,?,?,?,?)').run(id,seed.email,emailKey,'Administrator',seed.passwordHash,recovery,Date.now(),'admin');
  db.prepare('INSERT OR IGNORE INTO states(user_id,key,value,revision) VALUES(?,?,?,?)').run(id,'idrok-catalogue-v1',JSON.stringify(initialCatalogue()),1);
  db.prepare('INSERT INTO app_meta VALUES(?,?)').run(key,id);db.exec('COMMIT');
 }catch(e){db.exec('ROLLBACK');throw e}
}
