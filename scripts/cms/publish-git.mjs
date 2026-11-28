// Sends approved CMS content to the website repository, or reverts the last CMS send.
// Plain pushes only: never force. Prints one JSON line. Does not deploy anything.
// The remote (which may carry a credential) is read from CMS_PUBLISH_REMOTE and handed to git
// only through git's environment config: never an argument, never written to .git/config.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {checkStaged,Refusal} from './publish-guard.mjs';
import {contentVersion} from './content-version.mjs';
import {publishAssets,AssetError,MEDIA_DIR,MEDIA_PATH} from './publish-assets.mjs';
const [mode,workdir,branch,snapshot]=process.argv.slice(2);
const remote=process.env.CMS_PUBLISH_REMOTE;
const MARK='CMS publish: ';
const FILES=['packages/content/published-pages.json','packages/content/published-posts.json'];
const env={...process.env,GIT_TERMINAL_PROMPT:'0',GIT_AUTHOR_NAME:'Yukti CMS',GIT_AUTHOR_EMAIL:'cms@yuktids.com',GIT_COMMITTER_NAME:'Yukti CMS',GIT_COMMITTER_EMAIL:'cms@yuktids.com',
 GIT_CONFIG_COUNT:'1',GIT_CONFIG_KEY_0:'remote.origin.url',GIT_CONFIG_VALUE_0:remote||''};
delete env.CMS_PUBLISH_REMOTE;
if(process.env.CMS_PUBLISH_SSH_KEY)env.GIT_SSH_COMMAND=`ssh -i ${process.env.CMS_PUBLISH_SSH_KEY} -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes`;
const git=(args,cwd=workdir)=>execFileSync('git',args,{cwd,env,encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:120000}).trim();
const out=o=>{console.log(JSON.stringify(o));process.exit(0)};
function fresh(){
 if(!remote||!/^[A-Za-z0-9._\/-]+$/.test(branch||''))throw Error('bad config');
 fs.rmSync(workdir,{recursive:true,force:true});fs.mkdirSync(workdir,{recursive:true,mode:0o700});
 git(['init','--quiet']);
 git(['fetch','--quiet','--depth','50','origin',branch]);
 git(['checkout','--quiet','-B',branch,'FETCH_HEAD']);
}
// Cross-process lock: the in-process flag in the API cannot see a second process, so take a lock folder next to the work folder.
const lock=workdir+'.lock';
const alive=pid=>{try{process.kill(pid,0);return true}catch(e){return e.code==='EPERM'}};
// A lock held by a running publisher is never taken over, however long it has been running. A lock whose owner is gone
// (crash, kill) is taken over; a lock with no readable owner is taken over only once it is old.
function takeLock(){
 fs.mkdirSync(path.dirname(lock),{recursive:true});
 for(let i=0;i<2;i++){
  try{fs.mkdirSync(lock);fs.writeFileSync(path.join(lock,'pid'),String(process.pid));return true}catch{
   let pid=0;try{pid=Number(fs.readFileSync(path.join(lock,'pid'),'utf8'))}catch{/* no owner file */}
   const old=(()=>{try{return Date.now()-fs.statSync(lock).mtimeMs>600000}catch{return true}})();
   if(pid>0&&pid!==process.pid&&alive(pid))return false;
   if(!pid&&!old)return false;
   fs.rmSync(lock,{recursive:true,force:true});
  }
 }
 return false;
}
try{if(!takeLock())out({outcome:'conflict'})}catch(e){out({outcome:'failed'})}
process.on('exit',()=>{try{fs.rmSync(lock,{recursive:true,force:true})}catch{/* ignore */}});
try{
 fresh();
 if(mode==='publish'){
  const exporter=path.join(process.env.CMS_PUBLISH_ROOT||process.cwd(),'scripts/cms/export-pages.mjs');
  fs.mkdirSync(path.join(workdir,'packages/content'),{recursive:true});
  execFileSync(process.execPath,[exporter,snapshot],{cwd:workdir,env,stdio:['ignore','pipe','pipe']});
  // Copy referenced cover images into the repository and point the posts at them (bounded, content-checked).
  try{
   const pf=path.join(workdir,FILES[1]);const r=publishAssets(workdir,process.env.UPLOAD_DIR?path.resolve(process.env.UPLOAD_DIR):'',JSON.parse(fs.readFileSync(pf,'utf8')));
   fs.writeFileSync(pf,JSON.stringify(r.posts,null,2)+'\n');
  }catch(e){if(e instanceof AssetError)out({outcome:'blocked',reason:e.reason});throw e}
  git(['add',...FILES,...(fs.existsSync(path.join(workdir,MEDIA_DIR))?[MEDIA_DIR]:[])]);
  if(!git(['status','--porcelain']))out({outcome:'no_changes'});
  // Fail closed: exact paths, plain files, valid and safe content, or nothing is committed.
  try{checkStaged(workdir)}catch(e){if(e instanceof Refusal)out({outcome:'blocked',reason:e.reason});throw e}
  git(['commit','--quiet','-m',MARK+new Date().toISOString()]);
 }else if(mode==='undo'){
  // Find the newest CMS send in recent history that has not been reverted yet. Unrelated commits after it are fine
  // as long as they did not touch the files that send changed; otherwise report a conflict and change nothing.
  const log=git(['log','-30','--format=%H%x09%P%x09%s']).split('\n').filter(Boolean).map(l=>{const [h,p,...r]=l.split('\t');return {h,parents:p.split(' ').filter(Boolean).length,subject:r.join('\t')}});
  const reverted=new Set(log.filter(c=>c.subject.startsWith('Revert "'+MARK)).map(c=>c.subject.slice(8,-1)));
  const target=log.find(c=>c.subject.startsWith(MARK)&&!reverted.has(c.subject));
  if(!target||target.parents!==1)out({outcome:'refused'});
  const files=git(['show','--name-only','--format=',target.h]).split('\n').filter(Boolean);
  if(!files.length||files.some(f=>!FILES.includes(f)&&!MEDIA_PATH.test(f)))out({outcome:'refused'});
  if(git(['log','--format=%H',target.h+'..HEAD','--',...files]))out({outcome:'conflict'});
  try{git(['revert','--no-edit',target.h])}catch{try{git(['revert','--abort'])}catch{/* ignore */}out({outcome:'conflict'})}
 }else throw Error('bad mode');
 const commit=git(['rev-parse','HEAD']);
 try{git(['push','--quiet','origin','HEAD:refs/heads/'+branch])}catch{out({outcome:'conflict'})}
 out({outcome:'sent',commit,contentVersion:contentVersion(workdir)});
}catch(e){out({outcome:'failed'})}
