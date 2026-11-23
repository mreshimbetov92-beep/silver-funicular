import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {randomBytes,scryptSync} from 'node:crypto';
import {createAccounts} from '../lib/accounts.mjs';
import {createAppServer} from '../server.mjs';
import {initialCatalogue} from '../src/app/catalogue.ts';
import {defaultModel} from '../src/app/adaptive-model.ts';
const password='Disposable-test-password-34',nextPassword='Changed-disposable-test-34';
const hash=p=>{const salt=randomBytes(16).toString('hex');return salt+':'+scryptSync(p,salt,64).toString('hex')};
const origin='https://idrok34.example',dir=await mkdtemp(join(tmpdir(),'idrok34-')),legacy=await mkdtemp(join(tmpdir(),'idrok34-legacy-'));
const env={APP_ORIGIN:origin,IDROK_DATA_DIR:dir};let server,url;
async function start(){server=createAppServer(env);await new Promise(r=>server.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+server.address().port}
async function stop(){server.closeAllConnections();await new Promise(r=>server.close(r))}
const cookieOf=r=>r.headers.get('set-cookie').split(';')[0];
const request=(path,method='GET',data,cookie)=>fetch(url+path,{method,headers:{Origin:origin,...(cookie?{Cookie:cookie}:{}),...(data===undefined?{}:{'Content-Type':'application/json'})},...(data===undefined?{}:{body:JSON.stringify(data)})});
async function call(path,method='GET',data,cookie,status=200){const r=await request(path,method,data,cookie);const v=await r.json();assert.equal(r.status,status,JSON.stringify(v));return v}
async function signup(email){const r=await request('/api/auth/register','POST',{email,name:'Talaba',password,role:'admin'});assert.equal(r.status,200);assert.equal((await r.clone().json()).user.role,'student');return cookieOf(r)}
try{
 // Migrate the actual pre-role schema, including an account with the owner's Gmail alias.
 const old=new DatabaseSync(join(legacy,'idrok.sqlite'));
 old.exec('CREATE TABLE users(id TEXT PRIMARY KEY,email TEXT NOT NULL,email_key TEXT UNIQUE NOT NULL,name TEXT NOT NULL,password TEXT NOT NULL,recovery TEXT NOT NULL,created INTEGER NOT NULL);CREATE TABLE sessions(token TEXT PRIMARY KEY,user_id TEXT NOT NULL,expires INTEGER NOT NULL);CREATE TABLE states(user_id TEXT NOT NULL,key TEXT NOT NULL,value TEXT NOT NULL,revision INTEGER NOT NULL,PRIMARY KEY(user_id,key));');
 old.prepare('INSERT INTO users VALUES(?,?,?,?,?,?,?)').run('old-owner','mreshimbetov@gmail.com','mreshimbetov@gmail.com','Old owner','old-hash','0'.repeat(64),1);
 old.prepare('INSERT INTO users VALUES(?,?,?,?,?,?,?)').run('old-student','oldstudent@gmail.com','oldstudent@gmail.com','Old student','old-hash','0'.repeat(64),2);
 old.prepare('INSERT INTO sessions VALUES(?,?,?)').run('old-session','old-owner',Date.now()+10000);
 old.prepare('INSERT INTO states VALUES(?,?,?,?)').run('old-owner','idrok-graph-v1','{"keep":true}',4);old.close();
 let migrated=createAccounts({IDROK_DATA_DIR:legacy});assert.equal(migrated.db.prepare("SELECT role FROM users WHERE id='old-owner'").get().role,'admin');assert.equal(migrated.db.prepare("SELECT role FROM users WHERE id='old-student'").get().role,'student');
 assert.equal(migrated.db.prepare('SELECT count(*) n FROM sessions').get().n,0);assert.equal(migrated.db.prepare("SELECT revision FROM states WHERE key='idrok-graph-v1'").get().revision,4);migrated.close();
 // Use only a disposable password in automated tests; never expose the owner's seed credential.
 const fixture=createAccounts(env),adminId=fixture.db.prepare("SELECT id FROM users WHERE role='admin'").get().id;
 fixture.db.prepare('UPDATE users SET password=? WHERE id=?').run(hash(password),adminId);fixture.close();
 await start();
 for(const p of ['/private/admin-seed.json','/lib/admin-bootstrap.mjs','/data/idrok.sqlite'])assert.equal((await fetch(url+p)).status,404);
 await call('/api/admin','GET',undefined,undefined,401);await call('/api/shared','GET',undefined,undefined,401);
 const login=await request('/api/auth/login','POST',{email:'mr.eshimbetov@gmail.com',password});assert.equal(login.status,200);let admin=cookieOf(login);assert.equal((await login.json()).user.role,'admin');
 const student=await signup('student34@gmail.com'),other=await signup('other34@gmail.com');
 await call('/api/auth/register','POST',{email:'mreshimbetov+alias@gmail.com',name:'Claim',password},undefined,409);
 await call('/api/admin','GET',undefined,student,403);
 const roster=await call('/api/admin','GET',undefined,admin);assert.equal(roster.total,3);assert(roster.users.some(u=>u.email==='student34@gmail.com'));assert(roster.users.every(u=>Object.keys(u).sort().join(',')==='created,email,name,role'));assert(!JSON.stringify(roster).includes(password));
 const c=initialCatalogue();c.topics[0].name='Adminning umumiy matematika darsi';c.questions[0].text='Admin savoli: $2+2=?$';
 await call('/api/state','PUT',{key:'idrok-catalogue-v1',revision:1,value:c},admin);
 const shared=await call('/api/shared','GET',undefined,student);assert.equal(shared.catalogue.topics[0].name,c.topics[0].name);assert.equal(shared.catalogue.questions[0].text,c.questions[0].text);assert.match(shared.catalogue.topics[0].id,/^public_[a-f0-9]{40}$/);assert.notEqual(shared.catalogue.topics[0].id,c.topics[0].id);
 const late=await signup('late34@gmail.com');assert.deepEqual((await call('/api/shared','GET',undefined,late)).catalogue,shared.catalogue);
 await call('/api/shared','PUT',{title:'Attempted edit'},student,403);
 const privateCatalogue=initialCatalogue();privateCatalogue.topics[0].name='Faqat mening darsim';
 await call('/api/state','PUT',{key:'idrok-catalogue-v1',revision:0,value:privateCatalogue,user_id:adminId,role:'admin'},student);
 assert.equal((await call('/api/shared','GET',undefined,other)).catalogue.topics[0].name,c.topics[0].name);
 const model=structuredClone(defaultModel);model.interests='PRIVATE-INTEREST';model.feedback=[{id:1,rating:3,text:'PRIVATE-FEEDBACK',topic:c.topics[0].id}];model.resources=[{id:'link1',topic:c.topics[0].id,title:'Ochiq resurs',url:'https://www.desmos.com/calculator',kind:'simulator'}];model.projects=[{id:'project1',topic:c.topics[0].id,title:'Umumiy loyiha',brief:'Grafik chizing',submission:'PRIVATE-SUBMISSION',review:'PRIVATE-REVIEW',status:'reviewed'}];
 await call('/api/state','PUT',{key:'idrok-model-v3',revision:0,value:model},admin);await call('/api/state','PUT',{key:'idrok-demo-v1',revision:0,value:{name:'Private profile',sessions:['PRIVATE-RESULT']}},admin);
 const common=await call('/api/shared','GET',undefined,student);assert.equal(common.projects[0].brief,'Grafik chizing');assert.equal(common.resources[0].title,'Ochiq resurs');assert(!JSON.stringify(common).includes('PRIVATE-'));assert(!JSON.stringify(await call('/api/state','GET',undefined,student)).includes('PRIVATE-'));
 const bytes=Buffer.from('%PDF-1.7\n% disposable test fixture');
 const file=await call('/api/files','POST',{name:'admin-dars.pdf',kind:'pdf',base64:bytes.toString('base64'),metadata:{pages:1,textPages:['Umumiy dars']}},admin,201);
 const privateFile=await call('/api/files','POST',{name:'private.txt',kind:'work',base64:Buffer.from('PRIVATE-FILE').toString('base64')},student,201);
 const work=await call('/api/works','POST',{title:'Admin ishi',service:'maple',url:'',notes:'Umumiy izoh',fileId:file.id,resultId:''},admin);
 const files=(await call('/api/shared/files','GET',undefined,other)).items;assert.equal(files.length,1);assert.equal(files[0].shared,true);assert.equal(files[0].metadata.textPages[0],'Umumiy dars');assert.equal((await call('/api/shared/works','GET',undefined,other)).items[0].title,'Admin ishi');
 assert.deepEqual(Buffer.from(await (await request('/api/shared/files/'+file.id,'GET',undefined,other)).arrayBuffer()),bytes);
 await call('/api/shared/files/'+privateFile.id,'GET',undefined,other,404);await call('/api/shared/files/'+file.id,'DELETE',undefined,student,403);await call('/api/files/'+file.id,'GET',undefined,student,404);
 await call('/api/works','POST',{...work,title:'Attempted edit',fileId:privateFile.id,resultId:''},student,404);
 await call('/api/works/'+work.id,'DELETE',undefined,student);assert.equal((await call('/api/shared/works','GET',undefined,other)).items.length,1);
 const room=await call('/api/live/create','POST',{title:'Umumiy savol bilan',duration:30,questionIds:[shared.catalogue.questions[0].id]},student,201);assert.match(room.pin,/^\d{6}$/);
 c.topics[0].archived=true;await call('/api/state','PUT',{key:'idrok-catalogue-v1',revision:2,value:c},admin);const archived=await call('/api/shared','GET',undefined,other);assert(!archived.catalogue.topics.some(t=>t.id===shared.catalogue.topics[0].id));assert(!archived.catalogue.questions.some(q=>q.topic===shared.catalogue.topics[0].id));
 await call('/api/works/'+work.id,'DELETE',undefined,admin);await call('/api/files/'+file.id,'DELETE',undefined,admin);assert.equal((await call('/api/shared/files','GET',undefined,other)).items.length,0);assert.equal((await call('/api/shared/works','GET',undefined,other)).items.length,0);
 await call('/api/auth/password','POST',{currentPassword:'wrong',newPassword:nextPassword},admin,401);
 const change=await request('/api/auth/password','POST',{currentPassword:password,newPassword:nextPassword},admin);assert.equal(change.status,200);const changed=await change.json();assert.equal(changed.user.role,'admin');assert(changed.recoveryCode);const newAdmin=cookieOf(change);await call('/api/admin','GET',undefined,admin,401);admin=newAdmin;
 await call('/api/auth/login','POST',{email:'mr.eshimbetov@gmail.com',password},undefined,401);
 await stop();await start();assert.equal((await call('/api/admin','GET',undefined,admin)).total,4);
 assert.equal((await call('/api/auth/login','POST',{email:'mr.eshimbetov@gmail.com',password:nextPassword})).user.role,'admin');
 assert.equal((await call('/api/auth/session','GET',undefined,student)).user.role,'student');
 console.log('PASS 3.4: legacy migration, one-time admin bootstrap, Gmail signup/forged roles, admin roster, shared lessons/questions/files/works/projects, private results, read-only permissions, archived content, live quiz, password rotation and restart persistence.');
}finally{if(server?.listening)await stop();await rm(dir,{recursive:true,force:true});await rm(legacy,{recursive:true,force:true})}
