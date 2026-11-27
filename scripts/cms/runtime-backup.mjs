// Backs up the CMS runtime state that the database dump does not cover: uploaded image files,
// plus the review pointer and release log. Built previews are not copied (rebuildable from the DB).
// Ordering: take the DB dump FIRST, then this backup. The app never deletes uploaded files (media delete removes only
// the DB row), so a runtime archive taken after a dump contains every file that dump references.
// Bounds (env): RUNTIME_BACKUP_MAX_MB total size of all archives (default 1024), RUNTIME_BACKUP_MIN_FREE_MB free disk that must remain after the
// new archive (default 1024). Oldest archives are pruned past the size cap but never below 3. A backup that cannot fit is refused (exit 2), nothing is deleted for it.
// Usage: node scripts/cms/runtime-backup.mjs backup <runtime-dir> <backup-dir> [keep=14]
//        node scripts/cms/runtime-backup.mjs check <db-dump.sql> <archive.tgz|uploads-dir>   (every /uploads/<file> the dump references must exist)
//        node scripts/cms/runtime-backup.mjs restore <archive.tgz> <EMPTY-target-dir>
// restore refuses a non-empty target and never writes to the live runtime dir unless it is empty.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {execFileSync} from 'node:child_process';
const [cmd,a,b,c]=process.argv.slice(2);
// Reads every upload filename the database references right now (Media rows, page/collection JSON, post covers).
// DB access is optional: without DATABASE_URL or DATABASE_PASSWORD the archive is written without a manifest and says so.
async function dbReferences(){
 if(!process.env.DATABASE_URL&&process.env.DATABASE_PASSWORD)process.env.DATABASE_URL=`mysql://yukti:${encodeURIComponent(process.env.DATABASE_PASSWORD)}@database:3306/yukti_cms`;
 if(!process.env.DATABASE_URL)return null;
 const {prisma}=await import('@yukti/database');
 try{
  const names=new Set();const re=/\/uploads\/([A-Za-z0-9._-]+\.(?:jpe?g|png|webp))/gi;
  for(const m of await prisma.media.findMany({select:{fileName:true,url:true}})){names.add(m.fileName);}
  for(const r of await prisma.siteSetting.findMany({select:{value:true}}))for(const m of String(r.value).matchAll(re))names.add(m[1]);
  for(const r of await prisma.insight.findMany({select:{coverImage:true}}))if(r.coverImage)for(const m of String(r.coverImage).matchAll(re))names.add(m[1]);
  return [...names].sort();
 }finally{await prisma.$disconnect()}
}
const sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
if(cmd==='backup'){
 if(!a||!b)throw Error('Usage: backup <runtime-dir> <backup-dir> [keep]');
 const rt=path.resolve(a),dest=path.resolve(b),keep=Math.max(3,Number(c||14));
 if(dest===rt||dest.startsWith(path.join(rt,'uploads')))throw Error('Backup dir must not be the uploads dir');
 fs.mkdirSync(dest,{recursive:true,mode:0o700});
const MB=1048576,maxTotal=Number(process.env.RUNTIME_BACKUP_MAX_MB||1024)*MB,minFree=Number(process.env.RUNTIME_BACKUP_MIN_FREE_MB||1024)*MB;
 const upDir=path.join(rt,'uploads');let upBytes=0;if(fs.existsSync(upDir))for(const f of fs.readdirSync(upDir)){const st=fs.lstatSync(path.join(upDir,f));if(st.isFile())upBytes+=st.size}
 const sf=fs.statfsSync(dest);const free=sf.bavail*sf.bsize;
 // worst case: staging copy plus the archive, so 2x the uploads size
 if(free-2*upBytes<minFree){console.error(JSON.stringify({refused:'not enough free disk',freeMB:Math.floor(free/MB),uploadsMB:Math.floor(upBytes/MB),minFreeMB:minFree/MB}));process.exit(2)}
 if(upBytes>maxTotal){console.error(JSON.stringify({refused:'uploads alone exceed the backup size cap',uploadsMB:Math.floor(upBytes/MB),capMB:maxTotal/MB}));process.exit(2)}
 const stage=fs.mkdtempSync(path.join(dest,'.stage-'));
 try{
  const up=path.join(rt,'uploads');fs.mkdirSync(path.join(stage,'uploads'));
  let n=0;if(fs.existsSync(up))for(const f of fs.readdirSync(up)){const s=path.join(up,f);if(fs.lstatSync(s).isFile()){fs.copyFileSync(s,path.join(stage,'uploads',f));n++}}
  const rv=path.join(rt,'reviews');let current=null;try{current=fs.readlinkSync(path.join(rv,'current'))}catch{}
  let refs=null;try{refs=await dbReferences()}catch(e){console.error(JSON.stringify({manifestError:String(e.message||e).slice(0,200)}))}
  const have=new Set(fs.existsSync(path.join(stage,'uploads'))?fs.readdirSync(path.join(stage,'uploads')):[]);
  const missing=refs?refs.filter(r=>!have.has(r)):null;
  fs.writeFileSync(path.join(stage,'manifest.json'),JSON.stringify({capturedAt:new Date().toISOString(),referenced:refs,missing}));
  fs.writeFileSync(path.join(stage,'review-state.json'),JSON.stringify({current,at:new Date().toISOString()}));
  if(fs.existsSync(path.join(rv,'release-log.jsonl')))fs.copyFileSync(path.join(rv,'release-log.jsonl'),path.join(stage,'release-log.jsonl'));
  const stamp=new Date().toISOString().replace(/[:.]/g,'-');const out=path.join(dest,`runtime-${stamp}.tgz`);
  execFileSync('tar',['czf',out+'.part','-C',stage,'.']);fs.renameSync(out+'.part',out);
  fs.writeFileSync(out+'.sha256',sha(out)+'  '+path.basename(out)+'\n');
  const all=fs.readdirSync(dest).filter(x=>/^runtime-.*\.tgz$/.test(x)).sort();
  const sizeOf=x=>fs.statSync(path.join(dest,x)).size;const drop=new Set(all.slice(0,Math.max(0,all.length-keep)));
  let live=all.filter(x=>!drop.has(x));let total=live.reduce((t,x)=>t+sizeOf(x),0);
  while(total>maxTotal&&live.length>3){const x=live.shift();drop.add(x);total-=sizeOf(x)}
  for(const old of all.filter(x=>drop.has(x))){fs.rmSync(path.join(dest,old),{force:true});fs.rmSync(path.join(dest,old+'.sha256'),{force:true})}
  if(missing&&missing.length)process.exitCode=3;console.log(JSON.stringify({manifest:refs?{referenced:refs.length,missing:missing.length}:'none (no database access)',archive:out,uploads:n,bytes:fs.statSync(out).size,kept:all.length-drop.size,totalBytes:total}));
 }finally{fs.rmSync(stage,{recursive:true,force:true})}
}else if(cmd==='check'){
 if(!a||!b)throw Error('Usage: check <db-dump.sql> <archive.tgz|uploads-dir>');
 const sql=fs.readFileSync(path.resolve(a),'utf8');const refs=[...new Set([...sql.matchAll(/\/uploads\/([A-Za-z0-9._-]+\.(?:jpe?g|png|webp))/gi)].map(m=>m[1]))];
 const target=path.resolve(b);let have;
 if(fs.statSync(target).isDirectory())have=new Set(fs.readdirSync(target));
 else have=new Set(execFileSync('tar',['tzf',target]).toString().split('\n').map(x=>path.basename(x)));
 const missing=refs.filter(r=>!have.has(r));
 console.log(JSON.stringify({referenced:refs.length,missing}));if(missing.length)process.exit(3);
}else if(cmd==='restore'){
 if(!a||!b)throw Error('Usage: restore <archive.tgz> <empty-target-dir>');
 const arc=path.resolve(a),tgt=path.resolve(b);
 const want=fs.readFileSync(arc+'.sha256','utf8').split(' ')[0];if(sha(arc)!==want)throw Error('Checksum mismatch. Nothing restored.');
 fs.mkdirSync(tgt,{recursive:true});if(fs.readdirSync(tgt).length)throw Error('Target must be empty. Nothing restored.');
 const listing=execFileSync('tar',['tzf',arc]).toString().split('\n').filter(Boolean);
 if(listing.some(x=>x.startsWith('/')||x.split('/').includes('..')))throw Error('Unsafe archive paths. Nothing restored.');
 execFileSync('tar',['xzf',arc,'-C',tgt,'--no-same-owner']);
 console.log(JSON.stringify({restoredTo:tgt,uploads:fs.readdirSync(path.join(tgt,'uploads')).length}));
}else throw Error('Usage: backup|restore');
