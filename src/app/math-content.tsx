import {memo} from 'react';
import {splitMath,renderFormula} from './math-text';
import 'katex/dist/katex.min.css';
export const MathContent=memo(function MathContent({text}:{text:string}){return <span className="math-content">{splitMath(text).map((p,i)=>{if(!p.math)return <span key={i}>{p.text}</span>;try{return <span key={i} className={p.display?'formula-display':'formula-inline'} dangerouslySetInnerHTML={{__html:renderFormula(p.text,p.display)}}/>}catch{return <code key={i} className="formula-error" title="LaTeX ifodasini tekshiring">{p.text}</code>}})}</span>});
