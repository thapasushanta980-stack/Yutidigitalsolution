import fs from 'node:fs';import crypto from 'node:crypto';import {spawn} from 'node:child_process';
fs.mkdirSync('runtime',{recursive:true});
process.env.JWT_SECRET=process.env.SESSION_SECRET;
process.env.DATABASE_URL=`mysql://yukti:${process.env.DATABASE_PASSWORD}@database:3306/yukti_cms`;
process.env.HOST='127.0.0.1';process.env.PORT='4404';
const origin=process.env.CMS_ORIGIN.replace(/^http:/,'https:');for(const key of ['FRONTEND_URL','ADMIN_URL','PUBLIC_SITE_URL'])process.env[key]=origin;
let migration=spawn('npm',['run','db:deploy'],{stdio:'inherit'});migration.on('exit',code=>{if(code)process.exit(code);const children=[spawn('node',['apps/api/dist/server.js'],{stdio:'inherit'}),spawn('node',['deploy/cms/gateway.mjs'],{stdio:'inherit'})];for(const c of children)c.on('exit',()=>process.exit(1));process.on('SIGTERM',()=>{for(const c of children)c.kill('SIGTERM')});});
