import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {execFileSync} from 'node:child_process';
import {checkContent,checkStaged,Refusal,FILES} from '../../scripts/cms/publish-guard.mjs';
const bad=(p,q,re)=>assert.throws(()=>checkContent(p,q),e=>e instanceof Refusal&&re.test(e.reason));
const post=o=>({slug:'a',status:'PUBLISHED',title:'t',content:'plain text',...o});
test('accepts plain content',()=>checkContent({contact:{version:1,fields:{copy1:'Hi','l':'https://cal.com/x','m':'mailto:a@b.co'}}},[post({})]));
test('refuses archived or draft posts',()=>{bad({},[post({status:'ARCHIVED'})],/not in published/);bad({},[post({status:'DRAFT'})],/not in published/)});
test('markup in text is inert (rendered as React text), but active schemes in any string are refused',()=>{checkContent({p:{f:'We use <b>bold</b> and a script tag <script> in docs'}},[post({content:'Note: use style = "x"'})]);for(const s of['javascript:alert(1)','data:text/html,x','  JaVaScRiPt:1','file:///etc/passwd','vbscript:x','blob:x'])bad({p:{f:s}},[],/scheme/)});
test('address fields use a strict allowlist',()=>{for(const [k,v] of [['canonicalUrl','http://x.test'],['coverImage','//evil.test/a.png'],['coverImage','https://x.test/a b'],['link','ftp://x']])bad({},[post({[k]:v})],/not allowed|published image/);checkContent({},[post({canonicalUrl:'https://yuktids.com/blog/a',coverImage:'/cms-media/1795532541963-96a3694b43a754fd.png'})])});
test('refuses cover image paths that are not published images',()=>{bad({},[post({coverImage:'/etc/passwd'})],/published image/);bad({},[post({coverImage:'/cms-media/../x.png'})],/not allowed|published image/)});
test('refuses control characters',()=>bad({p:{f:'a\u0000b'}},[],/control/));
test('refuses unpublished /uploads/ references',()=>bad({},[post({coverImage:'/uploads/a.png'})],/uploaded file/));
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
