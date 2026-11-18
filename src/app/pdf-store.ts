export type PDFRecord = { id:string; name:string; size:number; blob:Blob; pages:number; textPages:string[]; truncated:boolean; createdAt:number };
const database = () => new Promise<IDBDatabase>((resolve,reject) => {
  const request = indexedDB.open('idrok-materials-v2',1);
  request.onupgradeneeded = () => request.result.createObjectStore('pdfs',{keyPath:'id'});
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(new Error('Brauzerda PDF saqlash imkonsiz. Oddiy brauzer oynasida qayta urinib ko‘ring.'));
});
export async function listPDFs():Promise<PDFRecord[]> {
  const db=await database();
  return new Promise((resolve,reject)=>{const tx=db.transaction('pdfs','readonly'),r=tx.objectStore('pdfs').getAll();r.onsuccess=()=>resolve((r.result as PDFRecord[]).sort((a,b)=>b.createdAt-a.createdAt));r.onerror=()=>reject(r.error);tx.oncomplete=()=>db.close();});
}
export async function savePDF(record:PDFRecord) {
  const db=await database();
  return new Promise<void>((resolve,reject)=>{const tx=db.transaction('pdfs','readwrite');tx.objectStore('pdfs').put(record);tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(new Error('PDFni saqlashga joy yetmadi. Eski fayllarni o‘chiring.'))};});
}
export async function deletePDF(id:string) {
  const db=await database();
  return new Promise<void>((resolve,reject)=>{const tx=db.transaction('pdfs','readwrite');tx.objectStore('pdfs').delete(id);tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(new Error('Faylni o‘chirib bo‘lmadi.'))};});
}
export function selectPDFContext(record:PDFRecord, question:string) {
  const terms=[...new Set(question.toLocaleLowerCase().match(/[\p{L}\p{N}]{3,}/gu)||[])];
  const ranked=record.textPages.map((text,index)=>({text,index,score:terms.reduce((sum,term)=>sum+(text.toLocaleLowerCase().split(term).length-1),0)})).filter(p=>p.text.trim()).sort((a,b)=>b.score-a.score||a.index-b.index);
  const chosen:typeof ranked=[];let length=0;
  for(const page of ranked){if(length>=22000)break;const text=page.text.slice(0,Math.min(7000,22000-length));chosen.push({...page,text});length+=text.length;}
  return chosen.sort((a,b)=>a.index-b.index).map(p=>'[sahifa '+(p.index+1)+']\n'+p.text).join('\n\n');
}
