import {collectionName,parseCollection} from '../../packages/content/collections.mjs';
import fs from 'node:fs';
import registry from '../../packages/content/page-fields.json' with {type:'json'};
const input=process.argv[2];
if(!input){console.error('Usage: node scripts/cms/export-pages.mjs authenticated-published-snapshot.json');process.exit(1);}
const body=JSON.parse(fs.readFileSync(input,'utf8'));const envelope=body.data??body;const data=envelope.pages??envelope;
if(!data||Array.isArray(data)||typeof data!=='object')throw Error('Expected published snapshot object');
const out={};
for(const[key,doc]of Object.entries(data)){
 if(!Object.hasOwn(registry,key))throw Error(`Unmapped page: ${key}`);
 if(!Number.isSafeInteger(doc.version)||doc.version<1||!doc.fields||typeof doc.fields!=='object')throw Error(`Invalid published revision: ${key}`);
 for(const[field,value]of Object.entries(doc.fields)){if(!Object.hasOwn(registry[key].fields,field)||typeof value!=='string'||value.length>20000)throw Error(`Invalid field: ${key}.${field}`);}
 const name=collectionName(key);if(name&&doc.fields.items)parseCollection(name,doc.fields.items);
 out[key]={version:doc.version,fields:doc.fields};
}
const posts=envelope.pages?envelope.posts:[];
if(!Array.isArray(posts)||posts.length>1000)throw Error('Invalid posts snapshot');
const seen=new Set();
for(const post of posts){
 if(!post||typeof post!=='object'||typeof post.slug!=='string'||!/^[-a-z0-9]+$/.test(post.slug)||seen.has(post.slug))throw Error('Invalid/duplicate post URL');seen.add(post.slug);
 for(const k of ['id','title','excerpt','content','author'])if(typeof post[k]!=='string')throw Error('Invalid post field '+k);
 if(!['DRAFT','PUBLISHED','ARCHIVED'].includes(post.status))throw Error('Invalid post status');
 if(post.content.length>1000000)throw Error('Post content too large');
}
// Validate all input before replacing a build snapshot. Does not deploy anything.
const destination='packages/content/published-pages.json';
fs.writeFileSync(destination+'.pending',JSON.stringify(out,null,2)+'\n');fs.renameSync(destination+'.pending',destination);
fs.writeFileSync('packages/content/published-posts.json',JSON.stringify(posts.filter(p=>p.status==='PUBLISHED'||(envelope.reviewDraft===true&&p.status==='DRAFT')),null,2)+'\n');
console.log(`Prepared build snapshot for ${Object.keys(out).length} pages. No release deployed.`);
