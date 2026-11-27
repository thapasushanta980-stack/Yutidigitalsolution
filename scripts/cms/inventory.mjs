import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=process.cwd();
const groups=['apps/web/src/pages','apps/web/src/components','apps/web/src/styles','packages/ui/src'];
function walk(dir){if(!fs.existsSync(dir))return [];return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const files=groups.flatMap(walk).filter(p=>/\.(tsx?|css)$/.test(p));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const copy=[];const design=[];
for(const file of files){
 const rel=path.relative(root,file);let baseline;
 try{baseline=execFileSync('git',['show',`4c574ab:${rel}`],{stdio:['ignore','pipe','ignore']});}catch{continue;}
 design.push({file:rel,baselineSha256:hash(baseline),currentSha256:hash(fs.readFileSync(file)),changed:hash(baseline)!==hash(fs.readFileSync(file))});
 if(!/\.tsx$/.test(file))continue;
 const source=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 function visit(n){
  if(ts.isJsxText(n)&&n.text.trim())copy.push({file:rel,line:source.getLineAndCharacterOfPosition(n.getStart()).line+1,kind:'visible JSX text',text:n.text.trim().replace(/\s+/g,' ')});
  if(ts.isJsxAttribute(n)&&['title','description','label','placeholder','alt','aria-label'].includes(n.name.getText(source))&&n.initializer&&ts.isStringLiteral(n.initializer))copy.push({file:rel,line:source.getLineAndCharacterOfPosition(n.getStart()).line+1,kind:n.name.getText(source),text:n.initializer.text});
  ts.forEachChild(n,visit);
 }
 visit(source);
}
const result={baseline:'4c574ab50adb945864eeae42f46243b80a4182b3',scope:'Review-only inventory. Direct JSX copy candidates plus design hashes. Strings stored in arrays/objects and data-driven content require separate mapping; this is not complete automatic extraction.',files:design,candidates:copy};
fs.writeFileSync('docs/cms/design-copy-inventory.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({files:design.length,changed:design.filter(x=>x.changed).map(x=>x.file),copyCandidates:copy.length}));
