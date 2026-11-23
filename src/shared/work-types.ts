export const services=['geogebra','kahoot','desmos','phet','forms','maple','wolfram','matlab','octave','sage','python','latex','other'] as const;
export type Service=typeof services[number];
export const serviceNames:Record<Service,string>={geogebra:'GeoGebra',kahoot:'Kahoot',desmos:'Desmos',phet:'PhET',forms:'Google Forms',maple:'Maple',wolfram:'Wolfram',matlab:'MATLAB',octave:'GNU Octave',sage:'SageMath',python:'Python / Jupyter',latex:'LaTeX / TikZ',other:'Boshqa'};
export type SavedWork={id:string;title:string;service:Service;url:string;notes:string;fileId:string;resultId:string;revision:number;created:number};
export type FileInfo={id:string;name:string;mime:string;kind:string;size:number;created:number;metadata:Record<string,unknown>};
export const extensionList=['mw','mws','maple','mpl','nb','ma','nbp','wl','wls','wxf','cdf','ggb','m','mat','sage','py','ipynb','r','tex','tikz','csv','json','txt','pdf','png','jpg','jpeg','webp','svg','html'];
export const textExtensions=['mpl','wl','wls','m','ma','nb','mw','mws','sage','py','ipynb','r','tex','tikz','csv','json','txt','svg','html'];
export function embedLink(service:Service,input:string):{url:string;embed:string;note:string}{
 if(!input.trim())return {url:'',embed:'',note:''};
 let value=input.trim();
 if(value.startsWith('<')){const matches=[...value.matchAll(/<iframe\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1/gi)];if(matches.length!==1)throw new Error('Bitta iframe kodi yoki ulashish havolasini kiriting.');value=matches[0][2].replaceAll('&amp;','&')}
 let u:URL;try{u=new URL(value)}catch{throw new Error('To‘liq https:// havolasini kiriting.')}
 if(u.protocol!=='https:'||u.username||u.password||u.port||u.href.length>2000)throw new Error('Faqat oddiy HTTPS havolasi qabul qilinadi.');
 const h=u.hostname,p=u.pathname;
 let embed='',note='';
 if(service==='geogebra'){
  if(!['www.geogebra.org','geogebra.org'].includes(h))throw new Error('GeoGebra ulashish havolasi kerak.');
  const id=p.match(/^\/(?:m\/|material\/iframe\/id\/)([a-zA-Z0-9]{4,40})(?:\/|$)/)?.[1];
  if(!id)throw new Error('Saqlangan materialning /m/ID havolasini kiriting.');
  embed=`https://www.geogebra.org/material/iframe/id/${id}/width/1000/height/650/`;
 }else if(service==='kahoot'){
  if(!['create.kahoot.it','embed.kahoot.it','kahoot.it','play.kahoot.it'].includes(h))throw new Error('Kahoot ulashish havolasi kerak.');
  const id=(p.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i)||[])[1];
  if(h==='embed.kahoot.it')embed=u.href;else if(id&&h==='create.kahoot.it')embed='https://embed.kahoot.it/'+id;
  note='Ochiq yoki unlisted viktorina kerak. Hisobot uchun CSV/PDF biriktiring.';
 }else if(service==='desmos'){
  if(!['www.desmos.com','desmos.com'].includes(h))throw new Error('Desmos ulashish havolasi kerak.');
  if(!/^\/calculator\/[a-zA-Z0-9_-]+\/?$/.test(p))throw new Error('Saqlangan grafikning /calculator/ID havolasini kiriting.');
  u.searchParams.set('embed','');embed=u.href;
 }else if(service==='phet'){
  if(h!=='phet.colorado.edu')throw new Error('PhET rasmiy havolasi kerak.');
  if(/^\/sims\/html\/[a-z0-9-]+\/latest\/[a-z0-9_-]+\.html$/.test(p))embed=u.href;
  else if(!p.startsWith('/en/')&&!p.startsWith('/uz/')&&!p.startsWith('/sims/'))throw new Error('PhET simulyatsiyasi yoki Studio havolasi kerak.');
  note='Oddiy simulyatsiya havolasi tajribangiz holatini saqlamaydi. Natija rasm/PDFini biriktiring; Studio preset havolasini ham saqlash mumkin.';
 }else if(service==='forms'){
  if(h==='forms.gle'){note='Qisqa havola alohida ochiladi. Sayt ichida ko‘rish uchun Google Forms → Send → Embed HTML kodini kiriting.';return {url:u.href,embed:'',note}}
  if(h!=='docs.google.com'||!/^\/forms\/d\/(?:e\/)?[a-zA-Z0-9_-]+\/viewform\/?$/.test(p))throw new Error('Formsning viewform havolasi yoki Embed HTML kodi kerak; /edit havolasi mos emas.');
  u.searchParams.set('embedded','true');embed=u.href;note='Forma javoblari Google’da saqlanadi. Hisobotni ko‘rish uchun CSV/PDF biriktiring.';
 }else if(service==='wolfram'){
  if(!['www.wolframcloud.com','wolframcloud.com'].includes(h)||!/^\/(?:obj|env)\//.test(p))throw new Error('Ochiq Wolfram Cloud obyekt havolasini kiriting.');
  embed=u.href;note='Wolfram Cloud obyektining ruxsatlari amal qiladi. Mahalliy .nb fayli uchun PDF/rasm ko‘rinishini biriktiring.';
 }else{note='Havola asl dasturda ochiladi; sayt ichidagi ko‘rinish uchun natija faylini biriktiring.'}
 return {url:u.href,embed,note};
}
export function validateWork(v:unknown){
 const w=v as SavedWork;if(!w||typeof w.title!=='string'||!w.title.trim()||w.title.length>160||!services.includes(w.service)||typeof w.url!=='string'||w.url.length>8000||typeof w.notes!=='string'||w.notes.length>10000||typeof w.fileId!=='string'||typeof w.resultId!=='string')throw new Error('Ish nomi, xizmat va matn hajmini tekshiring.');
 const link=embedLink(w.service,w.url);if(!link.url&&!w.fileId&&!w.resultId)throw new Error('Havola yoki fayl kiriting.');
 return {title:w.title.trim(),service:w.service,url:link.url,notes:w.notes,fileId:w.fileId,resultId:w.resultId};
}
