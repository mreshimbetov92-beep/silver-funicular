import katex from 'katex';
export type MathSegment={text:string;math:boolean;display:boolean};
export function splitMath(source:string):MathSegment[]{
 const parts:MathSegment[]=[];let i=0,start=0;
 while(i<source.length){
  if(source[i]==='\\'&&source[i+1]==='$'){i+=2;continue}
  let open='',close='',display=false;
  if(source.startsWith('$$',i)){open='$$';close='$$';display=true}
  else if(source.startsWith('\\[',i)){open='\\[';close='\\]';display=true}
  else if(source.startsWith('\\(',i)){open='\\(';close='\\)'}
  else if(source[i]==='$'){open='$';close='$'}
  if(!open){i++;continue}
  let end=source.indexOf(close,i+open.length);
  while(end>=0&&close==='$'&&source[end-1]==='\\')end=source.indexOf(close,end+1);
  if(end<0){i+=open.length;continue}
  if(i>start)parts.push({text:source.slice(start,i),math:false,display:false});
  parts.push({text:source.slice(i+open.length,end),math:true,display});i=end+close.length;start=i;
 }
 if(start<source.length)parts.push({text:source.slice(start),math:false,display:false});
 return parts;
}
export function renderFormula(source:string,display=false){return katex.renderToString(source,{displayMode:display,throwOnError:true,trust:false,strict:'ignore',maxExpand:200,maxSize:15,output:'htmlAndMathml',macros:{}})}
export function formulaErrors(text:string){return splitMath(text).flatMap(p=>{if(!p.math)return [];try{renderFormula(p.text,p.display);return []}catch{return ['LaTeX formulani tekshiring: '+p.text.slice(0,120)]}})}
