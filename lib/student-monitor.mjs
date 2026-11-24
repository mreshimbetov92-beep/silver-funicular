const json=(status,data)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store, private'}});
export const learningKeys=['idrok-demo-v1','idrok-model-v3','idrok-catalogue-v1','idrok-graph-v1','idrok-tikz-v1','idrok-fulltex-v1','idrok-ai-v1','idrok-function-v1'];
const parse=s=>{try{return JSON.parse(s)}catch{return null}};
export function initMonitoring(db){db.exec(`CREATE TABLE IF NOT EXISTS learning_activity(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT NOT NULL REFERENCES users(id),kind TEXT NOT NULL,title TEXT NOT NULL,detail TEXT NOT NULL,created INTEGER NOT NULL);CREATE INDEX IF NOT EXISTS activity_user_time ON learning_activity(user_id,created);`)}
export function recordActivity(db,userId,kind,title,detail={}){
 const text=JSON.stringify(detail);if(text.length>120000)return;
 db.prepare('INSERT INTO learning_activity(user_id,kind,title,detail,created) VALUES(?,?,?,?,?)').run(userId,kind,String(title).slice(0,160),text,Date.now());
 db.prepare('DELETE FROM learning_activity WHERE user_id=? AND id NOT IN (SELECT id FROM learning_activity WHERE user_id=? ORDER BY id DESC LIMIT 1000)').run(userId,userId);
}
export function createStudentMonitor(accounts){const db=accounts.db;
 return async request=>{const user=accounts.user(request);if(!user)return json(401,{error:'Hisobga kiring.'});if(user.role!=='admin')return json(403,{error:'Faqat administrator ko‘ra oladi.'});if(request.method!=='GET')return json(405,{error:'Bu bo‘lim faqat ko‘rish uchun.'});const url=new URL(request.url),path=url.pathname;
  if(path==='/api/admin/students'){
   const page=Math.max(1,Math.min(100000,Math.floor(Number(url.searchParams.get('page')))||1)),query=(url.searchParams.get('q')||'').slice(0,100),pattern='%'+query.replace(/[\\%_]/g,'\\$&')+'%';
   const condition="u.role='student' AND (u.name LIKE ? ESCAPE '\\' OR u.email LIKE ? ESCAPE '\\')";
   const total=db.prepare('SELECT COUNT(*) n FROM users u WHERE '+condition).get(pattern,pattern).n;
   const rows=db.prepare(`SELECT u.id,u.name,u.email,u.created,(SELECT count(*) FROM works WHERE user_id=u.id) workCount,(SELECT count(*) FROM files WHERE user_id=u.id) fileCount,(SELECT max(created) FROM learning_activity WHERE user_id=u.id) lastActivity FROM users u WHERE ${condition} ORDER BY u.created DESC,u.id LIMIT 50 OFFSET ?`).all(pattern,pattern,(page-1)*50);
   return json(200,{total,page,items:rows.map(u=>{const p=parse(db.prepare("SELECT value FROM states WHERE user_id=? AND key='idrok-demo-v1'").get(u.id)?.value)||{},ss=Array.isArray(p.sessions)?p.sessions.filter(s=>s&&typeof s==='object'&&!Array.isArray(s)):[];return {...u,sessions:ss.length,correct:ss.reduce((n,s)=>n+(Number(s?.correct)||0),0),questions:ss.reduce((n,s)=>n+(Number(s?.total)||0),0),xp:Number(p.xp)||0}})});
  }
  const match=path.match(/^\/api\/admin\/students\/([a-zA-Z0-9_-]{1,80})(?:\/files\/([a-f0-9-]{36}))?$/);if(!match)return json(404,{error:'Manzil topilmadi.'});
  const student=db.prepare("SELECT id,name,email,created FROM users WHERE id=? AND role='student'").get(match[1]);if(!student)return json(404,{error:'Talaba topilmadi.'});
  if(match[2]){const f=db.prepare('SELECT name,bytes FROM files WHERE id=? AND user_id=?').get(match[2],student.id);if(!f)return json(404,{error:'Fayl topilmadi.'});return new Response(f.bytes,{headers:{'Content-Type':'application/octet-stream','Content-Disposition':`attachment; filename="download"; filename*=UTF-8''${encodeURIComponent(f.name).replace(/'/g,'%27')}`,'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff'}})}
  const states=db.prepare('SELECT key,value,revision FROM states WHERE user_id=?').all(student.id).filter(s=>learningKeys.includes(s.key)).map(s=>({...s,value:parse(s.value)}));
  const files=db.prepare('SELECT id,name,mime,kind,size,metadata,created FROM files WHERE user_id=? ORDER BY created DESC').all(student.id).map(f=>({...f,metadata:parse(f.metadata),reviewOwner:student.id}));
  const works=db.prepare('SELECT id,value,revision,created FROM works WHERE user_id=? ORDER BY created DESC').all(student.id).map(w=>({...parse(w.value),id:w.id,revision:w.revision,created:w.created}));
  const activity=db.prepare('SELECT id,kind,title,detail,created FROM learning_activity WHERE user_id=? ORDER BY id DESC LIMIT 1000').all(student.id).map(a=>({...a,detail:parse(a.detail)}));
  const games=db.prepare('SELECT DISTINCT g.id,g.title,g.state,g.created,g.owner,g.questions FROM live_games g LEFT JOIN live_players p ON p.game=g.id WHERE p.user=? OR g.owner=? ORDER BY g.created DESC').all(student.id,student.id).map(g=>{const questions=parse(g.questions)||[],answers=db.prepare('SELECT round,choice,correct,score,elapsed FROM live_answers WHERE game=? AND user=? ORDER BY round').all(g.id,student.id);return {id:g.id,title:g.title,state:g.state,created:g.created,host:g.owner===student.id,total:questions.length,score:answers.reduce((n,a)=>n+a.score,0),answers:answers.map(a=>({...a,question:questions[a.round]}))}});
  return json(200,{student,states,files,works,activity,games});
 }
}
