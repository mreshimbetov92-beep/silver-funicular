import {compileExpression,sampleSegments,type WindowBounds} from './graph-engine.ts';
export type DrawStyle={stroke:string;fill:string;width:number;dash:string;opacity:number;arrow:string;step:number};
export type Primitive={kind:'path';points:{x:number;y:number}[];closed?:boolean;style:DrawStyle}|{kind:'rect';x:number;y:number;width:number;height:number;style:DrawStyle}|{kind:'ellipse';x:number;y:number;rx:number;ry:number;style:DrawStyle};
export type TikzDrawing={shapes:Primitive[];labels:{x:number;y:number;text:string;color:string}[]};
const colors:Record<string,string>={red:'#d54949',blue:'#3578c5',green:'#468753',orange:'#d18c35',gray:'#999999',black:'#252434',purple:'#8061c8',white:'#ffffff',cyan:'#2e9dab',brown:'#976740',yellow:'#d1ad29'};
const num='[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)';
function numeric(s:string){const n=Number(s);if(!Number.isFinite(n)||Math.abs(n)>1000)throw new Error('Koordinatalar −1000…1000 chegarasida bo‘lsin.');return n}
function coordinate(source:string){const m=new RegExp('^\\(\\s*('+num+')\\s*,\\s*('+num+')\\s*\\)').exec(source.trim());if(!m)throw new Error('Koordinata (x,y) ko‘rinishida bo‘lsin.');return {point:{x:numeric(m[1]),y:numeric(m[2])},rest:source.trim().slice(m[0].length).trim()}}
function options(source:string,fillMode:boolean){const style:DrawStyle={stroke:fillMode?'none':colors.black,fill:fillMode?colors.purple:'none',width:2,dash:'',opacity:1,arrow:'',step:1};let rest=source.trim();if(rest[0]!=='[')return {style,rest};const end=rest.indexOf(']');if(end<0)throw new Error('Uslub qavsi yopilmagan.');for(const raw of rest.slice(1,end).split(',').map(x=>x.trim()).filter(Boolean)){
 if(colors[raw]){style.stroke=fillMode?'none':colors[raw];if(fillMode)style.fill=colors[raw]}
 else if(['thin','thick','very thick','ultra thick'].includes(raw))style.width=({'thin':1,'thick':2.5,'very thick':3.5,'ultra thick':5})[raw]!;
 else if(raw==='dashed')style.dash='8 5';else if(raw==='dotted')style.dash='2 4';
 else if(['->','<-','<->'].includes(raw))style.arrow=raw;
 else if(raw.startsWith('fill=')){const c=raw.slice(5);if(c!=='none'&&!colors[c])throw new Error('Fill rangi tanilmadi.');style.fill=c==='none'?'none':colors[c]}
 else if(raw.startsWith('draw=')){const c=raw.slice(5);if(c!=='none'&&!colors[c])throw new Error('Draw rangi tanilmadi.');style.stroke=c==='none'?'none':colors[c]}
 else if(raw.startsWith('opacity=')){style.opacity=Number(raw.slice(8));if(!Number.isFinite(style.opacity)||style.opacity<0||style.opacity>1)throw new Error('Opacity 0…1 bo‘lsin.')}
 else if(raw.startsWith('step=')){style.step=Number(raw.slice(5));if(style.step<.1||style.step>100||!Number.isFinite(style.step))throw new Error('Grid qadami 0.1…100 bo‘lsin.')}
 else throw new Error('Qo‘llab-quvvatlanmaydigan uslub: '+raw);
 }return {style,rest:rest.slice(end+1).trim()}}
