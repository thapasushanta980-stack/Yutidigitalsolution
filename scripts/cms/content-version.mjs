// A short fingerprint of exactly what the website serves from the CMS: the two content files and the published images.
// The CMS computes it when it sends; the website build writes the same value to /content-version.json; comparing them
// tells whether that exact content is live. Identical content gives an identical value, so there is no false match across different content.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
export const contentVersion=(root)=>{
 const h=createHash('sha256');
 const add=(label,buf)=>{h.update(label+'\0'+createHash('sha256').update(buf).digest('hex')+'\n')};
 for(const f of ['packages/content/published-pages.json','packages/content/published-posts.json']){let b=Buffer.alloc(0);try{b=fs.readFileSync(path.join(root,f))}catch{/* absent */}add(f,b)}
 const dir=path.join(root,'apps/web/public/cms-media');let names=[];try{names=fs.readdirSync(dir).sort()}catch{/* none */}
 for(const n of names)add('media/'+n,fs.readFileSync(path.join(dir,n)));
 return h.digest('hex').slice(0,32);
};
if(import.meta.url===`file://${process.argv[1]}`){
 const root=process.argv[2]||process.cwd();const out=path.join(root,'apps/web/public/content-version.json');
 fs.writeFileSync(out,JSON.stringify({contentVersion:contentVersion(root)})+'\n');console.log('content-version',contentVersion(root));
}
