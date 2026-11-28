// Guard for CMS sends that can reach the live site. Pure checks, no network, fails closed.
// It reduces application mistakes. It is NOT a defence against a compromised deploy key.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {MEDIA_PATH,kind} from './publish-assets.mjs';
export const FILES=['packages/content/published-pages.json','packages/content/published-posts.json'];
export const MAX_BYTES=1_000_000,MAX_IMAGE=2_000_000,MAX_STRING=20_000,MAX_DEPTH=8,MAX_NODES=20_000;
const BAD_SCHEME=/^\s*(javascript|vbscript|data|file|blob):/i;
const CONTROL=/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/;
const OK_URL=/^(https:\/\/[^\s<>"']+|mailto:[^\s<>"']+|tel:[+0-9() -]+|\/(?!\/)[A-Za-z0-9._~\/%#?=&-]*)$/;
const URL_KEY=/(url|href|src|link|image)$/i;
const MEDIA_REF=/^\/cms-media\/[0-9]{10,16}-[0-9a-f]{16}\.(jpg|png|webp)$/;
export class Refusal extends Error{constructor(reason){super(reason);this.reason=reason}}
const fail=r=>{throw new Refusal(r)};
// The website renders every string as React text (no raw HTML anywhere in apps/web), so markup inside text is inert.
// What can be dangerous is a string used as an address (image source, link, canonical). Those get a strict allowlist.
function walk(v,depth,state,where,key=''){
 if(++state.nodes>MAX_NODES)fail('too many values');
 if(depth>MAX_DEPTH)fail('nested too deep at '+where);
 if(v===null||typeof v==='number'||typeof v==='boolean')return;
 if(typeof v==='string'){
  if(v.length>MAX_STRING)fail('text too long at '+where);
  if(CONTROL.test(v))fail('control characters in '+where);
  if(BAD_SCHEME.test(v))fail('unsafe link scheme in '+where);
  if(/(^|["'(\s])\/?uploads\//i.test(v))fail('uploaded file reference that was not published in '+where);
  if(URL_KEY.test(key)&&v!==''&&!OK_URL.test(v))fail('link or image address is not allowed in '+where);
  if(key==='coverImage'&&v.startsWith('/')&&!MEDIA_REF.test(v))fail('image path is not a published image in '+where);
  return;
 }
 if(Array.isArray(v)){v.forEach((x,i)=>walk(x,depth+1,state,where+'['+i+']',key));return}
 if(typeof v==='object'){for(const [k,x] of Object.entries(v)){if(k==='__proto__'||k==='constructor')fail('forbidden key');walk(x,depth+1,state,where+'.'+k,k)}return}
 fail('unsupported value at '+where);
}
// Posts: only PUBLISHED may leave the CMS. Pages: object keyed by page slug.
export function checkContent(pages,posts){
 if(!pages||typeof pages!=='object'||Array.isArray(pages))fail('pages must be an object');
 if(!Array.isArray(posts))fail('posts must be a list');
 for(const p of posts){if(!p||p.status!=='PUBLISHED')fail('post "'+(p&&p.slug)+'" is not in published status')}
 const state={nodes:0};walk(pages,0,state,'pages');walk(posts,0,state,'posts');
}
// Check the staged change before committing: exact paths, plain files only, images checked by content.
export function checkStaged(workdir,git=(a)=>execFileSync('git',a,{cwd:workdir,encoding:'utf8'})){
 const raw=git(['diff','--cached','--raw','-z','--no-renames']).split('\0').filter(Boolean);
 const paths=[];
 for(let i=0;i<raw.length;i+=2){
  const [mo,mn,,,st]=raw[i].slice(1).split(' ');const p=raw[i+1];
  const isMedia=MEDIA_PATH.test(p);
  if(!FILES.includes(p)&&!isMedia)fail('unexpected path '+p);
  if(!['M','A'].includes(st)||(isMedia&&st!=='A')||mn!=='100644'||(mo!=='000000'&&mo!=='100644'))fail('unexpected file type or change for '+p);
  paths.push(p);
 }
 if(!paths.length)fail('nothing staged');
 for(const f of paths){
  const full=path.join(workdir,f);const s=fs.lstatSync(full);
  if(!s.isFile()||s.isSymbolicLink())fail('not a plain file: '+f);
  if(s.size>(FILES.includes(f)?MAX_BYTES:MAX_IMAGE))fail('file too large: '+f);
  if(!FILES.includes(f)){const k=kind(fs.readFileSync(full));if(!k||!f.endsWith('.'+k))fail('image content does not match its type: '+f)}
 }
 let pages,posts;
 try{pages=JSON.parse(fs.readFileSync(path.join(workdir,FILES[0]),'utf8'));posts=JSON.parse(fs.readFileSync(path.join(workdir,FILES[1]),'utf8'))}catch{fail('content is not valid JSON')}
 checkContent(pages,posts);
 // every published cover image must exist in the repository
 for(const p of posts)if(typeof p.coverImage==='string'&&MEDIA_REF.test(p.coverImage)&&!fs.existsSync(path.join(workdir,'apps/web/public',p.coverImage)))fail('cover image file is missing from the repository');
 if(git(['status','--porcelain','--untracked-files=all']).split('\n').filter(Boolean).some(l=>{const p=l.slice(3);return !FILES.includes(p)&&!MEDIA_PATH.test(p)}))fail('other changes in work tree');
}