export function parseTikz(input:string,bounds:WindowBounds):TikzDrawing{
 if(input.length>20000)throw new Error('TikZ matni 20 000 belgidan oshmasin.');
 let source=input.replace(/(?<!\\)%[^\n]*/g,'').trim();
 if(source.includes('\\begin{tikzpicture}')){const m=/\\begin\{tikzpicture\}([\s\S]*?)\\end\{tikzpicture\}/.exec(source);if(!m)throw new Error('tikzpicture muhiti yopilmagan.');source=m[1].trim()}
 if(source.startsWith('['))throw new Error('Muhit parametrlari o‘rniga quyidagi ko‘rinish chegaralarini sozlang.');
 const commands:string[]=[];let depth=0,start=0;for(let i=0;i<source.length;i++){if(source[i]==='{')depth++;if(source[i]==='}')depth--;if(depth<0)throw new Error('Qavslarni tekshiring.');if(source[i]===';'&&depth===0){commands.push(source.slice(start,i).trim());start=i+1}}if(depth||source.slice(start).trim())throw new Error('Har buyruqni ; bilan tugating va qavslarni yoping.');if(commands.length>150)throw new Error('150 tagacha buyruq kiriting.');
 const drawing:TikzDrawing={shapes:[],labels:[]};
 for(const command of commands.filter(Boolean)){
  const cmd=/^\\(draw|filldraw|fill|node)\b/.exec(command);if(!cmd)throw new Error('Qo‘llab-quvvatlanadigan buyruqlar: \\draw, \\fill, \\filldraw, \\node.');
  const {style,rest}=options(command.slice(cmd[0].length),cmd[1]==='fill');
  if(cmd[1]==='filldraw'&&style.fill==='none'&&!command.includes('fill=none'))style.fill=style.stroke;
  if(cmd[1]==='node'){const m=/^at\s*(\([^)]+\))\s*\{([\s\S]*)\}$/.exec(rest);if(!m)throw new Error('Node: \\node at (x,y) {Matn};');const {point}=coordinate(m[1]);if(m[2].length>1000)throw new Error('Yorliq matni juda uzun.');drawing.labels.push({...point,text:m[2],color:style.stroke==='none'?colors.black:style.stroke});continue}
  if(rest.startsWith('plot')){
   const m=/^plot\s*\[domain=([^:\]]+):([^,\]]+)(?:,\s*samples=(\d+))?\]\s*\(\s*\\x\s*,\s*\{([^{}]+)\}\s*\)$/.exec(rest);if(!m)throw new Error('Plot: plot[domain=-3:3,samples=150] (\\x,{\\x^2});');
   const xmin=numeric(m[1]),xmax=numeric(m[2]),count=Math.max(20,Math.min(500,Number(m[3]||150)));if(xmin>=xmax)throw new Error('Plot domain chegarasini tekshiring.');
   const expression=m[4].replace(/\\x\b/g,'x');if(/sin|cos|tan/.test(expression))throw new Error('Bu TikZ previewda trigonometrik plot hali yo‘q. Grafik laboratoriyasidan foydalaning.');
   const fn=compileExpression(expression);const segments=sampleSegments(fn,{a:1,b:1,c:0,t:0},{...bounds,xmin,xmax},count);for(const points of segments)drawing.shapes.push({kind:'path',points,style});continue;
  }
  const first=coordinate(rest),a=first.point;let tail=first.rest;
  if(tail.startsWith('circle')){const m=new RegExp('^circle\\s*\\(\\s*('+num+')(?:cm)?\\s*\\)$').exec(tail);if(!m||Number(m[1])<=0)throw new Error('Circle: (x,y) circle (r); r>0.');drawing.shapes.push({kind:'ellipse',...a,rx:numeric(m[1]),ry:numeric(m[1]),style});continue}
  if(tail.startsWith('ellipse')){const m=new RegExp('^ellipse\\s*\\(\\s*('+num+')\\s+and\\s+('+num+')\\s*\\)$').exec(tail);if(!m||Number(m[1])<=0||Number(m[2])<=0)throw new Error('Ellipse: (x,y) ellipse (rx and ry);');drawing.shapes.push({kind:'ellipse',...a,rx:numeric(m[1]),ry:numeric(m[2]),style});continue}
  if(tail.startsWith('rectangle')||tail.startsWith('grid')){const grid=tail.startsWith('grid'),second=coordinate(tail.slice(grid?4:9));if(second.rest)throw new Error('Shakldan keyin ortiqcha matn bor.');const b=second.point,x=Math.min(a.x,b.x),y=Math.min(a.y,b.y),width=Math.abs(b.x-a.x),height=Math.abs(b.y-a.y);if(grid){if(width/style.step+height/style.step>300)throw new Error('Grid juda zich.');for(let v=x;v<=x+width+1e-8;v+=style.step)drawing.shapes.push({kind:'path',points:[{x:v,y},{x:v,y:y+height}],style});for(let v=y;v<=y+height+1e-8;v+=style.step)drawing.shapes.push({kind:'path',points:[{x,y:v},{x:x+width,y:v}],style})}else drawing.shapes.push({kind:'rect',x,y,width,height,style});continue}
  const points=[a];let closed=false;while(tail){if(!tail.startsWith('--'))throw new Error('Nuqtalarni -- bilan ulang.');tail=tail.slice(2).trim();if(tail==='cycle'){closed=true;break}const next=coordinate(tail);points.push(next.point);tail=next.rest;if(points.length>300)throw new Error('Yo‘l juda uzun.')}if(points.length<2)throw new Error('Chiziq uchun kamida 2 nuqta kiriting.');drawing.shapes.push({kind:'path',points,closed,style});
 }
 if(drawing.shapes.length>3000)throw new Error('Chizma juda murakkab: 3000 shaklgacha.');
 if(!drawing.shapes.length&&!drawing.labels.length)throw new Error('Chizma buyruqlarini kiriting.');return drawing;
}
export const tikzPresets={
 triangle:String.raw`\begin{tikzpicture}
\draw[gray,step=1] (-1,-1) grid (5,4);
\draw[blue,thick,fill=cyan,opacity=0.7] (0,0) -- (4,0) -- (1,3) -- cycle;
\node at (0,-0.5) {$A$};
\node at (4,-0.5) {$B$};
\node at (1,3.5) {$C$};
\node at (2,1) {$S=\frac{ah}{2}$};
\end{tikzpicture}`,
 circle:String.raw`\begin{tikzpicture}
\draw[blue,thick] (0,0) circle (2);
\draw[purple,->] (0,0) -- (2,0);
\node at (1,0.5) {$r$};
\node at (0,-2.6) {$S=\pi r^2$};
\end{tikzpicture}`,
 graph:String.raw`\begin{tikzpicture}
\draw[gray,step=1] (-4,-1) grid (4,5);
\draw[->] (-4,0) -- (4,0);
\draw[->] (0,-1) -- (0,5);
\draw[purple,thick] plot[domain=-2:2,samples=180] (\x,{\x^2});
\node at (2.8,3.8) {$y=x^2$};
\end{tikzpicture}`
};
export function completeTex(source:string){if(source.includes('\\documentclass'))return source;return '\\documentclass[tikz,border=8pt]{standalone}\n\\usepackage{amsmath}\n\\begin{document}\n'+source+'\n\\end{document}\n'}
