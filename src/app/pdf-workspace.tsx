import {useEffect,useRef,useState} from 'react';
import {Upload,FileText,Trash2,ChevronLeft,ChevronRight,Download,Sparkles,LoaderCircle,BookOpen,Search} from 'lucide-react';
import {listPDFs,savePDF,deletePDF,type PDFRecord} from './pdf-store';

function PDFPreview({record}:{record:PDFRecord}){
  const [page,setPage]=useState(1),[error,setError]=useState(''),[busy,setBusy]=useState(true);
  const canvas=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{setPage(1)},[record.id]);
  useEffect(()=>{
    let stopped=false;let task:{destroy:()=>Promise<void>}|undefined;let render:{cancel:()=>void;promise:Promise<void>}|undefined;
    setBusy(true);setError('');
    (async()=>{const {pdfjs}=await import('./pdf-engine');if(stopped)return;const loading=pdfjs.getDocument({data:new Uint8Array(await record.blob.arrayBuffer())});task=loading;const doc=await loading.promise;if(stopped)return;const sheet=await doc.getPage(Math.min(page,doc.numPages));if(stopped||!canvas.current)return;const viewport=sheet.getViewport({scale:1.25});canvas.current.width=viewport.width;canvas.current.height=viewport.height;render=sheet.render({canvas:canvas.current,viewport});await render.promise;if(!stopped)setBusy(false);})().catch(()=>{if(!stopped){setError('PDF sahifasini ko‘rsatib bo‘lmadi. Faylni yuklab olib oching.');setBusy(false)}});
    return()=>{stopped=true;render?.cancel();void task?.destroy()};
  },[record,page]);
  function download(){const url=URL.createObjectURL(record.blob),a=document.createElement('a');a.href=url;a.download=record.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
  return <section className="study-card pdf-preview"><div className="study-card-head"><div><span className="eyebrow">MATERIALNI O‘QISH</span><h2>{record.name}</h2></div><button className="secondary-button" onClick={download}><Download size={16}/>Yuklab olish</button></div><div className="pdf-pagination"><button className="icon-button" aria-label="Oldingi sahifa" disabled={page<=1} onClick={()=>setPage(p=>p-1)}><ChevronLeft size={18}/></button><span>{page} / {record.pages} sahifa</span><button className="icon-button" aria-label="Keyingi sahifa" disabled={page>=record.pages} onClick={()=>setPage(p=>p+1)}><ChevronRight size={18}/></button></div>{busy&&<p role="status" className="muted"><LoaderCircle className="spin" size={16}/> Sahifa ochilmoqda…</p>}{error&&<p className="study-alert" role="alert">{error}</p>}<div className="pdf-canvas-wrap"><canvas ref={canvas} aria-label={record.name+' — '+page+'-sahifa'}/></div></section>;
}

