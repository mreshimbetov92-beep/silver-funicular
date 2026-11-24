import {createHash} from 'node:crypto';
import {validateCatalogue,activeQuestions} from '../src/app/catalogue.ts';
import {restoreModel} from '../src/app/adaptive-model.ts';
const json=(status,data)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store, private'}});
export function sharedContent(db){
 const admin=db.prepare("SELECT id,name FROM users WHERE role='admin' ORDER BY created LIMIT 1").get();if(!admin)return {catalogue:null,resources:[],projects:[],owner:null};
 const saved=db.prepare("SELECT value,revision FROM states WHERE user_id=? AND key='idrok-catalogue-v1'").get(admin.id);let c=null;try{if(saved)c=validateCatalogue(JSON.parse(saved.value))}catch{}
 const id=x=>'public_'+createHash('sha256').update(admin.id+':'+x).digest('hex').slice(0,40);
 const catalogue=c?{version:1,topics:c.topics.filter(t=>!t.archived).map(t=>({...t,id:id(t.id)})),questions:activeQuestions(c).map(q=>({...q,id:id(q.id),topic:id(q.topic)}))}:null;
 const raw=db.prepare("SELECT value FROM states WHERE user_id=? AND key='idrok-model-v3'").get(admin.id);let model;try{if(raw&&c)model=restoreModel(JSON.parse(raw.value),c.topics.filter(t=>!t.archived).map(t=>t.id))}catch{}
 return {catalogue,revision:saved?.revision||0,owner:{name:admin.name},resources:(model?.resources||[]).map(r=>({id:id(r.id),title:r.title,url:r.url,kind:r.kind,topic:id(r.topic)})),projects:(model?.projects||[]).map(p=>({id:id(p.id),title:p.title,brief:p.brief,topic:id(p.topic)}))};
}
export function createSharedHandler(accounts){const db=accounts.db;
 return async request=>{const u=accounts.user(request);if(!u)return json(401,{error:'Hisobga kiring.'});const path=new URL(request.url).pathname;
  if(request.method!=='GET')return json(403,{error:'Umumiy materiallarni faqat administrator o‘z muharriridan o‘zgartiradi.'});
  if(path==='/api/admin'){if(u.role!=='admin')return json(403,{error:'Administrator huquqi kerak.'});return json(200,{total:db.prepare('SELECT COUNT(*) n FROM users').get().n,users:db.prepare('SELECT name,email,role,created FROM users ORDER BY created DESC LIMIT 200').all()})}
  if(path==='/api/shared')return json(200,sharedContent(db));
  if(path==='/api/shared/files')return json(200,{items:db.prepare("SELECT f.id,f.name,f.mime,f.kind,f.size,f.metadata,f.created FROM files f JOIN users u ON u.id=f.user_id WHERE u.role='admin' ORDER BY f.created DESC").all().map(f=>({...f,metadata:JSON.parse(f.metadata),shared:true}))});
  if(path==='/api/shared/works')return json(200,{items:db.prepare("SELECT w.id,w.value,w.revision,w.created FROM works w JOIN users u ON u.id=w.user_id WHERE u.role='admin' ORDER BY w.created DESC").all().map(w=>({...JSON.parse(w.value),id:w.id,revision:w.revision,created:w.created}))});
  const fid=path.match(/^\/api\/shared\/files\/([a-f0-9-]{36})$/)?.[1];if(fid){const f=db.prepare("SELECT f.* FROM files f JOIN users u ON u.id=f.user_id WHERE f.id=? AND u.role='admin'").get(fid);if(!f)return json(404,{error:'Umumiy fayl topilmadi.'});return new Response(f.bytes,{headers:{'Content-Type':'application/octet-stream','Content-Disposition':`attachment; filename="download.${f.name.split('.').at(-1)}"; filename*=UTF-8''${encodeURIComponent(f.name).replace(/'/g,'%27')}`,'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff'}})}
  return json(404,{error:'Manzil topilmadi.'});
 }
}
