export type TexExport={source:string;engine:string;assets:{name:string;base64:string}[]};
const encoder=new TextEncoder();
const crcTable=Uint32Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0});
const crc32=(bytes:Uint8Array)=>{let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0};
function header(length:number,fields:[number,number,number][]){const b=new Uint8Array(length),v=new DataView(b.buffer);for(const [offset,n,size]of fields)size===2?v.setUint16(offset,n,true):v.setUint32(offset,n,true);return b}
function join(parts:Uint8Array[]){const b=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let i=0;for(const p of parts){b.set(p,i);i+=p.length}return b}
export function texProjectZip(project:TexExport):Uint8Array{
 if(!project.source.trim()||project.source.length>500000||!['pdflatex','xelatex','lualatex'].includes(project.engine)||project.assets.length>20)throw Error('TeX manba, dvigatel va yordamchi fayllarni tekshiring.');
 const names=new Set(['main.tex','main.pdf','main.log','main.aux']),entries=[{name:'main.tex',bytes:encoder.encode(project.source)}];let total=0;
 for(const a of project.assets){const name=a.name.toLowerCase();if(!/^[A-Za-z0-9_./ -]{1,160}$/.test(a.name)||a.name.startsWith('/')||a.name.split('/').some(p=>['','.','..'].includes(p))||names.has(name)||!/[.](tex|sty|cls|bib|csv|dat|pgf|tikz|pdf|png|jpg|jpeg|eps|ttf|otf|lua)$/i.test(a.name))throw Error('Yordamchi fayl nomi yoki kengaytmasi noto‘g‘ri.');names.add(name);let binary:string;try{binary=atob(a.base64);if(btoa(binary)!==a.base64)throw 0}catch{throw Error('Yordamchi fayl kodlanishi noto‘g‘ri.')}const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));total+=bytes.length;if(total>8*1024*1024)throw Error('Yordamchi fayllar jami 8 MB gacha.');entries.push({name:a.name,bytes})}
 const local:Uint8Array[]=[],central:Uint8Array[]=[];let offset=0;
 for(const entry of entries){const name=encoder.encode(entry.name),bytes=entry.bytes,crc=crc32(bytes);const h=header(30,[[0,0x04034b50,4],[4,20,2],[6,0x800,2],[12,33,2],[14,crc,4],[18,bytes.length,4],[22,bytes.length,4],[26,name.length,2]]);local.push(h,name,bytes);central.push(header(46,[[0,0x02014b50,4],[4,20,2],[6,20,2],[8,0x800,2],[14,33,2],[16,crc,4],[20,bytes.length,4],[24,bytes.length,4],[28,name.length,2],[42,offset,4]]),name);offset+=h.length+name.length+bytes.length}
 const directory=join(central),end=header(22,[[0,0x06054b50,4],[8,entries.length,2],[10,entries.length,2],[12,directory.length,4],[16,offset,4]]);return join([...local,directory,end]);
}
export function overleafFields(project:TexExport){const bytes=texProjectZip(project);let binary='';for(let i=0;i<bytes.length;i+=16384)binary+=String.fromCharCode(...bytes.subarray(i,i+16384));return {snip_uri:'data:application/zip;base64,'+btoa(binary),engine:project.engine,main_document:'main.tex'}}
