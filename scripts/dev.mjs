import {loadEnvFile} from 'node:process';
import {randomBytes} from 'node:crypto';
import {createAppServer} from '../server.mjs';
try{loadEnvFile('.env')}catch{}
const args=process.argv.slice(2),option=(key,fallback)=>args.includes(key)?args[args.indexOf(key)+1]:fallback;
const port=Number(option('--port',process.env.PORT||'3000')),host=option('--host','127.0.0.1');
process.env.PORT=String(port);
process.env.APP_ORIGIN='http://'+host+':'+port;
process.env.IDROK_DEMO_SESSION_SECRET ||= randomBytes(48).toString('base64url');
createAppServer(process.env).listen(port,host,()=>console.log('Idrok local preview: '+process.env.APP_ORIGIN));
