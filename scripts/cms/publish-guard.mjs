// Guard for CMS sends that can reach the live site. Pure checks, no network, fails closed.
// It reduces application mistakes. It is NOT a defence against a compromised deploy key.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
export const FILES=['packages/content/published-pages.json','packages/content/published-posts.json'];
export const MAX_BYTES=1_000_000,MAX_STRING=20_000,MAX_DEPTH=8,MAX_NODES=20_000;
const BAD_MARKUP=/<\s*\/?\s*(script|iframe|object|embed|style|link|meta|base|form|svg|math)\b|\bon[a-z]+\s*=|srcdoc\s*=|style\s*=/i;
const URLISH=/^\s*[a-z][a-z0-9+.-]*:/i;
const OK_SCHEME=/^\s*(https:|mailto:|tel:)/i;
export class Refusal extends Error{constructor(reason){super(reason);this.reason=reason}}
const fail=r=>{throw new Refusal(r)};
function walk(v,depth,state,where){
 if(++state.nodes>MAX_NODES)fail('too many values');
 if(depth>MAX_DEPTH)fail('nested too deep at '+where);
 if(v===null||typeof v==='number'||typeof v==='boolean')return;
 if(typeof v==='string'){
  if(v.length>MAX_STRING)fail('text too long at '+where);
  if(BAD_MARKUP.test(v))fail('active markup in '+where);
  if(URLISH.test(v)&&!OK_SCHEME.test(v))fail('unsafe link scheme in '+where);
  // Assets live on the CMS volume, not in the website repository. A reference would be a broken image on the live site.
  if(/(^|["'(\s])\/?uploads\//i.test(v))fail('uploaded file reference in '+where+' (assets are not published)');
  return;
 }
 if(Array.isArray(v)){v.forEach((x,i)=>walk(x,depth+1,state,where+'['+i+']'));return}
 if(typeof v==='object'){for(const [k,x] of Object.entries(v)){if(k==='__proto__'||k==='constructor')fail('forbidden key');walk(x,depth+1,state,where+'.'+k)}return}
 fail('unsupported value at '+where);
}
// Content rules. Posts: only PUBLISHED status may leave the CMS. Pages: object keyed by page slug.
export function checkContent(pages,posts){
 if(!pages||typeof pages!=='object'||Array.isArray(pages))fail('pages must be an object');
 if(!Array.isArray(posts))fail('posts must be a list');
 for(const p of posts){if(!p||p.status!=='PUBLISHED')fail('post "'+(p&&p.slug)+'" is not in published status')}
 const state={nodes:0};walk(pages,0,state,'pages');walk(posts,0,state,'posts');
}
// Check the staged change in the work tree before committing: exact paths, plain files only.
export function checkStaged(workdir,git=(a)=>execFileSync('git',a,{cwd:workdir,encoding:'utf8'})){
 const raw=git(['diff','--cached','--raw','-z','--no-renames']).split('\0').filter(Boolean);
 const paths=[];
 for(let i=0;i<raw.length;i+=2){
  const [mo,mn,,,st]=raw[i].slice(1).split(' ');const p=raw[i+1];
  if(!FILES.includes(p))fail('unexpected path '+p);
  if(!['M','A'].includes(st)||mn!=='100644'||(mo!=='000000'&&mo!=='100644'))fail('unexpected file type or change for '+p);
  paths.push(p);
 }
 if(!paths.length)fail('nothing staged');
 for(const f of FILES){
  const full=path.join(workdir,f);const s=fs.lstatSync(full);
  if(!s.isFile()||s.isSymbolicLink())fail('not a plain file: '+f);
  if(s.size>MAX_BYTES)fail('file too large: '+f);
 }
 let pages,posts;
 try{pages=JSON.parse(fs.readFileSync(path.join(workdir,FILES[0]),'utf8'));posts=JSON.parse(fs.readFileSync(path.join(workdir,FILES[1]),'utf8'))}catch{fail('content is not valid JSON')}
 checkContent(pages,posts);
 if(git(['status','--porcelain','--untracked-files=all']).split('\n').filter(Boolean).some(l=>!FILES.includes(l.slice(3))))fail('other changes in work tree');
}
