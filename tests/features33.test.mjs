import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {parseTexTests,texTestExample,stripComments} from '../src/app/tex-test-parser.ts';
import {csvCell} from '../src/shared/live-csv.ts';
import {initialCatalogue} from '../src/app/catalogue.ts';
import {createAccounts} from '../lib/accounts.mjs';
import {createLiveQuiz} from '../lib/live-quiz.mjs';
import {createWorkspaceHandler} from '../lib/workspace-api.mjs';
import {createAppServer} from '../server.mjs';
import {createTexBackend,createTexHandler,validateTexProject,dockerArgs,validWorkerToken} from '../lib/tex-compiler.mjs';
assert.equal(csvCell('A,"B"'),'"A,""B"""');assert.equal(csvCell(' =SUM(A1)'),"\"' =SUM(A1)\"");assert.equal(csvCell(950),'"950"');
const sample=parseTexTests(texTestExample);
assert.equal(sample.questions.length,2);assert.equal(sample.questions[0].correct,1);assert.equal(sample.questions[0].points,'5');assert.equal(sample.questions[1].options[0],String.raw`$\frac12$`);assert.match(sample.questions[0].explanation,/nx/);
assert.equal(stripComments(String.raw`50\% % ignored`),'50\\% \n');
const custom=String.raw`\idrokquestion{Hisoblang: $\frac{1+\sqrt{4}}{3}$}{1}{2}{3}{4}{A}{Javob $1$.}`;
assert.equal(parseTexTests(custom).questions[0].correct,0);
assert.equal(parseTexTests(custom.replace('{A}{','{}{')).questions[0].correct,-1);
assert.equal(parseTexTests(texTestExample.replaceAll('CorrectChoice','choice')).questions[0].correct,-1);
assert.equal(parseTexTests(texTestExample.replaceAll('choices','oneparchoices').replaceAll('CorrectChoice','correctchoice')).questions[0].correct,1);
assert.equal(parseTexTests(texTestExample.replaceAll('choices','checkboxes')).questions.length,2);
for(const bad of [texTestExample.replace(String.raw`\begin{document}`,String.raw`\begin{document}`+custom),custom.slice(0,-1),'x'.repeat(1000001),texTestExample.replace('\\choice $x^2$','\\CorrectChoice $x^2$'),texTestExample.replace('\\end{choices}','\\choice $99$\\end{choices}'),texTestExample.replace('\\end{choices}','\\end{choices}\\answer{D}'),custom.repeat(201)])assert.throws(()=>parseTexTests(bad));
const malicious=custom.replace('Hisoblang:',String.raw`\input{/etc/passwd} \write18{touch should-not-exist}`);assert(parseTexTests(malicious).questions[0].text.includes('write18')); // parser treats commands as text; never executes
const project={source:String.raw`\documentclass{article}\begin{document}OK\end{document}`,engine:'xelatex',assets:[{name:'parts/figure.tex',base64:Buffer.from('x').toString('base64')}]};
assert.deepEqual(validateTexProject(project),project);
for(const name of ['../leak.tex','/tmp/leak.tex','parts//x.tex','main.tex','part/../../x.tex','x.sh','x.tex;echo hi','-x\\y.tex'])assert.throws(()=>validateTexProject({...project,assets:[{name,base64:'eA=='}]}));
assert.throws(()=>validateTexProject({...project,assets:[...project.assets,...project.assets]}));assert.throws(()=>validateTexProject({...project,assets:[{name:'a.tex',base64:'eA=A'}]}));assert.throws(()=>validateTexProject({...project,engine:'sh'}));assert.throws(()=>validateTexProject({...project,source:'x'.repeat(500001)}));
const args=dockerArgs('fixture','idrok-tex:3.3');for(const flag of ['--read-only','--cap-drop','--security-opt','--memory','--pids-limit','--network','--user'])assert(args.includes(flag));assert.equal(args[args.indexOf('--network')+1],'none');assert(!args.some(a=>['-v','--volume','--mount','--privileged','--env-file'].includes(a)));assert(!args.join(' ').includes('OPENAI'));
assert(validWorkerToken('Bearer '+'a'.repeat(32),'a'.repeat(32)));assert(!validWorkerToken('Bearer '+'b'.repeat(32),'a'.repeat(32)));
const calls=[];const backend=createTexBackend({IDROK_TEX_MODE:'docker'},async(cmd,args,input)=>{calls.push({cmd,args,input});return args[0]==='run'?JSON.stringify({ok:true,pdf:Buffer.from('%PDF-1.7 fixture').toString('base64')}):'[]'});
assert.equal((await backend.status()).available,true);assert((await backend.compile(project)).ok);assert.equal(calls.at(-1).args[0],'rm');assert.equal(calls[1].args[calls[1].args.indexOf('--name')+1],calls[2].args[2]);
const failed=[];await assert.rejects(()=>createTexBackend({IDROK_TEX_MODE:'docker'},async(c,a)=>{failed.push(a);if(a[0]==='run')throw new Error('timeout');return ''}).compile(project));assert.equal(failed.at(-1)[0],'rm');assert.equal((await createTexBackend({}).status()).available,false);
const dir=await mkdtemp(join(tmpdir(),'idrok33-'));const origin='https://idrok-fixture.example',env={IDROK_DATA_DIR:dir,APP_ORIGIN:origin};let accounts=createAccounts(env),now=Date.now(),live=createLiveQuiz(accounts,env,()=>now);let httpServer;
const req=(path,method='GET',data,cookie,source=origin)=>new Request(origin+path,{method,headers:{Origin:source,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},...(data===undefined?{}:{body:JSON.stringify(data)})});
const call=async(cookie,path,method='GET',data,status=200,source=origin)=>{const r=await live(req(path,method,data,cookie,source));const v=await r.json();assert.equal(r.status,status,JSON.stringify(v));return v};
async function signup(label){const r=await accounts.handle(req('/api/auth/register','POST',{email:label+'@gmail.com',name:label,password:'Only-Testing-Password'}),label);assert.equal(r.status,200);return r.headers.get('set-cookie').split(';')[0]}
try{
 const host=await signup('host33'),alice=await signup('alice33'),bob=await signup('bob33'),outside=await signup('outside33');const catalogue=initialCatalogue(),workspace=createWorkspaceHandler(accounts,env);
 catalogue.questions[0].text='Imported immutable test: $x^2$';
 assert.equal((await workspace(req('/api/state','PUT',{key:'idrok-catalogue-v1',revision:0,value:catalogue},host))).status,200);
 assert.equal((await workspace(req('/api/state','PUT',{key:'idrok-fulltex-v1',revision:0,value:{source:project.source}},host))).status,200);
 await call(null,'/api/live','GET',undefined,401);await call(host,'/api/live/create','POST',{},403,'https://evil.test');
 let room=await call(host,'/api/live/create','POST',{title:'Matematik bellashuv',duration:10,questionIds:catalogue.questions.slice(0,2).map(q=>q.id)},201),path='/api/live/'+room.id;assert.match(room.pin,/^\d{6}$/);assert.equal(room.question,null);
 await call(outside,path,'GET',undefined,404);await call(host,path+'/action','POST',{action:'start',revision:room.revision},409);
 await call(alice,'/api/live/join','POST',{pin:room.pin,nickname:'Alice'});await call(bob,'/api/live/join','POST',{pin:room.pin,nickname:'alice'},409);await call(bob,'/api/live/join','POST',{pin:room.pin,nickname:'Bob'});
 await call(alice,path+'/action','POST',{action:'start',revision:room.revision},403);await call(alice,path+'/report','GET',undefined,403);await call(host,path+'/report','GET',undefined,409);
 room=await call(host,path+'/action','POST',{action:'start',revision:room.revision});assert.equal(room.state,'question');assert.equal(room.question.text,catalogue.questions[0].text);assert(!('correct' in room.question));
 await call(outside,'/api/live/join','POST',{pin:room.pin,nickname:'Late'},409);await call(host,path+'/answer','POST',{round:0,choice:0},403);await call(alice,path+'/answer','POST',{round:1,choice:0},409);await call(alice,path+'/answer','POST',{round:0,choice:7},400);
 now+=1000;let answer=await call(alice,path+'/answer','POST',{round:0,choice:catalogue.questions[0].correct,score:999999,elapsed:0});assert.equal(answer.answer.score,undefined);assert.equal(answer.players.find(p=>p.self).score,0);assert(!JSON.stringify(answer).includes('explanation'));
 await call(alice,path+'/answer','POST',{round:0,choice:0},409);now+=1000;await call(bob,path+'/answer','POST',{round:0,choice:(catalogue.questions[0].correct+1)%4});
 await call(host,path+'/action','POST',{action:'reveal',revision:room.revision-1},409);room=await call(host,path+'/action','POST',{action:'reveal',revision:room.revision});assert.equal(room.players[0].score,950);assert.equal(room.players[0].nickname,'Alice');assert.equal(room.players[1].score,0);assert.equal(room.answered,2);assert.equal(room.distribution.reduce((a,b)=>a+b),2);
 // Closed SQLite connection, new handler: sessions, snapshot, answers and score persist.
 accounts.close();accounts=createAccounts(env);live=createLiveQuiz(accounts,env,()=>now);room=await call(host,path);assert.equal(room.players[0].score,950);assert.equal(room.state,'reveal');
 room=await call(host,path+'/action','POST',{action:'next',revision:room.revision});assert.equal(room.current,1);assert.equal(room.question.correct,undefined);now+=10000;
 await call(alice,path+'/answer','POST',{round:1,choice:catalogue.questions[1].correct},409);room=await call(host,path);assert.equal(room.state,'reveal');assert.equal(room.answered,0);room=await call(host,path+'/action','POST',{action:'next',revision:room.revision});assert.equal(room.state,'finished');
 const report=await call(host,path+'/report');assert.equal(report.answers.length,2);assert.equal(report.questions.length,2);assert.equal(report.questions[0].text,catalogue.questions[0].text);assert.equal(report.players[0].score,950);await call(alice,path,'DELETE',undefined,403);
 const tex=createTexHandler(accounts,env,{status:async()=>({available:true}),compile:async()=>({ok:true,pdf:Buffer.from('%PDF-1.7 fixture').toString('base64'),log:'OK'})});
 assert.equal((await tex(req('/api/tex','POST',project))).status,401);assert.equal((await tex(req('/api/tex','POST',project,host,'https://evil.test'))).status,403);assert.equal((await tex(req('/api/tex','POST',project,host))).status,200);assert.equal((await tex(req('/api/tex','POST',{...project,engine:'bash'},host))).status,400);
 const texFail=createTexHandler(accounts,env,{compile:async()=>({ok:false,error:'syntax',log:'line 3'})});const compileError=await texFail(req('/api/tex','POST',project,host));assert.equal(compileError.status,422);assert.equal((await compileError.json()).log,'line 3');
 const texOff=createTexHandler(accounts,env);assert.equal((await texOff(req('/api/tex','POST',project,host))).status,503);
 let release;const waiting=createTexHandler(accounts,env,{compile:()=>new Promise(r=>release=r)});const waiting1=waiting(req('/api/tex','POST',project,host));await new Promise(r=>setImmediate(r));const release1=release;const waiting2=waiting(req('/api/tex','POST',project,host));await new Promise(r=>setImmediate(r));const release2=release;assert.equal((await waiting(req('/api/tex','POST',project,host))).status,429);release1({ok:false});release2({ok:false});await Promise.all([waiting1,waiting2]);
 await call(host,path,'DELETE');assert.equal(accounts.db.prepare('SELECT COUNT(*) n FROM live_answers').get().n,0);
 // Actual HTTP routing, pre-body auth, full-TeX state and body limit wiring.
 httpServer=createAppServer(env);await new Promise(r=>httpServer.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+httpServer.address().port;
 for(const route of ['/api/live','/api/tex']){assert.equal((await fetch(url+route)).status,401);assert.equal((await fetch(url+route,{headers:{Cookie:host}})).status,200)}
 const apiResponse=await fetch(url+'/api/live/create',{method:'POST',headers:{Cookie:host,Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({title:'HTTP game',duration:30,questionIds:[catalogue.questions[0].id]})});assert.equal(apiResponse.status,201);
 console.log('PASS 3.3: TeX import formats/keys/braces/limits; Docker isolation/cleanup; authenticated compiler and concurrency; HTTP routes; live owner/player permissions, hidden keys, timed scoring, duplicate/late answers, rankings, reports, restart and cascade deletion.');
}finally{if(httpServer){httpServer.closeAllConnections();await new Promise(r=>httpServer.close(r))}accounts.close();await rm(dir,{recursive:true,force:true})}
