import {sharedContent} from './shared-content.mjs';
import {randomInt,randomUUID} from 'node:crypto';
import {initialCatalogue,validateCatalogue,activeQuestions} from '../src/app/catalogue.ts';
const json=(status,data)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store, private'}});
export function createLiveQuiz(accounts,env={},clock=Date.now){
 const db=accounts.db;
 db.exec(`CREATE TABLE IF NOT EXISTS live_games(id TEXT PRIMARY KEY,pin TEXT UNIQUE NOT NULL,owner TEXT NOT NULL REFERENCES users(id),title TEXT NOT NULL,questions TEXT NOT NULL,duration INTEGER NOT NULL,state TEXT NOT NULL,current INTEGER NOT NULL,started INTEGER NOT NULL,created INTEGER NOT NULL,revision INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS live_players(game TEXT NOT NULL REFERENCES live_games(id) ON DELETE CASCADE,user TEXT NOT NULL REFERENCES users(id),nickname TEXT NOT NULL,joined INTEGER NOT NULL,PRIMARY KEY(game,user));
 CREATE TABLE IF NOT EXISTS live_answers(game TEXT NOT NULL REFERENCES live_games(id) ON DELETE CASCADE,user TEXT NOT NULL REFERENCES users(id),round INTEGER NOT NULL,choice INTEGER NOT NULL,correct INTEGER NOT NULL,score INTEGER NOT NULL,elapsed INTEGER NOT NULL,PRIMARY KEY(game,user,round));
 CREATE INDEX IF NOT EXISTS live_owner ON live_games(owner);`);
 function fresh(g){if(g.state==='question'&&clock()>=g.started+g.duration*1000){db.prepare("UPDATE live_games SET state='reveal',revision=revision+1 WHERE id=? AND state='question'").run(g.id);return db.prepare('SELECT * FROM live_games WHERE id=?').get(g.id)}return g}
 function ranks(g){return db.prepare('SELECT p.user,p.nickname,COALESCE(SUM(a.score),0) AS score,COALESCE(SUM(a.correct),0) AS correct FROM live_players p LEFT JOIN live_answers a ON a.game=p.game AND a.user=p.user AND a.round<? WHERE p.game=? GROUP BY p.user,p.nickname ORDER BY score DESC,correct DESC,p.joined ASC').all(g.state==='question'?g.current:g.current+1,g.id)}
 function snapshot(g,u){g=fresh(g);const host=g.owner===u.id,member=db.prepare('SELECT * FROM live_players WHERE game=? AND user=?').get(g.id,u.id);if(!host&&!member)return null;const qs=JSON.parse(g.questions),q=qs[g.current],answer=db.prepare('SELECT choice,score,correct FROM live_answers WHERE game=? AND user=? AND round=?').get(g.id,u.id,g.current),reveal=['reveal','finished'].includes(g.state);return {id:g.id,pin:g.pin,title:g.title,role:host?'host':'player',state:g.state,current:g.current,total:qs.length,duration:g.duration,revision:g.revision,serverNow:clock(),deadline:g.started+g.duration*1000,question:g.state==='lobby'?null:{text:q.text,options:q.options,...(reveal?{correct:q.correct,explanation:q.explanation}:{})},answer:answer?{choice:answer.choice,...(reveal?{score:answer.score,correct:!!answer.correct}:{})}:null,answered:db.prepare('SELECT COUNT(*) AS n FROM live_answers WHERE game=? AND round=?').get(g.id,g.current).n,players:ranks(g).map((p,i)=>({nickname:p.nickname,score:p.score,correct:p.correct,rank:i+1,self:p.user===u.id})),distribution:reveal?[0,1,2,3].map(i=>db.prepare('SELECT COUNT(*) AS n FROM live_answers WHERE game=? AND round=? AND choice=?').get(g.id,g.current,i).n):undefined};}
 return async request=>{
 const u=accounts.user(request);if(!u)return json(401,{error:'Hisobga kiring.'});const path=new URL(request.url).pathname,method=request.method;
 if(method!=='GET'&&request.headers.get('origin')!==new URL(request.url).origin)return json(403,{error:'So‘rov manbasi noto‘g‘ri.'});
 let v={};if(method==='POST'){try{v=await request.json();if(!v||typeof v!=='object')throw 0}catch{return json(400,{error:'So‘rov formati noto‘g‘ri.'})}}
 if(path==='/api/live'&&method==='GET'){const rows=db.prepare('SELECT DISTINCT g.id,g.pin,g.title,g.state,g.created,g.owner FROM live_games g LEFT JOIN live_players p ON p.game=g.id WHERE g.owner=? OR p.user=? ORDER BY g.created DESC LIMIT 100').all(u.id,u.id);return json(200,{items:rows.map(g=>({...g,owner:undefined,role:g.owner===u.id?'host':'player'}))})}
 if(path==='/api/live/create'&&method==='POST'){
 if(accounts.limited('livecreate:'+u.id,20,3600000))return json(429,{error:'Xona yaratish limiti: soatiga 20 ta.'});
 if(typeof v.title!=='string'||!v.title.trim()||v.title.length>120||![10,15,20,30,45,60,90,120].includes(v.duration)||!Array.isArray(v.questionIds)||v.questionIds.length<1||v.questionIds.length>50||new Set(v.questionIds).size!==v.questionIds.length)return json(400,{error:'Nom, vaqt va 1–50 ta turli savolni tanlang.'});
 const saved=db.prepare("SELECT value FROM states WHERE user_id=? AND key='idrok-catalogue-v1'").get(u.id);let bank;try{bank=activeQuestions(saved?validateCatalogue(JSON.parse(saved.value)):initialCatalogue())}catch{return json(400,{error:'Savollar bazasi o‘qilmadi.'})}
 bank=[...bank,...(sharedContent(db).catalogue?.questions||[])];
 const qs=v.questionIds.map(id=>bank.find(q=>q.id===id));if(qs.some(q=>!q))return json(400,{error:'Savol topilmadi yoki arxivlangan. Bazani saqlab qayta urinib ko‘ring.'});
 if(db.prepare('SELECT COUNT(*) AS n FROM live_games WHERE owner=?').get(u.id).n>=100)return json(409,{error:'100 ta xona limiti. Eski yakunlangan xonani o‘chiring.'});
 if(db.prepare('SELECT COUNT(*) AS n FROM live_games').get().n>=10000)return json(503,{error:'Server xonalari limiti to‘ldi.'});
 let pin;do{pin=String(randomInt(100000,1000000))}while(db.prepare('SELECT id FROM live_games WHERE pin=?').get(pin));const id=randomUUID();db.prepare('INSERT INTO live_games VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(id,pin,u.id,v.title.trim(),JSON.stringify(qs),v.duration,'lobby',0,0,clock(),1);return json(201,snapshot(db.prepare('SELECT * FROM live_games WHERE id=?').get(id),u));
 }
 if(path==='/api/live/join'&&method==='POST'){
 if(accounts.limited('livejoin:'+u.id,30,60000))return json(429,{error:'Qo‘shilish urinishlari ko‘paydi. Bir daqiqadan keyin urinib ko‘ring.'});
 if(typeof v.pin!=='string'||!/^\d{6}$/.test(v.pin)||typeof v.nickname!=='string'||!v.nickname.trim()||v.nickname.length>32)return json(400,{error:'6 xonali kod va 1–32 belgili ismingizni kiriting.'});
 let g=db.prepare('SELECT * FROM live_games WHERE pin=?').get(v.pin);if(!g)return json(404,{error:'Xona topilmadi.'});g=fresh(g);if(g.owner===u.id)return json(409,{error:'Siz bu xonaning boshlovchisisiz. Uni Xonalarimdan oching.'});
 if(db.prepare('SELECT user FROM live_players WHERE game=? AND user=?').get(g.id,u.id))return json(200,snapshot(g,u));
 if(g.state!=='lobby')return json(409,{error:'O‘yin boshlangan yoki yakunlangan. Yangi ishtirokchi qabul qilinmaydi.'});
 if(db.prepare('SELECT COUNT(*) AS n FROM live_players WHERE game=?').get(g.id).n>=100)return json(409,{error:'Xonada 100 ta ishtirokchi limiti.'});
 if(db.prepare('SELECT user FROM live_players WHERE game=? AND lower(nickname)=lower(?)').get(g.id,v.nickname.trim()))return json(409,{error:'Bu ism band. Boshqa nom kiriting.'});
 db.prepare('INSERT INTO live_players VALUES(?,?,?,?)').run(g.id,u.id,v.nickname.trim(),clock());return json(200,snapshot(g,u));
 }
 const match=path.match(/^\/api\/live\/([a-f0-9-]{36})(?:\/(answer|action|report))?$/);if(!match)return json(404,{error:'Xona manzili topilmadi.'});let g=db.prepare('SELECT * FROM live_games WHERE id=?').get(match[1]);if(!g)return json(404,{error:'Xona topilmadi.'});g=fresh(g);
 const visible=snapshot(g,u);if(!visible)return json(404,{error:'Xonaga kod bilan qo‘shiling.'});
 if(!match[2]&&method==='GET')return json(200,visible);
 if(!match[2]&&method==='DELETE'){if(g.owner!==u.id)return json(403,{error:'Faqat boshlovchi o‘chira oladi.'});if(g.state!=='finished')return json(409,{error:'Avval o‘yinni yakunlang.'});db.prepare('DELETE FROM live_games WHERE id=?').run(g.id);return json(200,{ok:true})}
 if(match[2]==='report'&&method==='GET'){if(g.owner!==u.id)return json(403,{error:'Hisobot faqat boshlovchi uchun.'});if(g.state!=='finished')return json(409,{error:'Hisobot yakunlangan o‘yinda ochiladi.'});const questions=JSON.parse(g.questions);return json(200,{title:g.title,pin:g.pin,players:ranks(g),questions,answers:db.prepare('SELECT a.*,p.nickname FROM live_answers a JOIN live_players p ON p.game=a.game AND p.user=a.user WHERE a.game=? ORDER BY a.round,p.joined').all(g.id).map(a=>({...a,user:undefined,game:undefined}))})}
 if(match[2]==='answer'&&method==='POST'){
 if(g.owner===u.id)return json(403,{error:'Boshlovchi javob yubormaydi.'});if(g.state!=='question'||v.round!==g.current)return json(409,{error:'Bu savolga javob berish vaqti tugagan.'});if(!Number.isInteger(v.choice)||v.choice<0||v.choice>3)return json(400,{error:'A–D javobdan birini tanlang.'});
 const elapsed=Math.max(0,clock()-g.started);if(elapsed>=g.duration*1000)return json(409,{error:'Javob berish vaqti tugagan.'});const q=JSON.parse(g.questions)[g.current],correct=v.choice===q.correct?1:0,score=correct?Math.max(500,1000-Math.floor(500*elapsed/(g.duration*1000))):0;
 try{db.prepare('INSERT INTO live_answers VALUES(?,?,?,?,?,?,?)').run(g.id,u.id,g.current,v.choice,correct,score,elapsed)}catch(e){if(e.code?.startsWith('ERR_SQLITE'))return json(409,{error:'Javob allaqachon qabul qilingan.'});throw e}return json(200,snapshot(g,u));
 }
 if(match[2]==='action'&&method==='POST'){
 if(g.owner!==u.id)return json(403,{error:'Bu amal faqat boshlovchi uchun.'});if(v.revision!==g.revision)return json(409,{error:'Xona holati yangilangan. Qayta urinib ko‘ring.'});let next=g.state,index=g.current,started=g.started;
 if(v.action==='start'&&g.state==='lobby'){if(!visible.players.length)return json(409,{error:'Kamida bitta talaba qo‘shilsin.'});next='question';started=clock()}
 else if(v.action==='reveal'&&g.state==='question')next='reveal';
 else if(v.action==='next'&&g.state==='reveal'){if(index+1>=JSON.parse(g.questions).length)next='finished';else{next='question';index++;started=clock()}}
 else if(v.action==='finish'&&g.state!=='finished')next='finished';else return json(409,{error:'Bu holatda amal bajarilmaydi.'});
 db.prepare('UPDATE live_games SET state=?,current=?,started=?,revision=revision+1 WHERE id=?').run(next,index,started,g.id);return json(200,snapshot(db.prepare('SELECT * FROM live_games WHERE id=?').get(g.id),u));
 }
 return json(405,{error:'Amal turi qo‘llanilmaydi.'});
 };
}
