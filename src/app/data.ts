export type TopicId = 'algebra' | 'fractions' | 'geometry' | 'functions';
export type Question = {id:string;topic:TopicId;level:number;text:string;options:string[];correct:number;explanation:string};
export type Attempt = {question:Question;correct:boolean};
export type Session = {id:number;date:string;title:string;correct:number;total:number;xp:number};
export type Profile = {name:string;goal:number;xp:number;minutes:number;mastery:Record<TopicId,number>;sessions:Session[];diagnostic:boolean};
export const topics:{id:TopicId;name:string;subtitle:string;symbol:string;color:string;time:number;theory:string[];example:string}[] = [
{id:'algebra',name:'Chiziqli tenglamalar',subtitle:'Algebra',symbol:'x',color:'purple',time:12,theory:['Tenglama — noma’lum qatnashgan tenglik. Uni yechish — tenglikni to‘g‘ri qiladigan qiymatni topish demakdir.','Tenglikning ikkala tomoniga bir xil sonni qo‘shish yoki ayirish mumkin. Ikkala tomonni nolga teng bo‘lmagan bir xil songa bo‘lish ham tenglikni saqlaydi.','ax + b = c (a ≠ 0) tenglamada avval b ni ayiramiz, keyin a ga bo‘lamiz: x = (c − b) / a.'],example:'3x + 6 = 21  →  3x = 15  →  x = 5'},
{id:'fractions',name:'Kasrlar va foizlar',subtitle:'Arifmetika',symbol:'½',color:'orange',time:10,theory:['Kasr butunning teng qismlarini ifodalaydi. Surati olingan qismlar soni, maxraji esa butun nechta teng qismga bo‘linganini ko‘rsatadi.','Kasrlarni qo‘shish uchun ularni umumiy maxrajga keltiramiz. Kasrni kasrga ko‘paytirishda suratlar va maxrajlar o‘zaro ko‘paytiriladi.','Bir foiz — sonning yuzdan bir qismi. Sonning p foizi: son × p / 100.'],example:'80 ning 25%i = 80 × 25 / 100 = 20'},
{id:'geometry',name:'Shakllar va yuzalar',subtitle:'Geometriya',symbol:'△',color:'green',time:15,theory:['Perimetr — shakl barcha tomonlarining uzunliklari yig‘indisi. To‘g‘ri to‘rtburchak uchun P = 2(a + b).','To‘g‘ri to‘rtburchak yuzi S = ab. Uchburchak yuzi esa asos va unga tushirilgan balandlik ko‘paytmasining yarmi: S = ah / 2.','To‘g‘ri burchakli uchburchakda katetlar kvadratlari yig‘indisi gipotenuza kvadratiga teng: a² + b² = c².'],example:'a = 3, b = 4  →  c² = 9 + 16 = 25  →  c = 5'},
{id:'functions',name:'Funksiyalar olami',subtitle:'Matematik analizga kirish',symbol:'ƒ',color:'blue',time:12,theory:['Funksiya — har bir ruxsat etilgan x qiymatiga yagona y qiymatini mos qo‘yuvchi qoida. y = f(x) deb yoziladi.','Funksiya qiymatini topish uchun x o‘rniga berilgan sonni qo‘yamiz. Masalan, f(x) = 2x + 1 bo‘lsa, f(3) = 7.','y = kx + b chiziqli funksiyaning grafigi to‘g‘ri chiziq. k > 0 bo‘lsa o‘sadi, k < 0 bo‘lsa kamayadi. k = 0 bo‘lsa funksiya o‘zgarmas.'],example:'f(x) = 3x − 2  →  f(4) = 3 × 4 − 2 = 10'}];
export const seed:Profile={name:'Eshimbetov',goal:15,xp:1280,minutes:8,mastery:{algebra:52,fractions:82,geometry:64,functions:38},sessions:[],diagnostic:false};
export const levels=['','Boshlang‘ich','O‘rta','Yuqori'];
function makeBank(){
const bank:Question[]=[];
const add=(topic:TopicId,level:number,text:string,options:string[],correct:number,explanation:string)=>bank.push({id:`${topic}-${level}-${bank.length}`,topic,level,text,options,correct,explanation});
for(let n=1;n<=6;n++){
add('algebra',1,`x + ${n+3} = ${3*n+7}. x ni toping.`,[`${2*n+4}`,`${2*n+3}`,`${3*n+7}`,`${4*n+10}`],0,`Ikkala tomondan ${n+3} ni ayiramiz: x = ${3*n+7} − ${n+3} = ${2*n+4}.`);
add('algebra',2,`${n+2}x − ${n} = ${(n+2)*(n+1)-n}. x ni toping.`,[`${n}`,`${n+2}`,`${n+1}`,`${n+3}`],2,`Ikkala tomonga ${n} ni qo‘shamiz va ${n+2} ga bo‘lamiz: x = ${n+1}.`);
add('algebra',3,`${n+2}(x − 2) = ${n}x + ${2*n}. x ni toping.`,[`${n+1}`,`${2*n+1}`,`${2*n+3}`,`${2*n+2}`],3,`Qavsni ochamiz: ${n+2}x − ${2*n+4} = ${n}x + ${2*n}. Demak, 2x = ${4*n+4} va x = ${2*n+2}.`);
add('fractions',1,`${n*40} sonining 25 foizi nechaga teng?`,[`${n*5}`,`${n*10}`,`${n*20}`,`${n*30}`],1,`25% — to‘rtdan bir qism. ${n*40} ÷ 4 = ${n*10}.`);
add('fractions',2,`${n}/6 + 1/3 yig‘indisini toping.`,[`${n+1}/9`,`${n+1}/6`,`${n+2}/6`,`${n+2}/9`],2,`1/3 = 2/6. Shuning uchun ${n}/6 + 2/6 = ${n+2}/6.`);
add('fractions',3,`${n*100} ming so‘mlik mahsulot 20% arzonlashib, so‘ng yangi narxi 25% oshdi. Yakuniy narx qancha?`,[`${n*105} ming`,`${n*80} ming`,`${n*125} ming`,`${n*100} ming`],3,`${n*100} × 0,8 × 1,25 = ${n*100} ming so‘m. Foizlar har safar o‘sha paytdagi narxdan hisoblanadi.`);
add('geometry',1,`Tomonlari ${n+2} va ${n+4} sm bo‘lgan to‘g‘ri to‘rtburchak yuzini toping.`,[`${(n+2)*(n+4)} sm²`,`${4*n+12} sm²`,`${2*n+6} sm²`,`${(n+3)*(n+4)} sm²`],0,`S = a × b = ${n+2} × ${n+4} = ${(n+2)*(n+4)} sm².`);
add('geometry',2,`Uchburchak asosi ${2*n+4} sm, shu asosga balandligi 5 sm. Uning yuzi qancha?`,[`${10*n+20} sm²`,`${5*n+10} sm²`,`${2*n+9} sm²`,`${5*n+5} sm²`],1,`S = ah/2 = (${2*n+4} × 5)/2 = ${5*n+10} sm².`);
add('geometry',3,`To‘g‘ri burchakli uchburchak katetlari ${3*n} va ${4*n} sm. Gipotenuzasi qancha?`,[`${7*n} sm`,`${6*n} sm`,`${5*n} sm`,`${25*n} sm`],2,`Pifagor teoremasi: c² = ${3*n}² + ${4*n}² = ${25*n*n}. Demak, c = ${5*n} sm.`);
add('functions',1,`f(x) = 2x + ${n}. f(${n+1}) ni hisoblang.`,[`${3*n+2}`,`${2*n+1}`,`${3*n+1}`,`${4*n+2}`],0,`x o‘rniga ${n+1} qo‘yamiz: f(${n+1}) = 2 × ${n+1} + ${n} = ${3*n+2}.`);
add('functions',2,`f(x) = ${n+1}x − ${n}. f(x) = ${2*n+3} bo‘lsa, x qancha?`,['1','2','3','4'],2,`${n+1}x − ${n} = ${2*n+3}, ya’ni ${n+1}x = ${3*n+3}. Demak, x = 3.`);
add('functions',3,`f(x) = x² − ${2*n}x + ${n*n+2}. Funksiyaning eng kichik qiymati qancha?`,[`${n+3}`,`${n*n+2}`,'0','2'],3,`To‘liq kvadrat ajratamiz: f(x) = (x − ${n})² + 2. Kvadrat manfiy emas, shuning uchun minimum 2; u x = ${n} da erishiladi.`);
}
return bank.map((q,i)=>{const shift=i%4;return {...q,options:[...q.options.slice(shift),...q.options.slice(0,shift)],correct:(q.correct-shift+4)%4}});
}
export const bank=makeBank();
export function pickQuestion(topic:TopicId,level:number,used:string[]){return bank.filter(q=>q.topic===topic&&!used.includes(q.id)).sort((a,b)=>Math.abs(a.level-level)-Math.abs(b.level-level))[0]}
