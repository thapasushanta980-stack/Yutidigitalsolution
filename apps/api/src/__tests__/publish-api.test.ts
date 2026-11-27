// Needs a disposable database: run with YUKTI_TEST_DB=1 and DATABASE_URL pointing at an empty migrated test DB.
import {describe,it,expect,beforeAll,afterAll,vi} from 'vitest';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
const spawned:{args:string[];envKeys:Record<string,string|undefined>}[]=[];
vi.mock('node:child_process',async orig=>{const real=await orig<typeof import('node:child_process')>();return {...real,spawn:((cmd:string,args:string[],opts:{env?:Record<string,string>})=>{spawned.push({args:[cmd,...args],envKeys:{...opts.env}});return real.spawn(cmd,args,opts as never)}) as typeof real.spawn}});
const run=process.env.YUKTI_TEST_DB==='1'?describe:describe.skip;
const root=path.resolve(__dirname,'../../../..');
const SECRET='SECRETTOKEN123';
const g=(a:string[],cwd:string)=>execFileSync('git',a,{cwd,encoding:'utf8',env:{...process.env,GIT_AUTHOR_NAME:'t',GIT_AUTHOR_EMAIL:'t@t',GIT_COMMITTER_NAME:'t',GIT_COMMITTER_EMAIL:'t@t'}}).trim();
run('publish API against a disposable database',()=>{
 let app:import('express').Express,prisma:typeof import('@yukti/database').prisma,tmp='',remote='',cookie:Record<string,string>={};
 const log=()=>g(['log','--format=%s'],remote).split('\n');
 const showPages=()=>JSON.parse(g(['show','main:packages/content/published-pages.json'],remote));
 const send=(who:string,p:string,body:unknown={confirm:true})=>request(app).post('/api/v1/admin/publish/'+p).set('Cookie',cookie[who]).send(body as object);
 const audits=async()=>(await prisma.auditLog.findMany({where:{entity:'SITE_PUBLISH'},orderBy:{createdAt:'asc'}}));
 beforeAll(async()=>{
  tmp=fs.mkdtempSync(path.join(os.tmpdir(),'pubapi-'));remote=path.join(tmp,SECRET+'-remote.git');
  g(['init','--bare','-b','main',remote],tmp);const seed=path.join(tmp,'seed');g(['clone',remote,seed],tmp);g(['checkout','-b','main'],seed);
  fs.mkdirSync(path.join(seed,'packages/content'),{recursive:true});
  fs.writeFileSync(path.join(seed,'packages/content/published-pages.json'),JSON.stringify({home:{version:1,fields:{field1:'STALE FILE'}}}));
  fs.writeFileSync(path.join(seed,'packages/content/published-posts.json'),'[]\n');fs.mkdirSync(path.join(seed,'docs'));fs.writeFileSync(path.join(seed,'docs/team.md'),'teammate');
  g(['add','-A'],seed);g(['commit','-m','seed'],seed);g(['push','origin','main'],seed);
  Object.assign(process.env,{NODE_ENV:'test',JWT_SECRET:'x'.repeat(40),CMS_PUBLISH_ROOT:root,CMS_PUBLISH_REMOTE:remote,CMS_PUBLISH_WORKDIR:path.join(tmp,'work'),CMS_PUBLISH_BRANCH:'main'});
  delete process.env.CMS_PUBLISH_ENABLED;
  ({prisma}=await import('@yukti/database'));
  const {createApp}=await import('../app.js');const {signToken}=await import('../middlewares/auth.js');const {env}=await import('../config/env.js');
  app=createApp();
  for(const name of ['SUPER_ADMIN','ADMIN','EDITOR'] as const){
   const role=await prisma.role.upsert({where:{name},create:{name},update:{}});
   const u=await prisma.user.create({data:{email:name.toLowerCase()+'@t.test',name,passwordHash:'x',roleId:role.id}});
   cookie[name]=`${env.COOKIE_NAME}=${signToken({sub:u.id,role:name})}`;
   if(name==='EDITOR'){const off=await prisma.user.create({data:{email:'off@t.test',name:'off',passwordHash:'x',roleId:role.id,isActive:false}});cookie.INACTIVE=`${env.COOKIE_NAME}=${signToken({sub:off.id,role:name})}`}
  }
 },60000);
 afterAll(()=>fs.rmSync(tmp,{recursive:true,force:true}));
 const enable=()=>{process.env.CMS_PUBLISH_ENABLED='true'};
 it('is off by default: no route works and nothing is touched',async()=>{
  expect((await send('ADMIN','publish')).status).toBe(404);
  expect((await request(app).get('/api/v1/admin/publish').set('Cookie',cookie.ADMIN)).body.data.enabled).toBe(false);
  expect(log()).toEqual(['seed']);expect(await audits()).toHaveLength(0);
 });
 it('rejects anonymous, inactive and malformed requests',async()=>{
  enable();
  expect((await request(app).post('/api/v1/admin/publish/publish').send({confirm:true})).status).toBe(401);
  expect((await request(app).get('/api/v1/admin/publish')).status).toBe(401);
  expect((await send('INACTIVE','publish')).status).toBe(401);
  for(const body of [{},{confirm:false},{confirm:'true'},{confirm:true,force:true}])expect((await send('EDITOR','publish',body)).status).toBeGreaterThanOrEqual(400);
  expect(log()).toEqual(['seed']);expect(await audits()).toHaveLength(0);
 });
 it('sends only approved content, replaces the stale file, never drafts',async()=>{
  const e=cookie.EDITOR;
  const put=await request(app).put('/api/v1/admin/content/home').set('Cookie',e).send({expectedVersion:0,fields:{field1:'APPROVED TITLE'}});expect(put.status).toBe(200);
  await request(app).post('/api/v1/admin/content/home/publish').set('Cookie',e).send({expectedVersion:1}).expect(200);
  await request(app).put('/api/v1/admin/content/home').set('Cookie',e).send({expectedVersion:2,fields:{field1:'DRAFT ONLY EDIT'}}).expect(200);
  await request(app).post('/api/v1/admin/insights').set('Cookie',e).send({title:'Draft post',excerpt:'draft excerpt',content:'draft body text',author:'Ed',status:'DRAFT'}).expect(201);
  await request(app).post('/api/v1/admin/insights').set('Cookie',e).send({title:'Live post',excerpt:'live excerpt',content:'live body text',author:'Ed',status:'PUBLISHED'}).expect(201);
  const r=await send('EDITOR','publish');
  expect(r.status).toBe(200);expect(r.body.data).toMatchObject({outcome:'sent',action:'publish',deployVerified:false});
  expect(r.body.data.commit).toMatch(/^[0-9a-f]{40}$/);
  expect(showPages().home.fields.field1).toBe('APPROVED TITLE');
  const posts=JSON.parse(g(['show','main:packages/content/published-posts.json'],remote));
  expect(posts.map((p:{title:string})=>p.title)).toEqual(['Live post']);
  expect(g(['show','main:docs/team.md'],remote)).toBe('teammate');
  const again=await send('ADMIN','publish');expect(again.body.data.outcome).toBe('no_changes');
  // approving the newer draft changes what the next send exports
  await request(app).post('/api/v1/admin/content/home/publish').set('Cookie',e).send({expectedVersion:3}).expect(200);
  expect((await send('SUPER_ADMIN','publish')).body.data.outcome).toBe('sent');
  expect(showPages().home.fields.field1).toBe('DRAFT ONLY EDIT');
 },60000);
 it('every role in the content editing set can read status; last attempt comes from the database',async()=>{
  for(const who of ['EDITOR','ADMIN','SUPER_ADMIN']){const r=await request(app).get('/api/v1/admin/publish').set('Cookie',cookie[who]);expect(r.status).toBe(200);expect(r.body.data.last).toMatchObject({action:'publish',outcome:'sent',deployVerified:false});}
 });
 it('undo reverts only the newest CMS send; refuses after a teammate push; keeps their work',async()=>{
  const u=await send('EDITOR','undo');expect(u.body.data.outcome).toBe('sent');expect(log()[0]).toMatch(/^Revert "CMS publish/);
  expect(showPages().home.fields.field1).toBe('APPROVED TITLE');
  const d=fs.mkdtempSync(path.join(tmp,'mate-'));g(['clone','-q',remote,d],tmp);fs.writeFileSync(path.join(d,'docs/team.md'),'teammate edit');g(['commit','-qam','Teammate: edit'],d);g(['push','-q','origin','main'],d);
  const before=g(['rev-parse','main'],remote);
  const r=await send('ADMIN','undo');expect(r.status).toBe(409);expect(r.body.error.message).toMatch(/not a CMS send/);
  expect(g(['rev-parse','main'],remote)).toBe(before);
 });
 it('a failing remote answers honestly, releases the lock, and records it',async()=>{
  const good=process.env.CMS_PUBLISH_REMOTE;process.env.CMS_PUBLISH_REMOTE=path.join(tmp,'nope-'+SECRET+'.git');
  await request(app).put('/api/v1/admin/content/about').set('Cookie',cookie.EDITOR).send({expectedVersion:0,fields:{}}).expect(200);
  const r=await send('EDITOR','publish');expect(r.status).toBe(500);
  expect(JSON.stringify(r.body)).not.toContain(SECRET);expect(r.body.error.message).toMatch(/Nothing was sent/);
  const st=await request(app).get('/api/v1/admin/publish').set('Cookie',cookie.EDITOR);expect(st.body.data.last.outcome).toBe('failed');
  process.env.CMS_PUBLISH_REMOTE=good;
  const ok=await send('EDITOR','publish');expect(['sent','no_changes']).toContain(ok.body.data.outcome);
 },60000);
 it('two simultaneous requests: one runs, the other is told so',async()=>{
  await request(app).put('/api/v1/admin/content/contact').set('Cookie',cookie.EDITOR).send({expectedVersion:0,fields:{}}).expect(200);
  const [a,b]=await Promise.all([send('EDITOR','publish'),send('ADMIN','publish')]);
  const codes=[a.status,b.status].sort();expect(codes[1]).toBe(409);expect(codes[0]).toBe(200);
  const loser=a.status===409?a:b;expect(loser.body.error.message).toMatch(/already running/);
 },60000);
 it('credentials stay out of process arguments, responses, audit rows and the working copy',async()=>{
  expect(spawned.length).toBeGreaterThan(3);
  for(const s of spawned)expect(s.args.join(' ')).not.toContain(SECRET);
  const rows=JSON.stringify(await audits());expect(rows).not.toContain(SECRET);
  for(const row of await audits())expect(row.userId).toBeTruthy();
  const cfg=fs.readFileSync(path.join(tmp,'work/.git/config'),'utf8');expect(cfg).not.toContain(SECRET);
 });
 it('audit rows exist for sent, no_changes, refused and failed attempts',async()=>{
  const outs=(await audits()).map(r=>JSON.parse(r.metadata||'{}').outcome);
  for(const o of ['sent','no_changes','refused','failed'])expect(outs).toContain(o);
 });
});
