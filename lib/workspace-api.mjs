import { randomUUID } from 'node:crypto';
import { validateCatalogue } from '../src/app/catalogue.ts';
import { validateWork, extensionList } from '../src/shared/work-types.ts';
const json=(s,b)=>new Response(JSON.stringify(b),{status:s,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, private'}});
const cleanFile=f=>({id:f.id,name:f.name,mime:f.mime,kind:f.kind,size:f.size,metadata:JSON.parse(f.metadata),created:f.created});
export function createWorkspaceHandler(accounts,env){const db=accounts.db;
 return async request=>{const u=accounts.user(request);if(!u)return json(401,{error:'Sessiya tugadi. Qayta kiring.'});const path=new URL(request.url).pathname;
  if(!['GET','HEAD'].includes(request.method)&&request.headers.get('origin')!==new URL(request.url).origin)return json(403,{error:'So‘rov manbasi noto‘g‘ri.'});
  let input; if(['POST','PUT'].includes(request.method)){if(!request.headers.get('content-type')?.startsWith('application/json'))return json(415,{error:'JSON talab qilinadi.'});try{input=await request.json()}catch{return json(400,{error:'JSON o‘qilmadi.'})}}
  if(path==='/api/state'&&request.method==='GET'){const items=db.prepare('SELECT key,value,revision FROM states WHERE user_id=?').all(u.id);return json(200,{items:items.map(i=>({...i,value:JSON.parse(i.value)}))})}
  if(path==='/api/state'&&request.method==='PUT'){
   if(!input||!['idrok-catalogue-v1','idrok-demo-v1','idrok-model-v3','idrok-graph-v1','idrok-tikz-v1'].includes(input.key)||!Number.isInteger(input.revision)||input.revision<0)return json(400,{error:'Saqlash kaliti noto‘g‘ri.'});
   let value;try{value=JSON.stringify(input.key==='idrok-catalogue-v1'?validateCatalogue(input.value):input.value)}catch{return json(400,{error:'Baza formati noto‘g‘ri.'})}if(!value||value.length>3*1024*1024)return json(413,{error:'Ma’lumot hajmi juda katta.'});
   const old=db.prepare('SELECT revision FROM states WHERE user_id=? AND key=?').get(u.id,input.key);if((old?.revision||0)!==input.revision)return json(409,{error:'Boshqa oynada o‘zgartirilgan. Zaxira olib, sahifani yangilang.'});
   db.prepare('INSERT INTO states VALUES(?,?,?,?) ON CONFLICT(user_id,key) DO UPDATE SET value=excluded.value,revision=excluded.revision').run(u.id,input.key,value,input.revision+1);return json(200,{revision:input.revision+1});
  }
  if(path==='/api/works'&&request.method==='GET')return json(200,{items:db.prepare('SELECT * FROM works WHERE user_id=? ORDER BY created DESC').all(u.id).map(w=>({...JSON.parse(w.value),id:w.id,created:w.created,revision:w.revision}))});
  if(path==='/api/works'&&request.method==='POST'){
   let w;try{w=validateWork(input)}catch(e){return json(400,{error:e.message})}
   for(const id of [w.fileId,w.resultId].filter(Boolean))if(!db.prepare('SELECT id FROM files WHERE id=? AND user_id=?').get(id,u.id))return json(400,{error:'Biriktirilgan fayl topilmadi.'});
   const id=input.id||randomUUID(),old=db.prepare('SELECT * FROM works WHERE id=? AND user_id=?').get(id,u.id);
   if(input.id&&!old)return json(404,{error:'Ish topilmadi.'});
   if(old&&input.revision!==old.revision)return json(409,{error:'Ish boshqa oynada yangilangan. Sahifani yangilang.'});
   if(!old&&db.prepare('SELECT COUNT(*) AS n FROM works WHERE user_id=?').get(u.id).n>=200)return json(409,{error:'200 ta ish limiti.'});
   const revision=(old?.revision||0)+1,created=old?.created||Date.now();
   db.prepare('INSERT INTO works VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value,revision=excluded.revision').run(id,u.id,JSON.stringify(w),revision,created);return json(200,{...w,id,revision,created});
  }
  const wid=path.match(/^\/api\/works\/([a-f0-9-]{36})$/)?.[1];
  if(wid&&request.method==='DELETE'){db.prepare('DELETE FROM works WHERE id=? AND user_id=?').run(wid,u.id);return json(200,{ok:true})}
  if(path==='/api/files'&&request.method==='GET')return json(200,{items:db.prepare('SELECT id,name,mime,kind,size,metadata,created FROM files WHERE user_id=? ORDER BY created DESC').all(u.id).map(cleanFile)});
  if(path==='/api/files'&&request.method==='POST'){
   if(!input||typeof input.name!=='string'||!input.name.trim()||input.name.length>240||typeof input.base64!=='string'||input.base64.length>28*1024*1024||!['work','pdf'].includes(input.kind))return json(400,{error:'Fayl ma’lumotlari noto‘g‘ri.'});
   const ext=input.name.toLowerCase().split('.').at(-1);if(!extensionList.includes(ext))return json(415,{error:'Bu kengaytmadagi fayl qo‘llanilmaydi.'});
   if(/[^A-Za-z0-9+/=]/.test(input.base64)||input.base64.length%4!==0)return json(400,{error:'Fayl kodlanishi noto‘g‘ri.'});
   const bytes=Buffer.from(input.base64,'base64');if(bytes.toString('base64')!==input.base64)return json(400,{error:'Fayl kodlanishi noto‘g‘ri.'});if(!bytes.length||bytes.length>20*1024*1024)return json(413,{error:'Fayl 20 MB dan oshmasin.'});
   const total=db.prepare('SELECT COALESCE(SUM(size),0) AS n FROM files WHERE user_id=?').get(u.id).n;
   const global=db.prepare('SELECT COALESCE(SUM(size),0) AS n FROM files').get().n,limit=Number(env.IDROK_MAX_STORAGE_MB)||2048;
   if(total+bytes.length>100*1024*1024||global+bytes.length>limit*1024*1024)return json(413,{error:'Fayl saqlash limiti tugadi.'});
   if(db.prepare('SELECT COUNT(*) AS n FROM files WHERE user_id=?').get(u.id).n>=250)return json(413,{error:'250 ta fayl limiti.'});
   const metadata=input.metadata||{};if(typeof metadata!=='object'||JSON.stringify(metadata).length>1100000)return json(400,{error:'Fayl metama’lumoti juda katta.'});
   if(input.kind==='pdf'&&(ext!=='pdf'||!bytes.subarray(0,1024).toString().includes('%PDF-')||!Array.isArray(metadata.textPages)||metadata.textPages.length>150||!metadata.textPages.every(x=>typeof x==='string')||metadata.textPages.join('').length>180000||!Number.isInteger(metadata.pages)||metadata.pages<1))return json(400,{error:'PDF ma’lumotlari noto‘g‘ri.'});
   const id=typeof input.id==='string'&&/^[a-f0-9-]{36}$/.test(input.id)?input.id:randomUUID();
   if(db.prepare('SELECT id FROM files WHERE id=?').get(id))return json(409,{error:'Bu fayl identifikatori band.'});
   const mime=({pdf:'application/pdf',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',svg:'image/svg+xml'})[ext]||'application/octet-stream';
   const f={id,name:input.name.replace(/[\r\n\/\\]/g,'_'),mime,kind:input.kind,size:bytes.length,metadata:JSON.stringify(metadata),created:Date.now()};
   db.prepare('INSERT INTO files VALUES(?,?,?,?,?,?,?,?,?)').run(id,u.id,f.name,mime,f.kind,f.size,f.metadata,bytes,f.created);return json(201,cleanFile(f));
  }
  const fid=path.match(/^\/api\/files\/([a-f0-9-]{36})$/)?.[1];
  if(fid&&request.method==='GET'){const f=db.prepare('SELECT * FROM files WHERE id=? AND user_id=?').get(fid,u.id);if(!f)return json(404,{error:'Fayl topilmadi.'});return new Response(f.bytes,{headers:{'Content-Type':'application/octet-stream','Content-Disposition':`attachment; filename="download.${f.name.split('.').at(-1)}"; filename*=UTF-8''${encodeURIComponent(f.name).replace(/'/g,'%27')}`,'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff'}})}
  if(fid&&request.method==='DELETE'){const linked=db.prepare('SELECT value FROM works WHERE user_id=?').all(u.id).some(x=>{const w=JSON.parse(x.value);return w.fileId===fid||w.resultId===fid});if(linked)return json(409,{error:'Fayl ishga biriktirilgan. Avval ishdagi biriktirmani olib tashlang.'});db.prepare('DELETE FROM files WHERE id=? AND user_id=?').run(fid,u.id);return json(200,{ok:true})}
  return json(404,{error:'Manzil topilmadi.'});
 }
}
