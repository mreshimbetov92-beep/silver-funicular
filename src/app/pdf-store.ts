import {api,uploadAccountFile} from './account-client';
import type {FileInfo} from '../shared/work-types';
export type PDFRecord = { id:string; name:string; size:number; blob:Blob; pages:number; textPages:string[]; truncated:boolean; createdAt:number };
export async function listPDFs():Promise<PDFRecord[]> {
 const {items}=await api<{items:FileInfo[]}>('/api/files');return items.filter(f=>f.kind==='pdf').map(f=>({id:f.id,name:f.name,size:f.size,blob:new Blob([]),pages:Number(f.metadata.pages),textPages:f.metadata.textPages as string[],truncated:!!f.metadata.truncated,createdAt:f.created}));
}
export async function savePDF(record:PDFRecord){await uploadAccountFile(record.blob,record.name,'pdf',{pages:record.pages,textPages:record.textPages,truncated:record.truncated},record.id)}
export async function deletePDF(id:string){await api('/api/files/'+id,'DELETE')}
export async function getPDFBlob(record:PDFRecord){if(record.blob.size)return record.blob;const r=await fetch('/api/files/'+record.id,{credentials:'same-origin'});if(!r.ok)throw new Error('PDFni yuklab bo‘lmadi.');return new Blob([await r.arrayBuffer()],{type:'application/pdf'})}
export function selectPDFContext(record:PDFRecord, question:string) {
  const terms=[...new Set(question.toLocaleLowerCase().match(/[\p{L}\p{N}]{3,}/gu)||[])];
  const ranked=record.textPages.map((text,index)=>({text,index,score:terms.reduce((sum,term)=>sum+(text.toLocaleLowerCase().split(term).length-1),0)})).filter(p=>p.text.trim()).sort((a,b)=>b.score-a.score||a.index-b.index);
  const chosen:typeof ranked=[];let length=0;
  for(const page of ranked){if(length>=22000)break;const text=page.text.slice(0,Math.min(7000,22000-length));chosen.push({...page,text});length+=text.length;}
  return chosen.sort((a,b)=>a.index-b.index).map(p=>'[sahifa '+(p.index+1)+']\n'+p.text).join('\n\n');
}
