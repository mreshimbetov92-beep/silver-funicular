// Real rational functions. Coefficients are stored in ascending degree order.
// No eval / Function: input is parsed into bounded polynomial arithmetic.
export type Poly=number[];
type Rational={p:Poly;q:Poly;excluded:Poly[]};
export type Segment={a:number;b:number;sign:number};
export type RangePart={lo:number;hi:number;left:boolean;right:boolean};
const EPS=1e-8;
export const trim=(p:Poly):Poly=>{const a=[...p];while(a.length>1&&Math.abs(a.at(-1)!)<1e-12)a.pop();return a.length?a:[0]};
const zero=(p:Poly)=>trim(p).length===1&&Math.abs(p[0])<1e-12;
export const value=(p:Poly,x:number)=>p.reduceRight((s,c)=>s*x+c,0);
const add=(a:Poly,b:Poly,sign=1)=>trim(Array.from({length:Math.max(a.length,b.length)},(_,i)=>(a[i]||0)+sign*(b[i]||0)));
const mul=(a:Poly,b:Poly)=>{const p=Array(a.length+b.length-1).fill(0);a.forEach((c,i)=>b.forEach((d,j)=>p[i+j]+=c*d));return trim(p)};
const scale=(a:Poly,c:number)=>trim(a.map(x=>x*c));
export const derivative=(p:Poly)=>trim(p.slice(1).map((c,i)=>c*(i+1)));
const close=(a:number,b:number)=>a===b||Math.abs(a-b)<EPS*Math.max(1,Math.abs(a),Math.abs(b));
const unique=(a:number[])=>a.sort((a,b)=>a-b).filter((x,i,s)=>!i||!close(x,s[i-1]));
const contains=(points:number[],x:number)=>points.some(p=>close(p,x));
const same=(a:Poly,b:Poly)=>zero(add(a,b,-1));

