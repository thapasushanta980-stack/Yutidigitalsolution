import {describe,it,expect,beforeAll,afterAll} from 'vitest';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const root=path.resolve(__dirname,'../../../..');
const script=path.join(root,'scripts/cms/publish-git.mjs');
const g=(args:string[],cwd:string)=>execFileSync('git',args,{cwd,encoding:'utf8',env:{...process.env,GIT_AUTHOR_NAME:'t',GIT_AUTHOR_EMAIL:'t@t',GIT_COMMITTER_NAME:'t',GIT_COMMITTER_EMAIL:'t@t'}}).trim();
let tmp='',remote='',snap='';
const run=(mode:string)=>JSON.parse(execFileSync(process.execPath,[script,mode,path.join(tmp,'work'),'main',snap],{env:{...process.env,CMS_PUBLISH_ROOT:root,CMS_PUBLISH_REMOTE:remote},encoding:'utf8'}).trim().split('\n').pop()!);
const log=()=>g(['log','--format=%s'],remote).split('\n');
describe('CMS send and undo to a repository',()=>{
 beforeAll(()=>{
  tmp=fs.mkdtempSync(path.join(os.tmpdir(),'pubgit-'));remote=path.join(tmp,'remote.git');
  g(['init','--bare','-b','main',remote],tmp);
  const seed=path.join(tmp,'seed');g(['clone',remote,seed],tmp);g(['checkout','-b','main'],seed);
  fs.mkdirSync(path.join(seed,'packages/content'),{recursive:true});
  fs.writeFileSync(path.join(seed,'packages/content/published-pages.json'),'{}\n');fs.writeFileSync(path.join(seed,'packages/content/published-posts.json'),'[]\n');
  g(['add','-A'],seed);g(['commit','-m','seed'],seed);g(['push','origin','main'],seed);
  snap=path.join(tmp,'snap.json');fs.writeFileSync(snap,JSON.stringify({pages:{home:{version:2,fields:{}}},posts:[]}));
 });
 afterAll(()=>fs.rmSync(tmp,{recursive:true,force:true}));
 it('sends once, treats a repeat as no change, never touches other files',()=>{
  const a=run('publish');expect(a.outcome).toBe('sent');expect(a.commit).toMatch(/^[0-9a-f]{40}$/);
  expect(log()[0]).toMatch(/^CMS publish: /);
  expect(run('publish').outcome).toBe('no_changes');
  expect(g(['show','--stat','--format=','HEAD'],remote)).not.toMatch(/apps\//);
 });
 it('undoes only a CMS send, then refuses a second undo',()=>{
  expect(run('undo').outcome).toBe('sent');expect(log()[0]).toMatch(/^Revert "CMS publish/);
  expect(run('undo').outcome).toBe('refused');
 });
 it('reports a conflict when the remote rejects the push, without force',()=>{
  fs.writeFileSync(path.join(remote,'hooks/pre-receive'),'#!/bin/sh\nexit 1\n',{mode:0o755});
  const before=log().length;
  fs.writeFileSync(snap,JSON.stringify({pages:{home:{version:3,fields:{}}},posts:[]}));
  expect(run('publish').outcome).toBe('conflict');expect(log().length).toBe(before);
 });

 describe('teammate work and unrelated changes',()=>{
  const mate=(file:string,text:string,subject:string)=>{
   const d=fs.mkdtempSync(path.join(tmp,'mate-'));g(['clone','-q',remote,d],tmp);
   fs.mkdirSync(path.dirname(path.join(d,file)),{recursive:true});fs.writeFileSync(path.join(d,file),text);
   g(['add','-A'],d);g(['commit','-q','-m',subject],d);g(['push','-q','origin','main'],d);return d;
  };
  beforeAll(()=>{fs.rmSync(path.join(remote,'hooks/pre-receive'),{force:true})});
  it('keeps a teammate commit that landed before the send, and adds only content files on top',()=>{
   mate('docs/teammate.md','mine','Teammate: add docs');
   fs.writeFileSync(snap,JSON.stringify({pages:{home:{version:5,fields:{}}},posts:[]}));
   expect(run('publish').outcome).toBe('sent');
   expect(log().slice(0,2)).toEqual([expect.stringMatching(/^CMS publish: /),'Teammate: add docs']);
   expect(g(['show','--name-only','--format=','HEAD'],remote).split('\n').sort()).toEqual(['packages/content/published-pages.json']);
   expect(g(['show','HEAD:docs/teammate.md'],remote)).toBe('mine');
  });
  it('refuses undo once someone else pushed after the CMS send, and leaves their work',()=>{
   mate('docs/after.md','later','Teammate: later change');
   const before=g(['rev-parse','main'],remote);
   expect(run('undo').outcome).toBe('refused');expect(g(['rev-parse','main'],remote)).toBe(before);
  });
  it('refuses to revert a commit that only looks like a CMS send but touches other files',()=>{
   mate('apps/web/src/x.ts','x','CMS publish: fake '+new Date().toISOString());
   const before=g(['rev-parse','main'],remote);
   expect(run('undo').outcome).toBe('refused');expect(g(['rev-parse','main'],remote)).toBe(before);
  });
  it('does not leave the remote address in the working copy config',()=>{
   fs.writeFileSync(snap,JSON.stringify({pages:{home:{version:6,fields:{}}},posts:[]}));
   expect(run('publish').outcome).toBe('sent');
   const cfg=fs.readFileSync(path.join(tmp,'work/.git/config'),'utf8');
   expect(cfg).not.toContain(remote);expect(cfg).not.toContain('remote');
  });
  it('reports failure, not success, when the remote cannot be reached',()=>{
   const old=remote;remote=path.join(tmp,'missing.git');
   try{expect(run('publish').outcome).toBe('failed')}finally{remote=old}
  });
  it('a push that loses a race is rejected as conflict and the other commit survives',()=>{
   // Server-side hook (global git config only): right after serving our fetch, a teammate pushes.
   const hook=path.join(tmp,'hook.sh');const stash=path.join(tmp,'racer');
   g(['clone','-q',remote,stash],tmp);fs.writeFileSync(path.join(stash,'race.txt'),'r');g(['add','-A'],stash);g(['commit','-q','-m','Teammate: raced push'],stash);
   fs.writeFileSync(hook,`#!/bin/sh\nenv -u GIT_DIR -u GIT_PREFIX git -C '${stash}' push -q '${remote}' HEAD:main </dev/null >/dev/null 2>&1\nexec "$@"\n`,{mode:0o755});
   const gcfg=path.join(tmp,'gitconfig');fs.writeFileSync(gcfg,`[uploadpack]\n\tpackObjectsHook = ${hook}\n`);
   fs.writeFileSync(snap,JSON.stringify({pages:{home:{version:7,fields:{}}},posts:[]}));
   const r=JSON.parse(execFileSync(process.execPath,[script,'publish',path.join(tmp,'work'),'main',snap],{env:{...process.env,CMS_PUBLISH_ROOT:root,CMS_PUBLISH_REMOTE:remote,GIT_CONFIG_GLOBAL:gcfg},encoding:'utf8'}).trim().split('\n').pop()!);
   expect(r.outcome).toBe('conflict');
   expect(log()[0]).toBe('Teammate: raced push');
  });
 });
 describe('guard blocks unsafe content before any commit',()=>{
  const P=(o:object)=>({id:'i',slug:'a',title:'t',excerpt:'e',content:'c',author:'x',status:'PUBLISHED',...o});
  const blocked=(data:object)=>{const before=g(['rev-parse','HEAD'],remote);fs.writeFileSync(snap,JSON.stringify(data));const r=run('publish');expect(r.outcome).toBe('blocked');expect(g(['rev-parse','HEAD'],remote)).toBe(before)};
  it('archived post, upload reference, script and unsafe link are all blocked',()=>{
   try{fs.rmSync(path.join(remote,'hooks/pre-receive'),{force:true})}catch{/* ignore */}
   const home={home:{version:2,fields:{}}};
   blocked({pages:home,posts:[P({status:'ARCHIVED'})]});
   blocked({pages:home,posts:[P({coverImage:'/uploads/x.png'})]});
   blocked({pages:home,posts:[P({content:'<script>1</script>'})]});
   blocked({pages:home,posts:[P({excerpt:'javascript:alert(1)'})]});
  });
 });
});
