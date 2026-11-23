import {loadEnvFile} from 'node:process';
import {createAppServer} from '../server.mjs';
try{loadEnvFile('.env')}catch{}
const args=process.argv.slice(2),option=(key,fallback)=>args.includes(key)?args[args.indexOf(key)+1]:fallback;
const port=Number(option('--port',process.env.PORT||'3000')),host=option('--host','127.0.0.1');
process.env.PORT=String(port);
process.env.APP_ORIGIN ||= 'http://'+host+':'+port;
createAppServer(process.env).listen(port,host,()=>console.log('Idrok local preview: '+process.env.APP_ORIGIN));
