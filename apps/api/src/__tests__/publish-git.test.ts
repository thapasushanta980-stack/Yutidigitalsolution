import {describe,it,expect,beforeAll,afterAll} from 'vitest';
import {execFileSync,spawn,spawnSync} from 'node:child_process';
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
   fs.writeFileSync(snap,JSON.stringify({pages:{home:{version:6,fields:{}}},posts:[]}));
   expect(run('publish').outcome).toBe('sent');
   expect(log().slice(0,2)).toEqual([expect.stringMatching(/^CMS publish: /),'Teammate: add docs']);
   expect(g(['show','--name-only','--format=','HEAD'],remote).split('\n').sort()).toEqual(['packages/content/published-pages.json']);
   expect(g(['show','HEAD:docs/teammate.md'],remote)).toBe('mine');
  });
  it('undo tolerates unrelated work pushed after the CMS send and keeps it',()=>{
   mate('docs/after.md','later','Teammate: later change');
   expect(run('undo').outcome).toBe('sent');
   expect(g(['show','main:docs/after.md'],remote).trim()).toBe('later');
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
  const home0={home:{version:2,fields:{}}};
  const blocked=(data:object)=>{const before=g(['rev-parse','HEAD'],remote);fs.writeFileSync(snap,JSON.stringify(data));const r=run('publish');expect(r.outcome).toBe('blocked');expect(g(['rev-parse','HEAD'],remote)).toBe(before)};
  it('archived post, upload reference, script and unsafe link are all blocked',()=>{
   try{fs.rmSync(path.join(remote,'hooks/pre-receive'),{force:true})}catch{/* ignore */}
   const home={home:{version:2,fields:{}}};
   blocked({pages:home,posts:[P({coverImage:'/uploads/x.png'})]});
   blocked({pages:home,posts:[P({excerpt:'javascript:alert(1)'})]});
   blocked({pages:home,posts:[P({canonicalUrl:'http://insecure.test'})]});
   blocked({pages:home,posts:[P({content:'bad\u0000byte'})]});
  });
  it('archived and draft posts are left out of the export instead of blocking the send',()=>{
   fs.writeFileSync(snap,JSON.stringify({pages:home0,posts:[P({slug:'old',status:'ARCHIVED'}),P({slug:'wip',status:'DRAFT'}),P({slug:'live'})]}));
   expect(run('publish').outcome).toBe('sent');
   const posts=JSON.parse(g(['show','HEAD:packages/content/published-posts.json'],remote));
   expect(posts.map((x:{slug:string})=>x.slug)).toEqual(['live']);
   expect(run('undo').outcome).toBe('sent');
  });
  describe('cover images',()=>{
   const png=Buffer.concat([Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]),Buffer.alloc(64,1)]);
   const NAME='1795532541963-96a3694b43a754fd.png';
   const setup=()=>{const up=path.join(tmp,'uploads');fs.mkdirSync(up,{recursive:true});process.env.UPLOAD_DIR=up;return up};
   const send=(cover:string)=>{fs.writeFileSync(snap,JSON.stringify({pages:{home:{version:2,fields:{}}},posts:[{id:'i',slug:'a',title:'t',excerpt:'e',content:'c',author:'x',status:'PUBLISHED',coverImage:cover}]}));return run('publish')};
   it('copies a valid image into the repository and rewrites the path',()=>{
    const up=setup();fs.writeFileSync(path.join(up,NAME),png);
    const r=send('/uploads/'+NAME);expect(r.outcome).toBe('sent');
    expect(g(['show','--name-only','--format=','HEAD'],remote)).toContain('apps/web/public/cms-media/'+NAME);
    expect(g(['show','HEAD:packages/content/published-posts.json'],remote)).toContain('"/cms-media/'+NAME+'"');
    expect(run('undo').outcome).toBe('sent');
    expect(()=>g(['cat-file','-e','HEAD:apps/web/public/cms-media/'+NAME],remote)).toThrow();
   });
   it('blocks wrong content, oversize, missing, symlink and bad names; nothing is committed',()=>{
    const up=setup();const head=()=>g(['rev-parse','HEAD'],remote);const before=head();
    fs.writeFileSync(path.join(up,NAME),Buffer.from('<html>not an image</html> padding padding'));expect(send('/uploads/'+NAME).outcome).toBe('blocked');
    fs.writeFileSync(path.join(up,NAME),Buffer.concat([png,Buffer.alloc(2_100_000)]));expect(send('/uploads/'+NAME).outcome).toBe('blocked');
    fs.rmSync(path.join(up,NAME));expect(send('/uploads/'+NAME).outcome).toBe('blocked');
    fs.writeFileSync(path.join(tmp,'real.png'),png);fs.symlinkSync(path.join(tmp,'real.png'),path.join(up,NAME));expect(send('/uploads/'+NAME).outcome).toBe('blocked');
    expect(send('/uploads/../../etc/passwd').outcome).toBe('blocked');
    expect(head()).toBe(before);
   });
  });
  describe('undo with unrelated code on top',()=>{
   it('undoes an older CMS send when later commits touched other files; conflicts when they touched the same files',()=>{
    const seed=path.join(tmp,'seed2');g(['clone',remote,seed],tmp);
    const home={home:{version:77,fields:{}}};
    fs.writeFileSync(snap,JSON.stringify({pages:home,posts:[]}));expect(run('publish').outcome).toBe('sent');
    g(['pull','-q','origin','main'],seed);fs.writeFileSync(path.join(seed,'code.txt'),'x');g(['add','-A'],seed);g(['commit','-qm','unrelated code'],seed);g(['push','-q','origin','main'],seed);
    const code=g(['rev-parse','HEAD'],remote);
    expect(run('undo').outcome).toBe('sent');
    expect(g(['ls-tree','--name-only','HEAD'],remote)).toContain('code.txt');
    expect(g(['show','HEAD:packages/content/published-pages.json'],remote).trim()).not.toContain('"version": 77');
    expect(g(['merge-base','--is-ancestor',code,'HEAD'],remote)).toBe('');
    // now touch the content file by hand after a new send, undo must refuse to overwrite it
    fs.writeFileSync(snap,JSON.stringify({pages:{home:{version:78,fields:{}}},posts:[]}));expect(run('publish').outcome).toBe('sent');
    g(['pull','-q','origin','main'],seed);fs.writeFileSync(path.join(seed,'packages/content/published-pages.json'),'{"home":{"version":9,"fields":{}}}\n');g(['add','-A'],seed);g(['commit','-qm','manual edit'],seed);g(['push','-q','origin','main'],seed);
    const before=g(['rev-parse','HEAD'],remote);
    expect(run('undo').outcome).toBe('conflict');expect(g(['rev-parse','HEAD'],remote)).toBe(before);
   });
  });
  describe('lock and content version',()=>{
   it('a second process cannot run while the lock folder is fresh, and a send reports a content version that matches the tree',async()=>{
    const lock=path.join(tmp,'work.lock');fs.mkdirSync(lock);
    fs.writeFileSync(snap,JSON.stringify({pages:{home:{version:91,fields:{}}},posts:[]}));
    expect(run('publish').outcome).toBe('conflict');fs.rmSync(lock,{recursive:true});
    const r=run('publish');expect(r.outcome).toBe('sent');
    const {contentVersion}=await import(path.join(root,'scripts/cms/content-version.mjs'));
    expect(r.contentVersion).toMatch(/^[0-9a-f]{32}$/);expect(r.contentVersion).toBe(contentVersion(path.join(tmp,'work')));
    expect(fs.existsSync(lock)).toBe(false);
    const before=r.contentVersion;fs.writeFileSync(snap,JSON.stringify({pages:{home:{version:92,fields:{}}},posts:[]}));
    expect(run('publish').contentVersion).not.toBe(before);
   });
  });
  describe('lock owner and asset quota on the committed tree',()=>{
   it('a lock held by a running publisher is never taken over, even when old; a dead owner is taken over',()=>{
    const lock=path.join(tmp,'work.lock');
    const holder=spawnSync(process.execPath,['-e','0']);void holder;
    const child=spawn(process.execPath,['-e','setTimeout(()=>{},30000)'],{stdio:'ignore'});
    try{
     fs.mkdirSync(lock);fs.writeFileSync(path.join(lock,'pid'),String(child.pid));const old=new Date(Date.now()-3600_000);fs.utimesSync(lock,old,old);
     fs.writeFileSync(snap,JSON.stringify({pages:{home:{version:95,fields:{}}},posts:[]}));
     expect(run('publish').outcome).toBe('conflict');expect(fs.existsSync(lock)).toBe(true);
    }finally{child.kill()}
    const dead=spawnSync(process.execPath,['-e','0']);fs.writeFileSync(path.join(lock,'pid'),String(dead.pid||999999));
    expect(run('publish').outcome).toBe('sent');expect(fs.existsSync(lock)).toBe(false);
   });
   it('image quota counts what is already committed in the repository',()=>{
    const seed=path.join(tmp,'seed3');g(['clone',remote,seed],tmp);g(['pull','-q','origin','main'],seed);
    fs.mkdirSync(path.join(seed,'apps/web/public/cms-media'),{recursive:true});
    fs.writeFileSync(path.join(seed,'apps/web/public/cms-media/1700000000000-aaaaaaaaaaaaaaaa.png'),Buffer.alloc(39_500_000));
    g(['add','-A'],seed);g(['commit','-qm','existing media'],seed);g(['push','-q','origin','main'],seed);
    const up=path.join(tmp,'uploads2');fs.mkdirSync(up,{recursive:true});process.env.UPLOAD_DIR=up;
    const NAME='1795532541999-96a3694b43a754fd.png';fs.writeFileSync(path.join(up,NAME),Buffer.concat([Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]),Buffer.alloc(900_000,1)]));
    fs.writeFileSync(snap,JSON.stringify({pages:{home:{version:96,fields:{}}},posts:[{id:'i',slug:'q',title:'t',excerpt:'e',content:'c',author:'x',status:'PUBLISHED',coverImage:'/uploads/'+NAME}]}));
    const before=g(['rev-parse','HEAD'],remote);expect(run('publish').outcome).toBe('blocked');expect(g(['rev-parse','HEAD'],remote)).toBe(before);
   });
  });
 });
});