export function parseFunction(source:string):Rational{
  const text=source.toLowerCase().replace(/\s/g,'').replace(/[−–]/g,'-').replace(/²/g,'^2').replace(/³/g,'^3').replace(/⁴/g,'^4');
  if(text.length>160||!text)throw new Error('Funksiyani 160 belgigacha yozing. Masalan: (x^2+1)/(x-1).');
  const raw=text.match(/(?:\d+(?:\.\d*)?|\.\d+)|x|[()+\-*/^]/g)||[];
  if(raw.join('')!==text)throw new Error('Bu hisoblagich ko‘phad va ratsional funksiyalarni qo‘llaydi: x, sonlar, + − * / ^ va qavslar. sin, ln kabi funksiyalarni SI yordamchisida muhokama qiling.');
  const tokens:string[]=[];
  raw.forEach((token,i)=>{const previous=raw[i-1];if(i&&(/^(x|\)|\d|\.)/.test(previous))&&(token==='x'||token==='('))tokens.push('*');tokens.push(token)});
  let position=0;
  const constant=(n:number):Rational=>({p:[n],q:[1],excluded:[]});
  const checked=(r:Rational)=>{if(r.p.length>7||r.q.length>7||[...r.p,...r.q].some(x=>!Number.isFinite(x)||Math.abs(x)>1e8))throw new Error('Demo chegarasi: surat va maxraj darajasi 6 gacha, koeffitsiyentlar moduli 10⁸ gacha.');return r};
  function operation(a:Rational,b:Rational,op:string):Rational{
    const excluded=[...a.excluded,...b.excluded,a.q,b.q];
    if(op==='+')return checked({p:add(mul(a.p,b.q),mul(b.p,a.q)),q:mul(a.q,b.q),excluded});
    if(op==='-')return checked({p:add(mul(a.p,b.q),mul(b.p,a.q),-1),q:mul(a.q,b.q),excluded});
    if(op==='*')return checked({p:mul(a.p,b.p),q:mul(a.q,b.q),excluded});
    if(zero(b.p))throw new Error('Nolga bo‘lish aniqlanmagan.');
    return checked({p:mul(a.p,b.q),q:mul(a.q,b.p),excluded:[...excluded,b.p]});
  }
  function atom():Rational{
    const token=tokens[position++];
    if(token==='x')return {p:[0,1],q:[1],excluded:[]};
    if(token==='('){const r=sum();if(tokens[position++]!==')')throw new Error('Qavslarni tekshiring.');return r}
    if(token&&/^(\d|\.)/.test(token)){const n=Number(token);if(!Number.isFinite(n))throw new Error('Sonni tekshiring.');return checked(constant(n))}
    throw new Error('Ifoda tugallanmagan. Masalan: x^3-3*x.');
  }
  function power():Rational{
    let r=atom();
    if(tokens[position]==='^'){
      position++;let sign=1;if(tokens[position]==='-'){sign=-1;position++}else if(tokens[position]==='+')position++;
      const token=tokens[position++];if(!token||!/^\d+$/.test(token)||Number(token)>6)throw new Error('Daraja −6 dan 6 gacha butun son bo‘lsin.');
      const n=sign*Number(token);let result:Rational={p:[1],q:[1],excluded:[...r.excluded,r.q]};
      if(n<0){if(zero(r.p))throw new Error('Nolning manfiy darajasi aniqlanmagan.');r={p:r.q,q:r.p,excluded:[...r.excluded,r.q,r.p]}}
      for(let i=0;i<Math.abs(n);i++)result=operation(result,r,'*');r=result;
    }
    return r;
  }
  function unary():Rational{if(tokens[position]==='-'){position++;const r=unary();return {...r,p:scale(r.p,-1)}}if(tokens[position]==='+'){position++;return unary()}return power()}
  function product():Rational{let r=unary();while(tokens[position]==='*'||tokens[position]==='/'){const op=tokens[position++];r=operation(r,unary(),op)}return r}
  function sum():Rational{let r=product();while(tokens[position]==='+'||tokens[position]==='-'){const op=tokens[position++];r=operation(r,product(),op)}return r}
  const result=sum();if(position!==tokens.length)throw new Error('Ifodani tekshiring. Ko‘paytirish uchun * belgisidan foydalaning.');
  return {...checked(result),excluded:[...result.excluded,result.q]};
}

