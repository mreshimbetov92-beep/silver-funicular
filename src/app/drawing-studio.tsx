import {useState,lazy,Suspense} from 'react';
const FullTex=lazy(()=>import('./full-tex-workspace'));
const Quick=lazy(()=>import('./drawing-workspace'));
export default function DrawingStudio(){const [mode,setMode]=useState('full');return <><div className="work-tabs"><button className={mode==='full'?'active':''} onClick={()=>setMode('full')}>To‘liq LaTeX · PDF</button><button className={mode==='quick'?'active':''} onClick={()=>setMode('quick')}>Tez chizma · SVG</button></div><Suspense fallback={<p>Chizma muharriri ochilmoqda…</p>}>{mode==='full'?<FullTex/>:<Quick/>}</Suspense></>}
