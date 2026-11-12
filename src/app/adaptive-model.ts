import type {Profile,TopicId} from './data';

export type LearningStyle='mixed'|'reading'|'practice'|'visual';
export type Role='student'|'teacher'|'system';
export type Goal={topic:TopicId|'auto';target:number;competency:string;outcome:string};
export type Project={id:string;title:string;topic:TopicId;brief:string;submission:string;status:'new'|'submitted'|'reviewed';review:string};
export type Resource={id:string;title:string;url:string;kind:'video'|'audio'|'simulator'|'web';topic:TopicId};
export type Feedback={id:number;rating:number;text:string;topic:TopicId};
export type LearningModel={interests:string;needs:string;style:LearningStyle;role:Role;goal:Goal;projects:Project[];resources:Resource[];feedback:Feedback[]};
export const topicOrder:TopicId[]=['algebra','fractions','geometry','functions'];
export const defaultModel:LearningModel={interests:'Matematika va amaliy masalalar',needs:'Funksiyalarni tushunish va mustaqil masala yechish',style:'mixed',role:'student',goal:{topic:'auto',target:80,competency:'Masalani tahlil qilish va yechish usulini asoslash',outcome:'Tanlangan mavzuni kamida 80% darajada o‘zlashtirish'},projects:[{id:'function-project',title:'Funksiya va uning grafigi',topic:'functions',brief:'f(x) = x³ − 3x funksiyasining aniqlanish sohasi, hosilasi, o‘sish-kamayish oraliqlari va ekstremumlarini toping. Natijani grafik bilan solishtirib, xulosangizni yozing.',submission:'',status:'new',review:''},{id:'budget-project',title:'Talabaning oylik budjeti',topic:'fractions',brief:'1 200 000 so‘m budjetning 40% ini oziq-ovqatga, 25% ini transportga ajrating. Qolgan miqdorni hisoblang va tejash rejasini izohlang.',submission:'',status:'new',review:''}],resources:[],feedback:[]};
export function recommend(profile:Profile,model:LearningModel){
  const weakest=[...topicOrder].sort((a,b)=>profile.mastery[a]-profile.mastery[b])[0];
  const focus=model.goal.topic;
  const topic=focus!=='auto'&&profile.mastery[focus]<model.goal.target?focus:weakest;
  const mastery=profile.mastery[topic];
  const level=mastery>=75?3:mastery>=45?2:1;
  const format=model.style==='reading'?'PDF va qisqa nazariya':model.style==='visual'?'Grafik va simulyator':model.style==='practice'?'Amaliy mashq va loyiha':'Qisqa dars, PDF va mashq';
  return {topic,mastery,level,format,gap:Math.max(0,model.goal.target-mastery),reason:focus!=='auto'&&topic===focus&&mastery<model.goal.target?'Belgilangan maqsadga hali erishilmagan.':'Eng past o‘zlashtirilgan mavzu mustahkamlanadi.'};
}
export function nextLevel(current:number,correct:boolean){return Math.max(1,Math.min(3,current+(correct?1:-1)))}
export function profileContext(profile:Profile,model:LearningModel){
  const r=recommend(profile,model);
  return JSON.stringify({darajalar:profile.mastery,diagnostika_bajarilgan:profile.diagnostic,maqsad:model.goal,taqdimot_uslubi:model.style,tavsiya_mavzusi:r.topic,tavsiya_darajasi:r.level});
}
export function safeResourceURL(value:string){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password?u.href:null}catch{return null}}
export function restoreModel(value:unknown):LearningModel{
  const base=structuredClone(defaultModel);
  if(!value||typeof value!=='object')return base;
  const v=value as Partial<LearningModel>;
  if(typeof v.interests==='string')base.interests=v.interests.slice(0,600);
  if(typeof v.needs==='string')base.needs=v.needs.slice(0,600);
  if(['mixed','reading','practice','visual'].includes(v.style||''))base.style=v.style!;
  if(['student','teacher','system'].includes(v.role||''))base.role=v.role!;
  if(v.goal&&[...topicOrder,'auto'].includes(v.goal.topic)&&Number.isFinite(v.goal.target))base.goal={topic:v.goal.topic,target:Math.max(50,Math.min(100,v.goal.target)),competency:typeof v.goal.competency==='string'?v.goal.competency.slice(0,300):base.goal.competency,outcome:typeof v.goal.outcome==='string'?v.goal.outcome.slice(0,500):base.goal.outcome};
  if(Array.isArray(v.projects))base.projects=v.projects.filter(p=>p&&typeof p.id==='string'&&typeof p.title==='string'&&typeof p.brief==='string'&&typeof p.submission==='string'&&typeof p.review==='string'&&topicOrder.includes(p.topic)&&['new','submitted','reviewed'].includes(p.status)).slice(0,50);
  if(Array.isArray(v.resources))base.resources=v.resources.filter(r=>r&&typeof r.id==='string'&&typeof r.title==='string'&&typeof r.url==='string'&&safeResourceURL(r.url)&&topicOrder.includes(r.topic)&&['video','audio','simulator','web'].includes(r.kind)).slice(0,100);
  if(Array.isArray(v.feedback))base.feedback=v.feedback.filter(f=>f&&Number.isFinite(f.id)&&Number.isFinite(f.rating)&&f.rating>=1&&f.rating<=5&&typeof f.text==='string'&&topicOrder.includes(f.topic)).slice(0,100);
  return base;
}
