export type ImportedQuestion={text:string;options:string[];correct:number;explanation:string;points?:string};
export type TexImport={questions:ImportedQuestion[];warnings:string[];format:string};
type Token={name:string;start:number;end:number};
export function stripComments(s:string){let out='';for(let i=0;i<s.length;i++){if(s[i]==='\\'){out+=s[i];if(i+1<s.length)out+=s[++i]}else if(s[i]==='%'){while(i<s.length&&s[i]!=='\n')i++;out+='\n'}else out+=s[i]}return out}
function group(s:string,i:number,open='{',close='}'){while(/\s/.test(s[i]||'')&&i<s.length)i++;if(s[i]!==open)throw new Error('LaTeX qavsi kutilmoqda: '+open);const start=++i;let depth=1;for(;i<s.length;i++){if(s[i]==='\\'){i++;continue}if(s[i]===open)depth++;if(s[i]===close&&!--depth)return {value:s.slice(start,i),end:i+1}}throw new Error('Yopilmagan LaTeX qavsi.');}
// Structural tokens only at brace depth zero. TeX is never evaluated.
function tokens(s:string,names:string[]){const result:Token[]=[];let depth=0;for(let i=0;i<s.length;i++){if(s[i]==='\\'){const m=s.slice(i+1).match(/^[A-Za-z]+/);if(m){if(depth===0&&names.includes(m[0]))result.push({name:m[0],start:i,end:i+1+m[0].length});i+=m[0].length}else i++}else if(s[i]==='{')depth++;else if(s[i]==='}')depth--;if(depth<0)throw new Error('Ortiqcha yopuvchi qavs.')}if(depth!==0)throw new Error('LaTeX qavslari mos kelmaydi.');return result}
function clean(s:string){return s.trim().replace(/\\(?:textbf|textit|emph)\{([^{}]*)\}/g,'$1').replace(/\\par\b/g,'\n\n').replace(/\\(?:smallskip|medskip|bigskip|noindent)\b/g,'').trim()}
export function parseTexTests(source:string):TexImport{
 if(source.length>1000000)throw new Error('TeX fayli 1 million belgidan oshmasin.');
 let s=stripComments(source.replace(/^\uFEFF/,''));const doc=s.match(/\\begin\s*\{document\}([\s\S]*?)\\end\s*\{document\}/);if(doc)s=doc[1];
 const questions:ImportedQuestion[]=[],warnings:string[]=[];const custom=tokens(s,['idrokquestion']);
 if(custom.length&&tokens(s,['question']).length)throw new Error('Bitta faylda exam va idrokquestion formatlarini aralashtirmang.');
 if(custom.length){for(const t of custom){let p=t.end;const args:string[]=[];for(let k=0;k<7;k++){const g=group(s,p);args.push(g.value);p=g.end}const answer=args[5].trim().toUpperCase();questions.push({text:clean(args[0]),options:args.slice(1,5).map(clean),correct:/^[A-D]$/.test(answer)?answer.charCodeAt(0)-65:-1,explanation:clean(args[6])})}}
 else{
 const starts=tokens(s,['question']);
 if(!starts.length)throw new Error('Savol topilmadi. exam usulidagi \\question va choices yoki \\idrokquestion{...} formatini ishlating.');
 for(let i=0;i<starts.length;i++){
 let part=s.slice(starts[i].end,starts[i+1]?.start??s.length).trim(),points='';
 if(part.startsWith('[')){const g=group(part,0,'[',']');points=g.value;part=part.slice(g.end).trim()}
 const env=part.match(/\\begin\s*\{(choices|oneparchoices|checkboxes|oneparcheckboxes)\}/);
 if(!env)throw new Error(`${i+1}-savolda choices muhiti topilmadi.`);
 const endPattern=new RegExp('\\\\end\\s*\\{'+env[1]+'\\}'),after=part.slice(env.index!+env[0].length),end=after.match(endPattern);
 if(!end)throw new Error(`${i+1}-savol variantlari yopilmagan.`);
 const choiceBody=after.slice(0,end.index),ct=tokens(choiceBody,['choice','CorrectChoice','correctchoice']);
 const marks=ct.map((t,j)=>t.name!=='choice'?j:-1).filter(j=>j>=0);
 if(marks.length>1)throw new Error(`${i+1}-savolda bir nechta to‘g‘ri javob bor. Idrok uchun bittasini belgilang.`);
 const tail=after.slice(end.index!+end[0].length),sol=tail.match(/\\begin\s*\{solution\}(?:\[[^\]]*\])?([\s\S]*?)\\end\s*\{solution\}/),answer=tail.match(/\\answer\s*\{([A-Da-d])\}/);
 if(marks.length&&answer&&marks[0]!==answer[1].toUpperCase().charCodeAt(0)-65)throw new Error(`${i+1}-savolda javob kalitlari bir-biriga zid.`);
 const correct=marks[0]??(answer?answer[1].toUpperCase().charCodeAt(0)-65:-1);
 questions.push({text:clean(part.slice(0,env.index)),options:ct.map((t,j)=>clean(choiceBody.slice(t.end,ct[j+1]?.start??choiceBody.length))),correct,explanation:clean(sol?.[1]||''),points:points||undefined});
 }
 }
 if(questions.length>200)throw new Error('Bir importda 200 tagacha savol.');
 questions.forEach((q,i)=>{if(!q.text||q.text.length>10000)throw new Error(`${i+1}-savol matni bo‘sh yoki juda uzun.`);if(q.options.length!==4||q.options.some(x=>!x||x.length>3000)||new Set(q.options).size!==4)throw new Error(`${i+1}-savolda 4 ta turli, bo‘sh bo‘lmagan variant bo‘lishi kerak.`);if(q.explanation.length>10000)throw new Error(`${i+1}-savol izohi juda uzun.`)});
 if(questions.some(q=>q.correct<0))warnings.push('Javobi belgilanmagan savollarning to‘g‘ri variantini quyida tanlang.');
 if(questions.some(q=>q.points))warnings.push('exam dagi [ball] qiyinlik darajasi emas. Import darajasi quyida alohida belgilanadi.');
 warnings.push('TeX bajarilmadi. Maxsus makroslar yoyilmaydi; formulalar ko‘rinishini tekshiring. Chizma buyruqlari savol matnida kompilyatsiya qilinmaydi.');
 return {questions,warnings,format:custom.length?'idrokquestion':'exam'};
}
export const texTestExample=String.raw`\documentclass{exam}
\usepackage{amsmath}
\begin{document}
\begin{questions}
\question[5] $f(x)=x^3$ funksiyaning hosilasini toping.
\begin{choices}
\choice $x^2$
\CorrectChoice $3x^2$
\choice $3x$
\choice $x^4$
\end{choices}
\begin{solution}
Darajali funksiya qoidasi: $(x^n)'=nx^{n-1}$.
\end{solution}
\question $\int_0^1 x\,dx$ ni hisoblang.
\begin{choices}
\CorrectChoice $\frac12$
\choice $1$
\choice $0$
\choice $2$
\end{choices}
\end{questions}
\end{document}`;
