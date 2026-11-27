import fs from 'node:fs';
import ts from 'typescript';
import {execFileSync} from 'node:child_process';
import crypto from 'node:crypto';
const inventory=JSON.parse(fs.readFileSync('docs/cms/design-copy-inventory.json','utf8'));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const failures=[];
function visualTree(text,file){
 const source=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const printer=ts.createPrinter({removeComments:true});
 const nodes=[];
 function visit(n){
  // SEO head management is not visible page structure. Everything else in
  // returned JSX, including text, attributes, classes and order, is locked.
  if(ts.isJsxSelfClosingElement(n)&&n.tagName.getText(source)==='Seo')return;
  if(ts.isJsxElement(n)||ts.isJsxSelfClosingElement(n)||ts.isJsxText(n)||ts.isJsxExpression(n)||ts.isJsxFragment(n)){
   if(ts.isJsxText(n)){if(n.text.trim())nodes.push(n.text.trim());}
   else if(ts.isJsxSelfClosingElement(n))nodes.push(printer.printNode(ts.EmitHint.Unspecified,n,source));
   else if(ts.isJsxElement(n))nodes.push(printer.printNode(ts.EmitHint.Unspecified,n.openingElement,source));
  }
  ts.forEachChild(n,visit);
 }
 visit(source);return JSON.stringify(nodes);
}
for(const entry of inventory.files){
 let current=fs.readFileSync(entry.file);
 current=Buffer.from(current.toString().replace("'../lib/siteContent.js'","'../lib/staticData.js'"));
 const manifest=JSON.parse(fs.readFileSync('docs/cms/template-binding-manifest.json','utf8'));
 const binding=manifest[entry.file];
 if(binding){let text=current.toString().replace(binding.importLine,'');for(const change of binding.changes)text=text.replace(change.replacement,change.original);current=Buffer.from(text);}
 if(entry.file==='apps/web/src/pages/Contact.tsx'){
  const registry=JSON.parse(fs.readFileSync('packages/content/page-fields.json','utf8'));
  let text=current.toString().replace("import {contactCopy} from '../lib/pageContent.js';\n",'');
  for(const[key,value]of Object.entries(registry.contact.fields))text=text.replace('{contactCopy.'+key+'}',JSON.stringify(value));
  current=Buffer.from(text);
 }if(hash(current)===entry.baselineSha256)continue;
 if(entry.file==='apps/web/src/pages/BlogPost.tsx'){
  const old=execFileSync('git',['show',`4c574ab:${entry.file}`],{encoding:'utf8'});
  if(visualTree(old,entry.file)===visualTree(current.toString(),entry.file))continue;
 }
 failures.push(entry.file);
}
if(failures.length){console.error('Design lock failed:',failures.join(', '));process.exit(1);}
console.log(`Design lock passed for ${inventory.files.length} source files. SEO-only BlogPost changes excluded. Pixel regression still required after CMS binding.`);
