// Copies the cover images a send refers to from the CMS upload folder into the website repository,
// with strict limits, and rewrites the reference to the repository path. Fails closed (throws Refusal-like Error).
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
export const MEDIA_DIR='apps/web/public/cms-media';
export const MEDIA_PATH=/^apps\/web\/public\/cms-media\/[0-9]{10,16}-[0-9a-f]{16}\.(jpg|png|webp)$/;
export const MAX_IMAGE_BYTES=2_000_000,MAX_IMAGES_PER_SEND=10,MAX_TOTAL_BYTES=40_000_000;
const UPLOAD_REF=/^\/uploads\/([0-9]{10,16}-[0-9a-f]{16}\.(?:jpg|png|webp))$/;
export const kind=b=>b.length>12&&b[0]===0xff&&b[1]===0xd8&&b[2]===0xff?'jpg':b.length>8&&b.subarray(0,8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]))?'png':b.length>12&&b.subarray(0,4).toString('latin1')==='RIFF'&&b.subarray(8,12).toString('latin1')==='WEBP'?'webp':null;
export class AssetError extends Error{constructor(r){super(r);this.reason=r}}
const fail=r=>{throw new AssetError(r)};
// posts: parsed published-posts.json. Returns the rewritten list and the files copied.
export function publishAssets(workdir,uploadDir,posts){
 let root='';const copied=[];let total=0;
 const need=()=>{if(root)return root;if(!uploadDir||!path.isAbsolute(uploadDir))fail('upload folder is not configured');try{root=fs.realpathSync(uploadDir)}catch{fail('upload folder is not available')}return root};
 const out=posts.map(p=>{
  if(typeof p.coverImage!=='string')return p;
  const m=UPLOAD_REF.exec(p.coverImage);
  if(!m)return p;
  const name=m[1];const src=path.join(need(),name);
  let st;try{st=fs.lstatSync(src)}catch{fail('cover image file is missing for post "'+p.slug+'"')}
  if(!st.isFile()||st.isSymbolicLink()||fs.realpathSync(src)!==src)fail('cover image is not a plain file');
  if(st.size>MAX_IMAGE_BYTES)fail('cover image is larger than 2 MB');
  const buf=fs.readFileSync(src);const k=kind(buf);
  if(!k||!name.endsWith('.'+k))fail('cover image content does not match its type');
  if(!copied.some(c=>c.name===name)){
   if(copied.length>=MAX_IMAGES_PER_SEND)fail('too many new images in one send');
   total+=buf.length;copied.push({name,sha:createHash('sha256').update(buf).digest('hex'),buf});
  }
  return {...p,coverImage:'/cms-media/'+name};
 });
 const dest=path.join(workdir,MEDIA_DIR);
 let existing=0;try{for(const f of fs.readdirSync(dest))existing+=fs.statSync(path.join(dest,f)).size}catch{/* none yet */}
 if(existing+total>MAX_TOTAL_BYTES)fail('image storage limit reached');
 if(copied.length)fs.mkdirSync(dest,{recursive:true});
 for(const c of copied)fs.writeFileSync(path.join(dest,c.name),c.buf,{mode:0o644});
 return {posts:out,files:copied.map(c=>MEDIA_DIR+'/'+c.name)};
}