function smallAt(p:Poly,x:number){const size=p.reduce((sum,c,i)=>sum+Math.abs(c)*Math.abs(x)**i,0);return Math.abs(value(p,x))<=1e-9*Math.max(1,size)}
export function realRoots(input:Poly):number[]{
  const p=trim(input),degree=p.length-1;
  if(degree===0)return [];
  if(degree===1){const x=-p[0]/p[1];return [Object.is(x,-0)?0:x]}
  const bound=1+Math.max(...p.slice(0,-1).map(c=>Math.abs(c/p[degree])));
  if(bound>1e6)throw new Error('Koeffitsiyentlar masshtabi juda katta. Ifodani soddalashtirib kiriting.');
  const critical=realRoots(derivative(p)).filter(x=>x>-bound&&x<bound),cuts=[-bound,...critical,bound],roots=critical.filter(x=>smallAt(p,x));
  for(let i=0;i<cuts.length-1;i++){
    let lo=cuts[i],hi=cuts[i+1],fl=value(p,lo),fh=value(p,hi);
    if(smallAt(p,lo)||smallAt(p,hi)||Math.sign(fl)===Math.sign(fh))continue;
    for(let j=0;j<100;j++){const mid=(lo+hi)/2,fm=value(p,mid);if(Math.sign(fm)===Math.sign(fl)){lo=mid;fl=fm}else{hi=mid;fh=fm}}
    roots.push((lo+hi)/2);
  }
  return unique(roots.map(x=>Math.abs(x)<1e-10?0:x));
}
export function numberText(x:number):string{if(x===Infinity)return '+∞';if(x===-Infinity)return '−∞';if(Math.abs(x)<1e-7)return '0';return Number(x.toPrecision(7)).toString().replace(/e\+/,'·10^').replace(/e-/,'·10^-')}
export function polynomialText(p:Poly):string{
  const terms:string[]=[];for(let i=p.length-1;i>=0;i--){const c=p[i];if(Math.abs(c)<1e-10)continue;const sign=c<0?'−':(terms.length?'+':'');const magnitude=Math.abs(c);const coefficient=i&&close(magnitude,1)?'':numberText(magnitude);terms.push(sign+coefficient+(i?(coefficient?'·':'')+'x'+(i>1?'^'+i:''):''))}return terms.join(' ')||'0';
}
export function intervalText(a:number,b:number,left=false,right=false){if(close(a,b))return '{'+numberText(a)+'}';return (left&&Number.isFinite(a)?'[':'(')+numberText(a)+'; '+numberText(b)+(right&&Number.isFinite(b)?']':')')}
function midpoint(a:number,b:number){return a===-Infinity?(b===Infinity?0:b-Math.max(1,Math.abs(b)*0.5)):b===Infinity?a+Math.max(1,Math.abs(a)*0.5):(a+b)/2}
function signs(cuts:number[],fn:(x:number)=>number):Segment[]{const points=[-Infinity,...unique(cuts),Infinity];return points.slice(0,-1).map((a,i)=>({a,b:points[i+1],sign:Math.sign(fn(midpoint(a,points[i+1])))}))}
function orderAt(p:Poly,x:number):{order:number;coefficient:number}{let order=0,q=p,factorial=1;while(q.length>1&&smallAt(q,x)){q=derivative(q);order++;factorial*=order}return {order,coefficient:value(q,x)/factorial}}
function division(a:Poly,b:Poly){let remainder=[...a];const quotient=Array(Math.max(1,a.length-b.length+1)).fill(0);while(!zero(remainder)&&remainder.length>=b.length){const degree=remainder.length-b.length,c=remainder.at(-1)!/b.at(-1)!;quotient[degree]=c;remainder=add(remainder,[...Array(degree).fill(0),...scale(b,c)],-1)}return {quotient:trim(quotient),remainder}}

