import {topics as starterTopics,bank as starterQuestions,type Topic,type Question,type Attempt} from './data.ts';
export type Catalogue={version:1;topics:Topic[];questions:Question[]};
export const MAX_TOPICS=50,MAX_QUESTIONS=2000;
export function initialCatalogue():Catalogue{return {version:1,topics:structuredClone(starterTopics),questions:structuredClone(starterQuestions)}}
const text=(s:unknown,n:number)=>typeof s==='string'&&s.length<=n;
const filled=(s:unknown,n:number)=>text(s,n)&&(s as string).trim().length>0;
const id=(s:unknown)=>typeof s==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(s)&&!['__proto__','prototype','constructor','auto'].includes(s);
export function validateCatalogue(input:unknown):Catalogue{
 if(!input||typeof input!=='object')throw new Error('Baza formati noto‘g‘ri. Idrok JSON faylini tanlang.');
 const v=input as Catalogue;
 if(v.version!==1||!Array.isArray(v.topics)||!Array.isArray(v.questions)||v.topics.length<1||v.topics.length>MAX_TOPICS||v.questions.length>MAX_QUESTIONS)throw new Error('Baza: 1–50 mavzu va 0–2000 savol bo‘lishi mumkin.');
 const ids=new Set<string>();
 const topics=v.topics.map(t=>{
  if(!t||!id(t.id)||ids.has(t.id)||!filled(t.name,150)||!text(t.subtitle,150)||!filled(t.symbol,8)||!['purple','blue','green','orange'].includes(t.color)||!Number.isFinite(t.time)||t.time<1||t.time>180||!Array.isArray(t.theory)||t.theory.length>50||!t.theory.every(s=>text(s,10000))||!text(t.example,10000)||(t.archived!==undefined&&typeof t.archived!=='boolean'))throw new Error('Mavzu ma’lumotlari yoki identifikatori noto‘g‘ri.');
  ids.add(t.id);return {id:t.id,name:t.name.trim(),subtitle:t.subtitle,symbol:t.symbol,color:t.color,time:t.time,theory:[...t.theory],example:t.example,archived:!!t.archived};
 });
 if(!topics.some(t=>!t.archived))throw new Error('Kamida bitta faol mavzu qolishi kerak.');
 const qids=new Set<string>();
 const questions=v.questions.map(q=>{
  if(!q||!id(q.id)||qids.has(q.id)||!ids.has(q.topic)||![1,2,3].includes(q.level)||!filled(q.text,10000)||!Array.isArray(q.options)||q.options.length!==4||!q.options.every(s=>filled(s,3000))||new Set(q.options.map(s=>s.trim())).size!==4||!Number.isInteger(q.correct)||q.correct<0||q.correct>3||!text(q.explanation,10000)||(q.archived!==undefined&&typeof q.archived!=='boolean'))throw new Error('Savolda mavzu, 4 xil javob, to‘g‘ri javob va 1–3 darajani tekshiring.');
  qids.add(q.id);return {id:q.id,topic:q.topic,level:q.level,text:q.text.trim(),options:q.options.map(x=>x.trim()),correct:q.correct,explanation:q.explanation,archived:!!q.archived};
 });
 return {version:1,topics,questions};
}
export function mergeCatalogue(current:Catalogue,incoming:Catalogue):Catalogue{
 const topics=new Map(current.topics.map(t=>[t.id,t])),questions=new Map(current.questions.map(q=>[q.id,q]));
 incoming.topics.forEach(t=>topics.set(t.id,t));incoming.questions.forEach(q=>questions.set(q.id,q));
 return validateCatalogue({version:1,topics:[...topics.values()],questions:[...questions.values()]});
}
export function activeQuestions(c:Catalogue){const ids=new Set(c.topics.filter(t=>!t.archived).map(t=>t.id));return c.questions.filter(q=>!q.archived&&ids.has(q.topic))}
export function chooseQuestion(bank:Question[],topic:string,level:number,used:string[]):Question|undefined{return bank.filter(q=>!q.archived&&q.topic===topic&&!used.includes(q.id)).sort((a,b)=>Math.abs(a.level-level)-Math.abs(b.level-level))[0]}
export function quizPlan(c:Catalogue,mode:'practice'|'diagnostic',topic:string):string[]{
 const bank=activeQuestions(c);
 if(mode==='practice')return Array(Math.min(6,bank.filter(q=>q.topic===topic).length)).fill(topic);
 const ids=c.topics.filter(t=>!t.archived&&bank.some(q=>q.topic===t.id)).map(t=>t.id);
 return [...ids,...ids.filter(id=>bank.filter(q=>q.topic===id).length>=2)];
}
export function applyAttempts(mastery:Record<string,number>,attempts:Attempt[],diagnostic:boolean){
 const next={...mastery};for(const topic of new Set(attempts.map(a=>a.question.topic))){const related=attempts.filter(a=>a.question.topic===topic);next[topic]=diagnostic?Math.min(95,Math.round(15+1.5*related.reduce((s,a)=>s+(a.correct?25+a.question.level*10:0),0)/related.length)):Math.max(5,Math.min(100,(next[topic]||0)+related.reduce((s,a)=>s+(a.correct?5:-3),0)))}return next;
}
export function downloadFile(name:string,content:string,type='application/json'){
 const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
