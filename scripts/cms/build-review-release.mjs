import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
const [input,output]=process.argv.slice(2);
if(!input||!output)throw Error('Usage: node scripts/cms/build-review-release.mjs snapshot.json output-directory');
const out=path.resolve(output);const root=process.cwd();
if(out===root||out.startsWith(path.join(root,'apps'))||out.startsWith(path.join(root,'packages')))throw Error('Use a separate review output directory');
const lock=path.join(root,'.cms-review-build.lock');let fd;
try{fd=fs.openSync(lock,'wx',0o600)}catch{throw Error('Another review build is active. No files changed.');}
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'yukti-review-build-'));const snapshotPath=path.join(scratch,'packages/content/published-pages.json');const id=new Date().toISOString().replace(/[:.]/g,'-')+'-'+crypto.randomBytes(4).toString('hex');
const pending=path.join(out,`.pending-${id}`);
let cleaned=false;function cleanup(){if(cleaned)return;cleaned=true;fs.rmSync(scratch,{recursive:true,force:true});fs.rmSync(pending,{recursive:true,force:true});fs.closeSync(fd);fs.unlinkSync(lock);}
process.on('SIGTERM',()=>{cleanup();process.exit(143)});process.on('SIGINT',()=>{cleanup();process.exit(130)});
try{
 fs.mkdirSync(out,{recursive:true});
 fs.cpSync(root,scratch,{recursive:true,filter:p=>!/(^|\/)(node_modules|\.git|dist|dist-ssr|uploads|\.env|\.cms-review-build.lock)(\/|$)/.test(path.relative(root,p))});
 fs.symlinkSync(path.join(root,'node_modules'),path.join(scratch,'node_modules'),'dir');
 execFileSync(process.execPath,['scripts/cms/export-pages.mjs',path.resolve(input)],{stdio:'pipe',cwd:scratch,timeout:150000,killSignal:'SIGTERM'});
 execFileSync('npm',['run','build:web'],{stdio:'pipe',cwd:scratch,timeout:150000,killSignal:'SIGTERM'});
 fs.cpSync(path.join(scratch,'apps/web/dist'),pending,{recursive:true});
 const uploads=process.env.CMS_UPLOAD_DIR;if(uploads&&fs.existsSync(uploads)){const dest=path.join(pending,'uploads');fs.mkdirSync(dest,{recursive:true});const used=fs.readFileSync(snapshotPath,'utf8')+fs.readFileSync(path.resolve(input),'utf8');for(const f of fs.readdirSync(uploads)){if(!used.includes('/uploads/'+f))continue;if(!/^[A-Za-z0-9._-]+\.(jpe?g|png|webp)$/i.test(f))continue;const src=path.join(uploads,f);if(fs.lstatSync(src).isFile())fs.copyFileSync(src,path.join(dest,f));}}
 function noindex(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,ent.name);if(ent.isDirectory())noindex(p);else if(ent.name.endsWith('.html')){let html=fs.readFileSync(p,'utf8');html=html.replace(/<meta\b[^>]*name="robots"[^>]*>/gi,'').replace('</head>','<meta name="robots" content="noindex, nofollow, noarchive"></head>');fs.writeFileSync(p,html);}}}
 noindex(pending);fs.writeFileSync(path.join(pending,'robots.txt'),'User-agent: *\nDisallow: /\n');
 fs.writeFileSync(path.join(pending,'_headers'),'/*\n  X-Robots-Tag: noindex, nofollow, noarchive\n  Cache-Control: no-store\n');
 fs.writeFileSync(path.join(pending,'review-release.json'),JSON.stringify({id,kind:'isolated-review-only',snapshotSha256:crypto.createHash('sha256').update(fs.readFileSync(snapshotPath)).digest('hex')},null,2));
 const release=path.join(out,id);fs.renameSync(pending,release);
 const next=path.join(out,'.current-next');try{fs.unlinkSync(next)}catch{}
 fs.symlinkSync(id,next);fs.renameSync(next,path.join(out,'current'));
 try{const keep=Math.max(5,Number(process.env.CMS_REVIEW_KEEP||20));const cur=fs.readlinkSync(path.join(out,'current'));const ids=fs.readdirSync(out).filter(n=>/^\d{4}-\d{2}-\d{2}T[\dTZ-]+-[a-f0-9]{8}$/.test(n)&&fs.statSync(path.join(out,n)).isDirectory()).sort().reverse();for(const old of ids.slice(keep)){if(old!==cur&&old!==id)fs.rmSync(path.join(out,old),{recursive:true,force:true})}}catch{}
 console.log(JSON.stringify({id,output:release,current:path.join(out,'current'),productionDeploy:false}));
}finally{
 cleanup();
}
