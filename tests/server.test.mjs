import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createAppServer} from '../server.mjs';
const dir=await mkdtemp(join(tmpdir(),'idrok32-'));
const origin='https://idrok-test.example',env={APP_ORIGIN:origin,IDROK_DATA_DIR:dir};
let server,url;
async function start(){server=createAppServer(env);await new Promise(r=>server.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+server.address().port}
async function stop(){server.closeAllConnections();await new Promise(r=>server.close(r))}
async function request(path,method='GET',body,cookie,source=origin){return fetch(url+path,{method,headers:{Origin:source,...(cookie?{Cookie:cookie}:{}),...(body===undefined?{}:{'Content-Type':'application/json'})},...(body===undefined?{}:{body:JSON.stringify(body)})})}
const cookieOf=r=>r.headers.get('set-cookie').split(';')[0];
try{
 await start();assert.equal((await fetch(url)).status,200);assert.equal((await fetch(url+'/health')).status,200);
 for(const p of ['/.env','/server.mjs','/data/idrok.sqlite','/src/main.tsx','/%2e%2e%2fpackage.json'])assert.equal((await fetch(url+p)).status,404);
 assert.equal((await request('/api/auth/register','POST',{email:'user@yahoo.com',name:'Test',password:'Strong-Test-Password'})).status,400);
 assert.equal((await request('/api/auth/register','POST',{email:'valid@gmail.com.evil.test',name:'Test',password:'Strong-Test-Password'})).status,400);
 assert.equal((await request('/api/auth/register','POST',{email:'test.alpha@gmail.com',name:'Test',password:'short'})).status,400);
 const registration=await request('/api/auth/register','POST',{email:'test.alpha@gmail.com',name:'Alpha',password:'Strong-Test-Password'});assert.equal(registration.status,200);
 const cookie= cookieOf(registration),body=await registration.json();assert(body.recoveryCode);assert.equal(body.user.emailVerified,false);
 assert(registration.headers.get('set-cookie').includes('Secure'));assert(registration.headers.get('set-cookie').includes('HttpOnly'));assert(registration.headers.get('set-cookie').includes('SameSite=Strict'));
 assert(!JSON.stringify(body).includes('Strong-Test-Password'));assert.equal((await request('/api/auth/register','POST',{email:'testalpha+alias@gmail.com',name:'Duplicate',password:'Strong-Test-Password'})).status,409);
 assert.equal((await request('/api/auth/login','POST',{email:'test.alpha@gmail.com',password:'wrong'})).status,401);
 assert.equal((await request('/api/auth/login','POST',{email:'test.alpha@gmail.com',password:'Strong-Test-Password'},undefined,'https://evil.test')).status,403);
 assert.equal((await request('/api/demo-session','POST',{email:'test@gmail.com',password:'unused'})).status,401);assert.equal((await request('/api/files')).status,401);assert.equal((await request('/api/ai')).status,401);
 assert.equal((await request('/api/ai','GET',undefined,cookie)).status,200);
 assert.equal((await request('/api/ai','POST',{question:'Hosila nima?'},cookie)).status,503);
 assert.equal((await request('/api/state','PUT',{key:'idrok-graph-v1',revision:0,value:{hello:1}},cookie)).status,200);
 assert.equal((await request('/api/state','PUT',{key:'idrok-graph-v1',revision:0,value:{hello:2}},cookie)).status,409);
 assert.equal((await request('/api/state','PUT',{key:'__proto__',revision:0,value:{}},cookie)).status,400);
 const original=Buffer.from('restart;\nf := x -> x^2;\n'),upload=await request('/api/files','POST',{name:'lesson.mpl',kind:'work',base64:original.toString('base64')},cookie);assert.equal(upload.status,201);const f=await upload.json();
 const download=await request('/api/files/'+f.id,'GET',undefined,cookie);assert.deepEqual(Buffer.from(await download.arrayBuffer()),original);assert.match(download.headers.get('content-disposition'),/^attachment/);
 const work=await request('/api/works','POST',{title:'Maple ish',service:'maple',url:'',notes:'Hosila',fileId:f.id,resultId:''},cookie);assert.equal(work.status,200);const w=await work.json();
 assert.equal((await request('/api/files/'+f.id,'DELETE',undefined,cookie)).status,409);
 const second=await request('/api/auth/register','POST',{email:'test.beta@gmail.com',name:'Beta',password:'Strong-Other-Password'}),cookieB=cookieOf(second);
 assert.deepEqual((await (await request('/api/works','GET',undefined,cookieB)).json()).items,[]);
 assert.deepEqual((await (await request('/api/state','GET',undefined,cookieB)).json()).items,[]);
 assert.equal((await request('/api/files/'+f.id,'GET',undefined,cookieB)).status,404);
 assert.equal((await request('/api/works','POST',{...w,fileId:f.id},cookieB)).status,400);
 assert.equal((await request('/api/works','POST',{title:'Bad',service:'forms',url:'https://docs.google.com.evil.test/forms/d/e/abc/viewform',notes:'',fileId:'',resultId:''},cookie)).status,400);
 assert.equal((await request('/api/files','POST',{name:'evil.exe',kind:'work',base64:'YQ=='},cookie)).status,415);
 assert.equal((await request('/api/files','POST',{name:'bad.txt',kind:'work',base64:'YQ=A'},cookie)).status,400);
 assert.equal((await request('/api/files','POST',{name:'test.pdf',kind:'pdf',base64:original.toString('base64'),metadata:{}},cookie)).status,400);
 const pdfBytes=Buffer.from('%PDF-1.7\n% minimal storage fixture'),pdfUpload=await request('/api/files','POST',{name:'lecture.pdf',kind:'pdf',base64:pdfBytes.toString('base64'),metadata:{pages:1,textPages:['Hosila va integral'],truncated:false}},cookie);assert.equal(pdfUpload.status,201);const pdfRecord=await pdfUpload.json();assert.equal(pdfRecord.kind,'pdf');assert.equal(pdfRecord.metadata.textPages[0],'Hosila va integral');assert.deepEqual(Buffer.from(await (await request('/api/files/'+pdfRecord.id,'GET',undefined,cookie)).arrayBuffer()),pdfBytes);
 const allowedHeaders=(await fetch(url)).headers.get('content-security-policy');assert(allowedHeaders.includes('https://www.geogebra.org'));assert(!allowedHeaders.includes("script-src 'self' 'unsafe-inline'"));
 await stop();await start();assert.equal((await (await request('/api/works','GET',undefined,cookie)).json()).items.length,1);assert.deepEqual(Buffer.from(await (await request('/api/files/'+f.id,'GET',undefined,cookie)).arrayBuffer()),original);
 const recover=await request('/api/auth/recover','POST',{email:'test.alpha@gmail.com',password:'New-Strong-Password',code:body.recoveryCode});assert.equal(recover.status,200);let newCookie=cookieOf(recover);const recoveryBody=await recover.json();
 assert.equal((await request('/api/files','GET',undefined,cookie)).status,401);
 assert.equal((await request('/api/auth/recover','POST',{email:'test.alpha@gmail.com',password:'New-Strong-Password',code:body.recoveryCode})).status,401);
 const concurrent=await Promise.all([1,2].map(()=>request('/api/auth/recover','POST',{email:'test.alpha@gmail.com',password:'Concurrent-New-Password',code:recoveryBody.recoveryCode})));assert.deepEqual(concurrent.map(r=>r.status).sort(),[200,401]);newCookie=cookieOf(concurrent.find(r=>r.status===200));assert.equal((await request('/api/works/'+w.id,'DELETE',undefined,newCookie)).status,200);assert.equal((await request('/api/files/'+f.id,'DELETE',undefined,newCookie)).status,200);
 assert.equal((await request('/api/auth/session','DELETE',undefined,newCookie)).status,200);assert.equal((await request('/api/files','GET',undefined,newCookie)).status,401);
 assert.equal((await request('/api/auth/register','POST',{email:'a'.repeat(5000)})).status,413);
 console.log('PASS: Gmail registration/aliases, hashing, sessions/recovery/logout, CSRF, user isolation, revision conflicts, native-file byte roundtrip, attachments, SQLite restart persistence, AI auth, CSP and private files.');
}finally{if(server?.listening)await stop();await rm(dir,{recursive:true,force:true})}
