import type {FileInfo} from '../shared/work-types';
export type AccountUser={id:string;email:string;name:string;emailVerified:boolean;role?:'admin'|'student'};
export async function api<T=any>(path:string,method='GET',body?:unknown):Promise<T>{
 const response=await fetch(path,{method,credentials:'same-origin',cache:'no-store',headers:body===undefined?{}:{'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})});
 const data=await response.json();if(!response.ok){const e=new Error(data.error||'Server bilan aloqa xatosi.') as Error&{status:number};e.status=response.status;throw e}return data;
}
let userId='',generation=0;
let values:Record<string,string>={},revisions:Record<string,number>={},pending=new Set<string>(),sending=false,blocked=false,timer:ReturnType<typeof setTimeout>|undefined;
export type SyncStatus={state:'saved'|'saving'|'error';message:string};
let status:SyncStatus={state:'saved',message:'Hisobga saqlandi'};const listeners=new Set<()=>void>();
function announce(value:SyncStatus){status=value;listeners.forEach(f=>f())}
export const syncStatus=()=>status;
export function subscribeSync(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn)}}
export async function openAccount(user:AccountUser){
 const data=await api<{items:{key:string;value:unknown;revision:number}[]}>('/api/state');
 generation++;userId=user.id;values={};revisions={};pending.clear();blocked=false;sending=false;clearTimeout(timer);
 for(const item of data.items){values[item.key]=JSON.stringify(item.value);revisions[item.key]=item.revision}
 announce({state:'saved',message:'Hisob ma’lumotlari yuklandi'});
}
export function closeAccount(){generation++;clearTimeout(timer);userId='';values={};revisions={};pending.clear();blocked=false;sending=false}
export const accountStorage={getItem(key:string){return values[key]??null},setItem(key:string,value:string){if(!userId)throw new Error('Hisobga kiring.');if(values[key]===value)return;values[key]=value;pending.add(key);announce({state:'saving',message:'Hisobga saqlanmoqda…'});clearTimeout(timer);timer=setTimeout(()=>void flushAccount().catch(()=>{}),350)}};
export async function flushAccount(){
 if(blocked)throw new Error(status.message);if(sending){await new Promise<void>(resolve=>{const id=setInterval(()=>{if(!sending){clearInterval(id);resolve()}},50)});if(pending.size)return flushAccount();return}
 if(!pending.size)return;
 const captured=generation;sending=true;
 try{for(const key of [...pending]){if(captured!==generation)return;const value=values[key],data=await api<{revision:number}>('/api/state','PUT',{key,value:JSON.parse(value),revision:revisions[key]||0});if(captured!==generation)return;revisions[key]=data.revision;if(values[key]===value)pending.delete(key)}if(pending.size){sending=false;return flushAccount()}announce({state:'saved',message:'Hisobga saqlandi'})}
 catch(e){if(captured===generation){blocked=(e as {status?:number}).status===409;announce({state:'error',message:(e as Error).message})}throw e}finally{if(captured===generation)sending=false}
}
export function exportAccountDraft(){const blob=new Blob([JSON.stringify({version:'idrok-account-backup-1',savedAt:new Date().toISOString(),data:Object.fromEntries(Object.entries(values).map(([k,v])=>[k,JSON.parse(v)]))},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Idrok_hisob_zaxirasi.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
export async function fileBase64(blob:Blob){return new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(new Error('Fayl o‘qilmadi.'));reader.readAsDataURL(blob)})}
export async function uploadAccountFile(file:File|Blob,name:string,kind='work',metadata:Record<string,unknown>={},id?:string){if(file.size>20*1024*1024)throw new Error('Fayl 20 MB dan oshmasin.');return api<FileInfo>('/api/files','POST',{name,kind,metadata,id,base64:await fileBase64(file)})}
export async function getFileBlob(info:FileInfo){const r=await fetch((info.reviewOwner?'/api/admin/students/'+encodeURIComponent(info.reviewOwner)+'/files/':info.shared?'/api/shared/files/':'/api/files/')+info.id,{credentials:'same-origin'});if(!r.ok)throw new Error('Faylni ochib bo‘lmadi.');return new Blob([await r.arrayBuffer()],{type:info.mime})}
export async function downloadAccountFile(info:FileInfo){const blob=await getFileBlob(info),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=info.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
