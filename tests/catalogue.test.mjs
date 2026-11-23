import assert from 'node:assert/strict';
import {initialCatalogue,validateCatalogue,mergeCatalogue,activeQuestions,chooseQuestion,quizPlan,applyAttempts} from '../src/app/catalogue.ts';
import {recommend,restoreModel,defaultModel,profileContext} from '../src/app/adaptive-model.ts';
import {seed} from '../src/app/data.ts';
const base=initialCatalogue();
assert.equal(base.questions.length,72);
assert.equal(quizPlan(base,'diagnostic','').length,8);
const topic={id:'custom-analysis',name:'Hosila',subtitle:'Matematik analiz',symbol:'∂',color:'blue',time:20,theory:['$f(x)=x^3$'],example:'$f\'(x)=3x^2$'};
const q={id:'custom-q1',topic:topic.id,level:1,text:'$x^3$ hosilasi?',options:['$3x^2$','$x^2$','$3x$','$x^3$'],correct:0,explanation:'Daraja qoidasi.'};
const one=validateCatalogue({version:1,topics:[topic],questions:[q]});
assert.deepEqual(quizPlan(one,'practice',topic.id),[topic.id]);
assert.deepEqual(quizPlan(one,'diagnostic',''),[topic.id]);
assert.equal(chooseQuestion(one.questions,topic.id,3,[]).id,q.id);
assert.equal(chooseQuestion(one.questions,topic.id,1,[q.id]),undefined);
const two=validateCatalogue({...one,questions:[q,{...q,id:'custom-q2',level:3}]});
assert.equal(chooseQuestion(two.questions,topic.id,3,[]).id,'custom-q2');
assert.deepEqual(quizPlan(two,'practice',topic.id),[topic.id,topic.id]);
assert.deepEqual(quizPlan(two,'diagnostic',''),[topic.id,topic.id]);
const merged=mergeCatalogue(base,two);
assert.equal(merged.topics.length,5);assert.equal(merged.questions.length,74);
assert.equal(quizPlan(merged,'diagnostic','').length,10);
const update=mergeCatalogue(merged,{...two,topics:[{...topic,name:'Hosila va tatbiqlar'}]});
assert.equal(update.topics.length,5);assert.equal(update.questions.length,74);
assert.equal(update.topics.at(-1).name,'Hosila va tatbiqlar');
const archived=validateCatalogue({...merged,topics:merged.topics.map(t=>({...t,archived:t.id===topic.id}))});
assert.equal(activeQuestions(archived).length,72);
assert.equal(quizPlan(archived,'practice',topic.id).length,0);
assert.equal(quizPlan({...two,questions:two.questions.map(q=>({...q,archived:true}))},'diagnostic','').length,0);
for(const invalid of [
 {...one,version:2}, {...one,topics:[{...topic,id:'__proto__'}]}, {...one,topics:[topic,topic]},
 {...one,topics:[{...topic,archived:true}]}, {...one,questions:[q,q]}, {...one,questions:[{...q,topic:'missing'}]},
 {...one,questions:[{...q,options:['same','same','C','D']}]}, {...one,questions:[{...q,correct:4}]},
 {...one,questions:[{...q,level:0}]}, {...one,topics:[{...topic,time:NaN}]}
])assert.throws(()=>validateCatalogue(invalid));
assert.equal(base.topics.length,4,'merges must not mutate original data');
const mastery=applyAttempts({algebra:77},[{question:q,correct:true}],false);
assert.equal(mastery[topic.id],5);assert.equal(mastery.algebra,77);
assert.equal(applyAttempts({[topic.id]:99},[{question:q,correct:true}],false)[topic.id],100);
assert.equal(applyAttempts({},[{question:q,correct:false}],true)[topic.id],15);
const model=structuredClone(defaultModel);model.goal.topic=topic.id;
assert.equal(recommend(seed,model,merged.topics.map(t=>t.id)).topic,topic.id);
assert.equal(restoreModel(model,merged.topics.map(t=>t.id)).goal.topic,topic.id);
assert.equal(restoreModel(model).goal.topic,'auto');
assert.equal(JSON.parse(profileContext(seed,model,merged.topics)).tavsiya_mavzusi,topic.id);
assert(profileContext(seed,model,merged.topics).includes('Hosila'));
console.log('PASS: custom catalogue, archive, import merge, dynamic diagnostics, one-question quiz, validation and adaptive custom topics.');
