import { access } from 'node:fs/promises';
const files=['src/main.tsx','src/app/dashboard.tsx','src/app/page.tsx','src/app/data.ts','src/app/globals.css','src/app/pdf-workspace.tsx','src/app/pdf-store.ts','src/app/pdf-engine.ts','src/app/ai-workspace.tsx','src/app/function-workspace.tsx','src/app/function-engine.ts','lib/demo-session.ts','lib/ai-service.mjs','config/demo-account.json','public/favicon.svg'];
const missing=[];
for(const file of files){try{await access(file)}catch{missing.push(file)}}
if(missing.length){console.error('IDROK: GitHub repositoryga quyidagi fayllar to‘liq yuklanmagan:\n'+missing.join('\n')+'\nZIP ichidagi papkalarni tuzilishini saqlagan holda repository ildiziga yuklang.');process.exit(1)}
console.log('Idrok: barcha kerakli papka va fayllar mavjud.');
