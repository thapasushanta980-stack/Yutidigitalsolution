import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {execFileSync} from 'node:child_process';
import {checkContent,checkStaged,Refusal,FILES} from '../../scripts/cms/publish-guard.mjs';
const bad=(p,q,re)=>assert.throws(()=>checkContent(p,q),e=>e instanceof Refusal&&re.test(e.reason));
const post=o=>({slug:'a',status:'PUBLISHED',title:'t',content:'plain text',...o});
test('accepts plain content',()=>checkContent({contact:{version:1,fields:{copy1:'Hi','l':'https://cal.com/x','m':'mailto:a@b.co'}}},[post({})]));
test('refuses archived or draft posts',()=>{bad({},[post({status:'ARCHIVED'})],/not in published/);bad({},[post({status:'DRAFT'})],/not in published/)});
test('refuses script/event handler/iframe markup',()=>{for(const s of['<script>x</script>','<img src=x onerror=alert(1)>','<IFRAME src=a>','<a style="x">','<svg onload=1>'])bad({p:{f:s}},[],/active markup/)});
test('refuses unsafe link schemes',()=>{for(const s of['javascript:alert(1)','data:text/html,x','http://x.test','  JaVaScRiPt:1','file:///etc/passwd'])bad({p:{f:s}},[],/scheme/)});
test('refuses uploads references (assets unsupported)',()=>bad({},[post({coverImage:'/uploads/a.png'})],/uploaded file/));
test('refuses oversize, deep, prototype keys',()=>{bad({p:{f:'x'.repeat(20001)}},[],/too long/);let d={};let c=d;for(let i=0;i<12;i++){c.a={};c=c.a}bad(d,[],/too deep/);bad(JSON.parse('{"__proto__":{"a":1}}'),[],/forbidden/)});
test('refuses wrong shapes',()=>{bad([],[],/object/);bad({},{},/list/)});
function repo(){const d=fs.mkdtempSync(path.join(os.tmpdir(),'g-'));const g=(...a)=>execFileSync('git',a,{cwd:d,encoding:'utf8'});g('init','-q');g('config','user.email','a@b');g('config','user.name','t');fs.mkdirSync(path.join(d,'packages/content'),{recursive:true});fs.writeFileSync(path.join(d,FILES[0]),'{}');fs.writeFileSync(path.join(d,FILES[1]),'[]');g('add','.');g('commit','-qm','b');return {d,g}}
test('staged: accepts exactly the two files',()=>{const {d,g}=repo();fs.writeFileSync(path.join(d,FILES[0]),'{"a":{"f":{"x":"ok"}}}');g('add',...FILES);checkStaged(d)});
test('staged: refuses other paths, workflow files, symlinks, deletions, bad JSON',()=>{
 let {d,g}=repo();fs.writeFileSync(path.join(d,FILES[0]),'{"a":1}');fs.mkdirSync(path.join(d,'.github/workflows'),{recursive:true});fs.writeFileSync(path.join(d,'.github/workflows/x.yml'),'x');g('add','.');assert.throws(()=>checkStaged(d),/unexpected path/);
 ({d,g}=repo());fs.rmSync(path.join(d,FILES[0]));fs.symlinkSync('/etc/passwd',path.join(d,FILES[0]));g('add',...FILES);assert.throws(()=>checkStaged(d),/unexpected file type|not a plain/);
 ({d,g}=repo());fs.rmSync(path.join(d,FILES[1]));g('add','-A',...FILES);assert.throws(()=>checkStaged(d),/unexpected file type|not a plain|ENOENT/);
 ({d,g}=repo());fs.writeFileSync(path.join(d,FILES[0]),'{nope');g('add',...FILES);assert.throws(()=>checkStaged(d),/valid JSON/);
 ({d,g}=repo());fs.writeFileSync(path.join(d,FILES[0]),'{"a":1}');g('add',...FILES);fs.writeFileSync(path.join(d,'extra.txt'),'x');assert.throws(()=>checkStaged(d),/other changes/);
});
