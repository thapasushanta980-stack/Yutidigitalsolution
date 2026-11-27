// Sends approved CMS content to the website repository, or reverts the last CMS send.
// Plain pushes only: never force. Prints one JSON line. Does not deploy anything.
// The remote (which may carry a credential) is read from CMS_PUBLISH_REMOTE and handed to git
// only through git's environment config: never an argument, never written to .git/config.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
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
 git(['fetch','--quiet','--depth','20','origin',branch]);
 git(['checkout','--quiet','-B',branch,'FETCH_HEAD']);
}
try{
 fresh();
 if(mode==='publish'){
  const exporter=path.join(process.env.CMS_PUBLISH_ROOT||process.cwd(),'scripts/cms/export-pages.mjs');
  fs.mkdirSync(path.join(workdir,'packages/content'),{recursive:true});
  execFileSync(process.execPath,[exporter,snapshot],{cwd:workdir,env,stdio:['ignore','pipe','pipe']});
  git(['add',...FILES]);
  if(!git(['status','--porcelain']))out({outcome:'no_changes'});
  git(['commit','--quiet','-m',MARK+new Date().toISOString()]);
 }else if(mode==='undo'){
  const subject=git(['log','-1','--format=%s']);
  const parents=git(['log','-1','--format=%P']).split(' ').filter(Boolean).length;
  const files=git(['show','--name-only','--format=','HEAD']).split('\n').filter(Boolean);
  // Only a single-parent commit made by a CMS send that touched nothing but the two content files.
  if(!subject.startsWith(MARK)||parents!==1||!files.length||files.some(f=>!FILES.includes(f)))out({outcome:'refused'});
  git(['revert','--no-edit','HEAD']);
 }else throw Error('bad mode');
 const commit=git(['rev-parse','HEAD']);
 try{git(['push','--quiet','origin','HEAD:refs/heads/'+branch])}catch{out({outcome:'conflict'})}
 out({outcome:'sent',commit});
}catch(e){out({outcome:'failed'})}
