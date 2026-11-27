import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
import {ApiError} from '../../utils/ApiError.js';
import {publishedSnapshot} from '../insights/insight.service.js';
import {prisma} from '@yukti/database';
import {draftSnapshot,published} from './content.service.js';
export type Job={id:string;state:'building'|'ready'|'failed';mode:'draft'|'published';startedAt:string;releaseId?:string;error?:string};
let job:Job|null=null;
const validId=/^\d{4}-\d{2}-\d{2}T[\dTZ-]+-[a-f0-9]{8}$/;
export function config(){
 if(process.env.CMS_REVIEW_ENABLED!=='true')throw ApiError.notFound('Review builder is not enabled');
 const root=process.env.CMS_REVIEW_ROOT,output=process.env.CMS_REVIEW_OUTPUT;
 if(!root||!output||!path.isAbsolute(root)||!path.isAbsolute(output))throw ApiError.internal('Review builder requires explicit absolute source and output paths');
 const resolvedRoot=fs.realpathSync(root);fs.mkdirSync(output,{recursive:true,mode:0o700});const resolvedOutput=fs.realpathSync(output);
 if(resolvedOutput===resolvedRoot||resolvedOutput.startsWith(resolvedRoot+path.sep))throw ApiError.internal('Review output must be separate from application source');
 if(!fs.existsSync(path.join(resolvedRoot,'scripts/cms/build-review-release.mjs')))throw ApiError.internal('Review source is not prepared');
 return {root:resolvedRoot,output:resolvedOutput};
}
export function status(){const{output}=config();let current:string|null=null;try{current=fs.readlinkSync(path.join(output,'current'))}catch{}const releases=fs.readdirSync(output).filter(id=>validId.test(id)&&fs.statSync(path.join(output,id)).isDirectory()).sort().reverse();return {job,current,releases};}
export async function start(mode:'draft'|'published'){
 const c=config();if(job?.state==='building')throw ApiError.conflict('A review build is already running');
 const current:Job={id:crypto.randomUUID(),state:'building',mode,startedAt:new Date().toISOString()};job=current;
 try{
 const pages=mode==='draft'?await draftSnapshot():await published();
 const posts=mode==='draft'?await prisma.insight.findMany({include:{category:true},orderBy:{updatedAt:'asc'}}):await publishedSnapshot();
 const snapshot={pages,posts,reviewDraft:mode==='draft'};
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'yukti-review-input-'));const input=path.join(temp,'snapshot.json');fs.writeFileSync(input,JSON.stringify(snapshot),{mode:0o600});
 const child=spawn(process.execPath,['scripts/cms/build-review-release.mjs',input,c.output],{cwd:c.root,env:{...process.env},stdio:['ignore','pipe','pipe']});let output='';
 child.stdout.on('data',(chunk:Buffer)=>{output+=chunk.toString();if(output.length>100000)output=output.slice(-100000)});
 child.stderr.on('data',()=>{}); // Build diagnostics never expose source/secrets to the browser.
 const timer=setTimeout(()=>child.kill('SIGTERM'),180000);
 function finish(code:number|null){clearTimeout(timer);fs.rmSync(temp,{recursive:true,force:true});if(current.state!=='building')return;try{const result=JSON.parse(output.trim());if(code!==0||!validId.test(result.id))throw Error();current.releaseId=result.id;current.state='ready';}catch{current.state='failed';current.error='Review build failed. Previous review remains unchanged. Inspect local build diagnostics.';}}
 child.on('error',()=>finish(1));child.on('close',finish);return current;
 }catch(error){current.state='failed';current.error='Review build could not start. Previous review remains unchanged.';throw error;}
}
export function releaseFile(id:string,requestPath:string){const{output}=config();if(!validId.test(id))throw ApiError.notFound();const directory=path.join(output,id);const file=path.resolve(directory,requestPath||'index.html');if(!file.startsWith(directory+path.sep)||!fs.existsSync(file))throw ApiError.notFound();const real=fs.realpathSync(file);if(!real.startsWith(directory+path.sep)||!fs.statSync(real).isFile())throw ApiError.notFound();return real;}
export function select(id:string){const{output}=config();if(job?.state==='building')throw ApiError.conflict('Wait for the current review build');releaseFile(id,'review-release.json');const next=path.join(output,'.selection-'+crypto.randomBytes(6).toString('hex'));fs.symlinkSync(id,next);fs.renameSync(next,path.join(output,'current'));return status();}