export default function PDFWorkspace({onAsk}:{onAsk:(id:string,question:string)=>void}){
  const [files,setFiles]=useState<PDFRecord[]>([]),[selected,setSelected]=useState<string|null>(null),[query,setQuery]=useState(''),[busy,setBusy]=useState(false),[progress,setProgress]=useState(''),[error,setError]=useState(''),[confirm,setConfirm]=useState<string|null>(null),[drag,setDrag]=useState(false);
  const input=useRef<HTMLInputElement>(null);
  useEffect(()=>{listPDFs().then(setFiles).catch(e=>setError(e.message))},[]);
  async function upload(file?:File){
    if(!file||busy)return;setError('');
    if(!file.name.toLowerCase().endsWith('.pdf')){setError('Faqat PDF fayl tanlang.');return}
    if(file.size>20*1024*1024){setError('Bitta PDF hajmi 20 MB dan oshmasligi kerak.');return}
    if(files.reduce((s,f)=>s+f.size,0)+file.size>60*1024*1024){setError('Demo kutubxonasi limiti 60 MB. Eski faylni o‘chirib qayta yuklang.');return}
    setBusy(true);setProgress('PDF tekshirilmoqda…');
    let document:{destroy:()=>Promise<void>}|undefined;
    try{
      const buffer=await file.arrayBuffer();
      if(!new TextDecoder().decode(buffer.slice(0,1024)).includes('%PDF-'))throw new Error('Bu fayl haqiqiy PDF formatida emas.');
      const {pdfjs}=await import('./pdf-engine');
      const task=pdfjs.getDocument({data:new Uint8Array(buffer)});document=task;
      const pdf=await task.promise;
      const textPages:string[]=[];let characters=0,truncated=false;
      for(let p=1;p<=Math.min(pdf.numPages,150);p++){
        setProgress(p+' / '+Math.min(pdf.numPages,150)+' sahifadan matn olinmoqda…');
        const content=await (await pdf.getPage(p)).getTextContent();
        const text=content.items.map(item=>'str' in item?item.str+('hasEOL' in item&&item.hasEOL?'\n':' '):'').join('');
        const kept=text.slice(0,Math.max(0,180000-characters));textPages.push(kept);characters+=kept.length;
        if(characters>=180000){truncated=true;break;}
      }
      truncated=truncated||pdf.numPages>textPages.length;
      const record:PDFRecord={id:crypto.randomUUID(),name:file.name.slice(0,240),size:file.size,blob:file,pages:pdf.numPages,textPages,truncated,createdAt:Date.now()};
      await savePDF(record);setFiles(await listPDFs());setSelected(record.id);setProgress('PDF saqlandi.');
    }catch(e){const name=(e as Error).name;setError(name==='PasswordException'?'PDF parol bilan himoyalangan. Parolsiz nusxasini yuklang.':name==='InvalidPDFException'?'PDF buzilgan yoki o‘qib bo‘lmaydi. Boshqa fayl tanlang.':(e as Error).message||'PDFni yuklab bo‘lmadi.');}
    finally{try{await document?.destroy()}catch{/* PDF resources are already released. */}setBusy(false);if(input.current)input.current.value='';}
  }
  async function remove(id:string){try{await deletePDF(id);setFiles(await listPDFs());if(selected===id)setSelected(null);setConfirm(null)}catch(e){setError((e as Error).message)}}
  const active=files.find(f=>f.id===selected),visible=files.filter(f=>f.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  return <div className="study-module"><div className="study-banner"><span className="study-banner-icon"><BookOpen size={28}/></span><div><span className="eyebrow">TALABANING RAQAMLI KUTUBXONASI</span><h2>Materialingizdan o‘rganing.</h2><p>Ma’ruza yoki topshiriqni yuklang, sahifalarni o‘qing va SI yordamida tushunib oling.</p></div></div><div className={'pdf-dropzone '+(drag?'dragging':'')} onDragOver={e=>{e.preventDefault();if(!busy)setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);void upload(e.dataTransfer.files[0])}}><Upload size={28}/><h3>PDF faylni shu yerga tashlang</h3><p>PDF · har bir fayl 20 MB gacha · jami 60 MB</p><input ref={input} className="sr-only" id="pdf-upload" type="file" accept="application/pdf,.pdf" disabled={busy} onChange={e=>void upload(e.target.files?.[0])}/><button className="primary-button" disabled={busy} onClick={()=>input.current?.click()}>{busy?<LoaderCircle size={16} className="spin"/>:<Upload size={16}/>} {busy?'Yuklanmoqda…':'PDF tanlash'}</button><span className="small muted" role="status">{progress}</span></div><p className="study-footnote">Fayllar shu qurilmaning brauzerida saqlanadi. SIga savol yuborilgandagina tanlangan PDFdan matn parchalari OpenAI xizmatiga uzatiladi.</p>{error&&<div className="study-alert" role="alert">{error}</div>}
    <div className="study-card-head"><h2>Mening materiallarim <span className="count-chip">{files.length}</span></h2><label className="study-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Fayl nomini qidirish" aria-label="PDF qidirish"/></label></div>
    {!visible.length?<div className="study-empty"><FileText size={32}/><h3>{files.length?'Qidiruv bo‘yicha fayl topilmadi':'Birinchi materialingizni yuklang'}</h3><p>{files.length?'Boshqa nom bilan qidiring.':'PDFlaringiz shu yerda ko‘rinadi.'}</p></div>:<div className="pdf-grid">{visible.map(file=><article key={file.id} className={'study-card pdf-file '+(file.id===selected?'selected':'')}><span className="pdf-file-icon"><FileText size={23}/></span><h3 title={file.name}>{file.name}</h3><p>{file.pages} sahifa · {(file.size/1024/1024).toFixed(2)} MB</p><span className="pdf-text-status">{file.textPages.some(t=>t.trim())?(file.truncated?'SI uchun matn qisman olindi':'Matn SI uchun tayyor'):'Rasmli PDF · OCR talab qilinadi'}</span><div className="pdf-file-actions"><button className="secondary-button" onClick={()=>setSelected(file.id)}>O‘qish</button><button className="text-button" onClick={()=>onAsk(file.id,'Ushbu materialning asosiy tushunchalarini talaba uchun qisqacha izohlang.')}><Sparkles size={15}/>SIga savol</button><button className="icon-button" aria-label={file.name+' faylini o‘chirish'} onClick={()=>setConfirm(file.id)}><Trash2 size={16}/></button></div>{confirm===file.id&&<div className="delete-confirm"><span>Fayl o‘chirilsinmi?</span><button onClick={()=>void remove(file.id)}>O‘chirish</button><button onClick={()=>setConfirm(null)}>Bekor qilish</button></div>}</article>)}</div>}
    {active&&<PDFPreview key={active.id} record={active}/>}
  </div>;
}
