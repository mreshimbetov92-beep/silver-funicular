export type Scope={x:number;a:number;b:number;c:number;t:number};
type Node={kind:'number';value:number}|{kind:'variable';name:keyof Scope}|{kind:'unary';sign:string;child:Node}|{kind:'binary';op:string;left:Node;right:Node}|{kind:'call';name:string;args:Node[]};
type Token={value:string;number?:number};
const functions:Record<string,{min:number;max:number;fn:(...xs:number[])=>number}>={};
const add=(name:string,fn:(...xs:number[])=>number,min=1,max=min)=>functions[name]={fn,min,max};
for(const name of ['sin','cos','tan','asin','acos','atan','sinh','cosh','tanh','asinh','acosh','atanh','exp','sqrt','cbrt','abs','floor','ceil','round','sign','log2','log10'] as const)add(name,Math[name]);
add('ln',Math.log);add('log',Math.log);add('pow',Math.pow,2);add('atan2',Math.atan2,2);add('min',Math.min,2,8);add('max',Math.max,2,8);add('root',(x,n)=>n===0?NaN:x<0&&Number.isInteger(n)&&Math.abs(n%2)===1?-Math.pow(-x,1/n):Math.pow(x,1/n),2);
add('sec',x=>1/Math.cos(x));add('csc',x=>1/Math.sin(x));add('cot',x=>1/Math.tan(x));add('if',()=>0,3);
export function normalizeExpression(source:string){
 let s=source.trim().replace(/^(?:y|[fg]\(x\))\s*=/,'').replace(/^\$+|\$+$/g,'').replace(/\\left|\\right/g,'').replace(/[−–]/g,'-').replace(/×|·|\\cdot|\\times/g,'*').replace(/π|\\pi/g,'pi').replace(/²/g,'^2').replace(/³/g,'^3');
 function group(start:number):[string,number]{while(/\s/.test(s[start]||'!'))start++;if(s[start]!=='{')throw new Error('LaTeXda {…} guruhini tekshiring.');let depth=1,i=start+1;for(;i<s.length&&depth;i++){if(s[i]==='{')depth++;if(s[i]==='}')depth--}if(depth)throw new Error('LaTeX qavsi yopilmagan.');return [s.slice(start+1,i-1),i]}
 let count=0;while(/\\(?:frac|sqrt)/.test(s)){if(++count>40)throw new Error('Ifoda juda murakkab.');const m=/\\(frac|sqrt)/.exec(s)!;const [first,end]=group(m.index+m[0].length);if(m[1]==='frac'){const [second,last]=group(end);s=s.slice(0,m.index)+'(('+first+')/('+second+'))'+s.slice(last)}else{s=s.slice(0,m.index)+'sqrt('+first+')'+s.slice(end)}}
 s=s.replace(/\\(sin|cos|tan|ln|log|exp|sinh|cosh|tanh|arcsin|arccos|arctan)\b/g,'$1').replace(/arcsin/g,'asin').replace(/arccos/g,'acos').replace(/arctan/g,'atan').replace(/\\[,;! ]/g,'').replace(/{/g,'(').replace(/}/g,')');
 return s;
}
export function compileExpression(source:string):(scope:Scope)=>number{
 if(!source.trim()||source.length>600)throw new Error('1–600 belgili funksiya ifodasini kiriting.');
 const s=normalizeExpression(source),tokens:Token[]=[];let offset=0;
 while(offset<s.length){const rest=s.slice(offset);if(/^\s/.test(rest)){offset++;continue}const n=/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/.exec(rest);if(n){const value=Number(n[0]);if(!Number.isFinite(value))throw new Error('Son juda katta.');tokens.push({value:n[0],number:value});offset+=n[0].length;continue}const id=/^[a-zA-Z][a-zA-Z0-9]*/.exec(rest);if(id){tokens.push({value:id[0].toLowerCase()});offset+=id[0].length;continue}const op=/^(<=|>=|==|!=|[+*/^(),<>-])/.exec(rest);if(!op)throw new Error(`“${s[offset]}” belgisi qo‘llanilmaydi. Ko‘paytirish uchun * yozing.`);tokens.push({value:op[0]});offset+=op[0].length}
 if(tokens.length>300)throw new Error('Ifoda juda murakkab.');let pos=0,depth=0;
 const peek=()=>tokens[pos]?.value;
 function take(value:string){if(peek()!==value)throw new Error(`“${value}” kutilgan. Qavslarni tekshiring.`);pos++}
 function primary():Node{if(++depth>50)throw new Error('Qavslar juda chuqur.');try{const token=tokens[pos++];if(!token)throw new Error('Ifoda tugallanmagan.');if(token.number!==undefined)return {kind:'number',value:token.number};if(token.value==='('){const node=comparison();take(')');return node}if(['x','a','b','c','t'].includes(token.value))return {kind:'variable',name:token.value as keyof Scope};if(token.value==='pi'||token.value==='e')return {kind:'number',value:token.value==='pi'?Math.PI:Math.E};const fn=Object.hasOwn(functions,token.value)?functions[token.value]:undefined;if(fn){take('(');const args:Node[]=[comparison()];while(peek()===','){pos++;args.push(comparison())}take(')');if(args.length<fn.min||args.length>fn.max)throw new Error(`${token.value}: ${fn.min===fn.max?fn.min:fn.min+'–'+fn.max} argument kerak.`);return {kind:'call',name:token.value,args}}throw new Error(`“${token.value}” tanilmadi. O‘zgaruvchilar: x, a, b, c, t.`)}finally{depth--}}
 function power():Node{let node=primary();if(peek()==='^'){pos++;node={kind:'binary',op:'^',left:node,right:unary()}}return node}
 function unary():Node{if(peek()==='-'||peek()==='+'){const sign=tokens[pos++].value;return {kind:'unary',sign,child:unary()}}return power()}
 function product():Node{let node=unary();while(true){const op=peek();if(op==='*'||op==='/'){pos++;node={kind:'binary',op,left:node,right:unary()}}else if(op&&(/^[a-z]/.test(op)||op==='('||tokens[pos]?.number!==undefined)){node={kind:'binary',op:'*',left:node,right:unary()}}else break}return node}
 function sum():Node{let node=product();while(peek()==='+'||peek()==='-'){const op=tokens[pos++].value;node={kind:'binary',op,left:node,right:product()}}return node}
 function comparison():Node{let node=sum();if(['<','>','<=','>=','==','!='].includes(peek())){const op=tokens[pos++].value;node={kind:'binary',op,left:node,right:sum()}}return node}
 const tree=comparison();if(pos!==tokens.length)throw new Error('Ifodada ortiqcha belgi yoki qavs bor.');
 function evaluate(node:Node,scope:Scope):number{switch(node.kind){case 'number':return node.value;case 'variable':return scope[node.name];case 'unary':return (node.sign==='-'?-1:1)*evaluate(node.child,scope);case 'call':if(node.name==='if'){const condition=evaluate(node.args[0],scope);return Number.isFinite(condition)?evaluate(node.args[condition?1:2],scope):NaN}return functions[node.name].fn(...node.args.map(n=>evaluate(n,scope)));case 'binary':{const a=evaluate(node.left,scope),b=evaluate(node.right,scope);if(!Number.isFinite(a)||!Number.isFinite(b))return NaN;switch(node.op){case '+':return a+b;case '-':return a-b;case '*':return a*b;case '/':return b===0?NaN:a/b;case '^':return Math.pow(a,b);case '<':return Number(a<b);case '>':return Number(a>b);case '<=':return Number(a<=b);case '>=':return Number(a>=b);case '==':return Number(a===b);case '!=':return Number(a!==b)}}}return NaN}
 return scope=>{const value=evaluate(tree,scope);return Number.isFinite(value)?value:NaN};
}
export type WindowBounds={xmin:number;xmax:number;ymin:number;ymax:number};
export function validBounds(b:WindowBounds){return Object.values(b).every(v=>Number.isFinite(v)&&Math.abs(v)<=1e6)&&b.xmax-b.xmin>=1e-5&&b.ymax-b.ymin>=1e-5}
export function sampleSegments(fn:(s:Scope)=>number,parameters:Omit<Scope,'x'>,bounds:WindowBounds,count=1000){
 if(!validBounds(bounds))throw new Error('Grafik chegaralarini tekshiring.');
 const segments:{x:number;y:number}[][]=[];let segment:{x:number;y:number}[]=[];const yrange=bounds.ymax-bounds.ymin;
 for(let i=0;i<=count;i++){const x=bounds.xmin+(bounds.xmax-bounds.xmin)*i/count,y=fn({...parameters,x}),prev=segment.at(-1);
  let broken=!Number.isFinite(y)||y<bounds.ymin-yrange*.1||y>bounds.ymax+yrange*.1;
  if(prev&&!broken){const mid=fn({...parameters,x:(x+prev.x)/2}),deviation=Math.abs(mid-(y+prev.y)/2);broken=!Number.isFinite(mid)||deviation>Math.max(yrange*.025,Math.abs(y-prev.y)*.35)}
  if(broken){if(segment.length>1)segments.push(segment);segment=[];if(Number.isFinite(y)&&y>=bounds.ymin&&y<=bounds.ymax)segment.push({x,y})}else segment.push({x,y});
 }
 if(segment.length>1)segments.push(segment);return segments;
}
export function numericDerivative(fn:(s:Scope)=>number,scope:Scope){const h=1e-5*Math.max(1,Math.abs(scope.x));const a=fn({...scope,x:scope.x-h}),b=fn({...scope,x:scope.x+h});return Number.isFinite(a)&&Number.isFinite(b)?(b-a)/(2*h):NaN}
