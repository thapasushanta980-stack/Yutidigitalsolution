import fs from 'node:fs';
const snapshot=JSON.parse(fs.readFileSync('docs/cms/original-content-snapshot.json','utf8'));
const registry=JSON.parse(fs.readFileSync('packages/content/page-fields.json','utf8'));
const map={};
const locked=new Set(['id','slug','href','src','poster','url','logoUrl','photo','coverImage','websiteUrl','linkedin','icon','art','status','publishedAt','updatedAt','canonicalUrl','email','phone','address','google_maps_url']);
for(const[name,data]of Object.entries(snapshot.collections)){
 const fields={},labels={},paths={};let n=0;
 function visit(value,path=[]){
  if(typeof value==='string'){
   const leaf=String(path.at(-1)||'');if(locked.has(leaf)||leaf.startsWith('social_')||value.startsWith('/')||/^https?:|^mailto:/.test(value))return;
   const key=`value${++n}`;fields[key]=value;labels[key]=path.join(' / ');paths[key]=path;return;
  }
  if(Array.isArray(value))value.forEach((v,i)=>visit(v,[...path,i]));
  else if(value&&typeof value==='object')Object.entries(value).forEach(([k,v])=>visit(v,[...path,k]));
 }
 visit(data);if(!n)continue;
 const key='collection-'+name;registry[key]={label:'Content · '+name,fields,labels};map[name]={key,paths};
}
fs.writeFileSync('packages/content/page-fields.json',JSON.stringify(registry,null,2)+'\n');fs.writeFileSync('packages/content/collection-field-paths.json',JSON.stringify(map,null,2)+'\n');
console.log(Object.fromEntries(Object.entries(map).map(([name,v])=>[name,Object.keys(v.paths).length])));