export type FunctionAnalysis=ReturnType<typeof analyzeFunction>;
export function analyzeFunction(expression:string){
  const {p,q,excluded}=parseFunction(expression);
  const excludedPoints=unique(excluded.flatMap(realRoots));
  const n1=add(mul(derivative(p),q),mul(p,derivative(q)),-1),n2=add(mul(derivative(n1),q),scale(mul(n1,derivative(q)),2),-1);
  const f=(x:number)=>contains(excludedPoints,x)?NaN:value(p,x)/value(q,x);
  const first=(x:number)=>value(n1,x)/value(q,x)**2;
  const second=(x:number)=>value(n2,x)/value(q,x)**3;
  const roots=realRoots(p).filter(x=>!contains(excludedPoints,x));
  const critical=realRoots(n1).filter(x=>!contains(excludedPoints,x));
  const bends=realRoots(n2).filter(x=>!contains(excludedPoints,x));
  const monotonic=signs([...critical,...excludedPoints],first),concavity=signs([...bends,...excludedPoints],second),signIntervals=signs([...roots,...excludedPoints],x=>value(p,x)/value(q,x));
  const extrema=critical.flatMap(x=>{const left=monotonic.find(s=>close(s.b,x))?.sign,right=monotonic.find(s=>close(s.a,x))?.sign;return left===1&&right===-1?[{x,y:f(x),kind:'Maksimum'}]:left===-1&&right===1?[{x,y:f(x),kind:'Minimum'}]:[]});
  const inflections=bends.filter(x=>{const l=concavity.find(s=>close(s.b,x))?.sign,r=concavity.find(s=>close(s.a,x))?.sign;return !!l&&!!r&&l!==r}).map(x=>({x,y:f(x)}));
  function limitAt(x:number,side:number):number{
    if(!Number.isFinite(x)){
      if(zero(p))return 0;const diff=p.length-q.length,ratio=p.at(-1)!/q.at(-1)!;
      return diff<0?0:diff===0?ratio:Math.sign(ratio)*(x===-Infinity&&diff%2?-1:1)*Infinity;
    }
    if(!smallAt(q,x))return value(p,x)/value(q,x);
    if(zero(p))return 0;
    const numerator=orderAt(p,x),denominator=orderAt(q,x),diff=numerator.order-denominator.order,ratio=numerator.coefficient/denominator.coefficient;
    return diff>0?0:diff===0?ratio:Math.sign(ratio)*(side<0&&Math.abs(diff)%2?-1:1)*Infinity;
  }
  const discontinuities=excludedPoints.map(x=>{const left=limitAt(x,-1),right=limitAt(x,1);return {x,left,right,kind:Number.isFinite(left)&&Number.isFinite(right)?'Bartaraf qilinadigan uzilish':'Vertikal asimptota'}});
  const poles=discontinuities.filter(d=>d.kind==='Vertikal asimptota').map(d=>d.x);
  const negative=(a:Poly)=>a.map((v,i)=>i%2?-v:v);
  const symmetricDomain=excludedPoints.every(x=>contains(excludedPoints,-x));
  const parity=symmetricDomain&&zero(p)?'Juft va toq':symmetricDomain&&same(mul(negative(p),q),mul(p,negative(q)))?'Juft':symmetricDomain&&same(mul(negative(p),q),scale(mul(p,negative(q)),-1))?'Toq':'Juft ham, toq ham emas';
  const div=division(p,q);const quotient=p.length<q.length?[0]:div.quotient;
  const asymptote=polynomialText(quotient),asymptoteKind=quotient.length===1?'Gorizontal':quotient.length===2?'Qiya':'Ko‘phadli yaqinlashish';
  // Image of each monotone interval, then union. This also accounts for removable holes.
  const pieces:RangePart[]=monotonic.map(s=>{
    if(!s.sign){const y=f(midpoint(s.a,s.b));return {lo:y,hi:y,left:true,right:true}}
    const ya=limitAt(s.a,1),yb=limitAt(s.b,-1),ca=Number.isFinite(s.a)&&!contains(excludedPoints,s.a),cb=Number.isFinite(s.b)&&!contains(excludedPoints,s.b);
    return ya<=yb?{lo:ya,hi:yb,left:ca,right:cb}:{lo:yb,hi:ya,left:cb,right:ca};
  }).sort((a,b)=>a.lo-b.lo||Number(b.left)-Number(a.left));
  const range:RangePart[]=[];
  for(const next of pieces){const last=range.at(-1);if(!last){range.push({...next});continue}if(next.lo<last.hi&&!close(next.lo,last.hi)||close(next.lo,last.hi)&&(last.right||next.left)){if(next.hi>last.hi&&!close(next.hi,last.hi)){last.hi=next.hi;last.right=next.right}else if(close(next.hi,last.hi))last.right=last.right||next.right;}else range.push({...next})}
  return {expression,p,q,f,first,second,domain:excludedPoints.length?'ℝ \\ {'+excludedPoints.map(numberText).join('; ')+'}':'ℝ',excludedPoints,roots,allZeros:zero(p),critical,monotonic,concavity,signIntervals,extrema,inflections,discontinuities,poles,parity,range,constant:zero(n1),atZero:f(0),leftInfinity:limitAt(-Infinity,-1),rightInfinity:limitAt(Infinity,1),firstText:'('+polynomialText(n1)+') / ('+polynomialText(q)+')²',secondText:'('+polynomialText(n2)+') / ('+polynomialText(q)+')³',asymptote,asymptoteKind,hasRemainder:!zero(div.remainder),isPolynomial:q.length===1};
}
