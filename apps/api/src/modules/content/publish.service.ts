import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {ApiError} from '../../utils/ApiError.js';
import {recordAudit} from '../../utils/audit.js';
import {publishedSnapshot} from '../insights/insight.service.js';
import {prisma} from '@yukti/database';
import {published} from './content.service.js';
export type Outcome='sent'|'no_changes'|'conflict'|'refused'|'failed';
export type PublishResult={outcome:Outcome;action:'publish'|'undo';commit?:string;message:string;deployVerified:false};
const MESSAGES:Record<Outcome,string>={
 sent:'Sent to the website repository. The live site changes only after the website rebuild finishes; this page cannot confirm that yet.',
 no_changes:'Nothing to send: the approved content already matches the repository.',
 conflict:'Nothing was sent. The repository changed meanwhile. Try again.',
 refused:'Undo refused: the newest repository change is not a CMS send.',
 failed:'Nothing was sent. The website repository could not be updated.',
};
let running=false;
export function config(){
 if(process.env.CMS_PUBLISH_ENABLED!=='true')throw ApiError.notFound('Publishing is not enabled');
 const remote=process.env.CMS_PUBLISH_REMOTE,workdir=process.env.CMS_PUBLISH_WORKDIR,root=process.env.CMS_PUBLISH_ROOT;
 if(!remote||!workdir||!root||!path.isAbsolute(workdir)||!path.isAbsolute(root))throw ApiError.internal('Publishing is not configured');
 return {remote,workdir,root,branch:process.env.CMS_PUBLISH_BRANCH||'main'};
}
export const enabled=()=>process.env.CMS_PUBLISH_ENABLED==='true';
function run(c:ReturnType<typeof config>,mode:'publish'|'undo',snapshot:string){
 return new Promise<{outcome:Outcome;commit?:string}>(resolve=>{
  const child=spawn(process.execPath,[path.join(c.root,'scripts/cms/publish-git.mjs'),mode,c.workdir,c.branch,snapshot],{cwd:c.root,env:{...process.env,CMS_PUBLISH_REMOTE:c.remote,CMS_PUBLISH_ROOT:c.root},stdio:['ignore','pipe','ignore']});
  let out='';child.stdout.on('data',(d:Buffer)=>{out+=d.toString().slice(0,4000)});
  const timer=setTimeout(()=>child.kill('SIGTERM'),180000);
  const done=(code:number|null)=>{clearTimeout(timer);try{const r=JSON.parse(out.trim().split('\n').pop()||'');if(code===0&&r.outcome)return resolve(r)}catch{}resolve({outcome:'failed'})};
  child.on('error',()=>done(1));child.on('close',done);
 });
}
export async function perform(action:'publish'|'undo',userId?:string):Promise<PublishResult>{
 const c=config();if(running)throw ApiError.conflict('A send is already running');running=true;
 let temp='';
 try{
  let snapshot='';
  if(action==='publish'){
   const pages=await published(),posts=await publishedSnapshot();
   temp=fs.mkdtempSync(path.join(os.tmpdir(),'yukti-publish-'));snapshot=path.join(temp,'snapshot.json');
   fs.writeFileSync(snapshot,JSON.stringify({pages,posts}),{mode:0o600});
  }
  const r=await run(c,action,snapshot);
  const message=action==='undo'&&r.outcome==='sent'?'Undo sent to the website repository (the last CMS send was reverted). The live site changes only after the website rebuild finishes; this page cannot confirm that yet.':MESSAGES[r.outcome];
  const result:PublishResult={outcome:r.outcome,action,commit:r.commit,message,deployVerified:false};
  // Audit is best-effort (existing recordAudit). Not transactional.
  await recordAudit({userId,action:action==='publish'?'PUBLISH':'UNDO',entity:'SITE_PUBLISH',entityId:r.commit,metadata:{outcome:r.outcome,deployVerified:false}});
  if(r.outcome==='conflict')throw ApiError.conflict(message);
  if(r.outcome==='refused')throw ApiError.conflict(message);
  if(r.outcome==='failed')throw ApiError.internal(message);
  return result;
 }finally{if(temp)fs.rmSync(temp,{recursive:true,force:true});running=false;}
}

// Last recorded attempt, read from the audit table so it survives an API restart. Best-effort: audit writes can fail.
export async function lastAttempt(){
 const row=await prisma.auditLog.findFirst({where:{entity:'SITE_PUBLISH'},orderBy:{createdAt:'desc'}});
 if(!row)return null;let outcome='unknown';try{outcome=JSON.parse(row.metadata||'{}').outcome||'unknown'}catch{}
 return {action:row.action.toLowerCase(),outcome,commit:row.entityId,at:row.createdAt.toISOString(),deployVerified:false};
}
