import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {ApiError} from '../../utils/ApiError.js';
import {recordAudit} from '../../utils/audit.js';
import {publishedSnapshot} from '../insights/insight.service.js';
import {prisma} from '@yukti/database';
import {published} from './content.service.js';
export type Outcome='sent'|'no_changes'|'conflict'|'refused'|'blocked'|'failed';
export type PublishResult={outcome:Outcome;action:'publish'|'undo';commit?:string;message:string;deployVerified:false;branch:string;reachesLiveSite:boolean;contentVersion?:string};
// Only the main branch feeds the live site rebuild. Any other branch is a review branch and never changes the live site.
export const reachesLiveSite=(branch:string)=>branch==='main';
const MESSAGES:Record<Outcome,string>={
 sent:'Sent to the website repository. The live site changes only after the website rebuild finishes; this page cannot confirm that yet.',
 no_changes:'Nothing to send: the approved content already matches the repository.',
 conflict:'Nothing was sent. The repository changed meanwhile. Try again.',
 refused:'Undo refused: the newest repository change is not a CMS send.',
 blocked:'Nothing was sent. The approved content did not pass the safety check (for example an archived post, an uploaded image or an unsafe link). Fix it in the CMS and try again.',
 failed:'Nothing was sent. The website repository could not be updated.',
};
const REVIEW_SENT='Sent to the review branch "%B" of the website repository. This does not update the live site. The live site changes only after someone merges that branch into the main branch.';
const REVIEW_UNDO='Undo applied on the review branch "%B". The live site was not changed.';
const LIVE_UNDO='Undo sent to the website repository (the last CMS send was reverted). The live site changes only after the website rebuild finishes; this page cannot confirm that yet.';
export const wording=(o:Outcome,action:'publish'|'undo',branch:string)=>{
 if(o!=='sent')return MESSAGES[o].replace(/website repository/g,reachesLiveSite(branch)?'website repository':'review branch "'+branch+'"');
 if(reachesLiveSite(branch))return action==='undo'?LIVE_UNDO:MESSAGES.sent;
 return (action==='undo'?REVIEW_UNDO:REVIEW_SENT).replace('%B',branch);
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
 return new Promise<{outcome:Outcome;commit?:string;contentVersion?:string}>(resolve=>{
  const child=spawn(process.execPath,[path.join(c.root,'scripts/cms/publish-git.mjs'),mode,c.workdir,c.branch,snapshot],{cwd:c.root,env:{...process.env,CMS_PUBLISH_REMOTE:c.remote,CMS_PUBLISH_ROOT:c.root},stdio:['ignore','pipe','ignore']});
  let out='';child.stdout.on('data',(d:Buffer)=>{out+=d.toString().slice(0,4000)});
  const timer=setTimeout(()=>child.kill('SIGTERM'),180000);
  const done=(code:number|null)=>{clearTimeout(timer);try{const r=JSON.parse(out.trim().split('\n').pop()||'');if(code===0&&r.outcome)return resolve(r)}catch{/* ignore */}resolve({outcome:'failed'})};
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
  const message=wording(r.outcome,action,c.branch);
  const result:PublishResult={outcome:r.outcome,action,commit:r.commit,message,deployVerified:false,branch:c.branch,reachesLiveSite:reachesLiveSite(c.branch),contentVersion:r.contentVersion};
  // Audit is best-effort (existing recordAudit). Not transactional.
  await recordAudit({userId,action:action==='publish'?'PUBLISH':'UNDO',entity:'SITE_PUBLISH',entityId:r.commit,metadata:{outcome:r.outcome,deployVerified:false,contentVersion:r.contentVersion,action}});
  if(r.outcome==='conflict')throw ApiError.conflict(message);
  if(r.outcome==='refused'||r.outcome==='blocked')throw ApiError.conflict(message);
  if(r.outcome==='failed')throw ApiError.internal(message);
  return result;
 }finally{if(temp)fs.rmSync(temp,{recursive:true,force:true});running=false;}
}

// Last recorded attempt, read from the audit table so it survives an API restart. Best-effort: audit writes can fail.
export async function lastAttempt(){
 const row=await prisma.auditLog.findFirst({where:{entity:'SITE_PUBLISH'},orderBy:{createdAt:'desc'}});
 if(!row)return null;let outcome='unknown',contentVersion:string|undefined;try{const m=JSON.parse(row.metadata||'{}');outcome=m.outcome||'unknown';contentVersion=typeof m.contentVersion==='string'?m.contentVersion:undefined}catch{/* ignore */}
 return {action:row.action.toLowerCase(),outcome,commit:row.entityId,contentVersion,at:row.createdAt.toISOString(),deployVerified:false};
}

// Is the exact content of the last successful send being served by the public website? Compares the fingerprint the
// website build publishes at /content-version.json with the one computed at send time. 'unknown' means it could not be checked,
// never 'live'. Only meaningful when the send reaches the live site (target branch main).
export type LiveState='live'|'not_yet'|'unknown';
export async function compareLive(expected:string|undefined,baseUrl:string|undefined,fetchImpl:typeof fetch=fetch):Promise<{state:LiveState;detail:string}>{
 if(!expected)return {state:'unknown',detail:'No successful send to compare with.'};
 if(!baseUrl||!/^https:\/\/[A-Za-z0-9.-]+\/?$/.test(baseUrl))return {state:'unknown',detail:'The public website address is not configured.'};
 try{
  const res=await fetchImpl(baseUrl.replace(/\/$/,'')+'/content-version.json?'+Date.now(),{headers:{'cache-control':'no-cache'},signal:AbortSignal.timeout(5000),redirect:'error'});
  if(!res.ok)return {state:'not_yet',detail:'The website does not serve a content version yet.'};
  const v=(await res.json()) as {contentVersion?:unknown};
  if(typeof v.contentVersion!=='string')return {state:'not_yet',detail:'The website content version is not readable yet.'};
  return v.contentVersion===expected?{state:'live',detail:'The website is serving exactly the content that was sent.'}:{state:'not_yet',detail:'The website is still serving different content. The rebuild may be running or may have failed.'};
 }catch{return {state:'unknown',detail:'The website could not be checked right now.'}}
}
export async function liveStatus(){
 const last=await lastAttempt();
 const sent=last&&last.outcome==='sent'&&last.contentVersion?last:null;
 return {last:sent,...await compareLive(sent?.contentVersion,process.env.CMS_PUBLISH_LIVE_URL)};
}
