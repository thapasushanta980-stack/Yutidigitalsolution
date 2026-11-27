import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const manifest=JSON.parse(fs.readFileSync('docs/cms/template-binding-manifest.json','utf8'));
const files=Object.keys(manifest).concat('apps/web/src/pages/Contact.tsx');
const originals=Object.fromEntries(files.map(f=>[f,fs.readFileSync(f,'utf8')]));
function htmls(){const out={};function walk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,ent.name);if(ent.isDirectory())walk(p);else if(ent.name.endsWith('.html'))out[p.replace('apps/web/dist/','')]=fs.readFileSync(p,'utf8');}}walk('apps/web/dist');return out;}
function visible(html){return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/<head\b[^>]*>[\s\S]*?<\/head>/g,'').replace(/<link\b[^>]*>/g,'').replace(/<!--[\s\S]*?-->/g,'').replace(/\s+/g,' ');}
try{
 for(const file of files){if(file.endsWith('Contact.tsx')){fs.writeFileSync(file,execFileSync('git',['show',`4c574ab:${file}`]));continue;}let text=originals[file].replace(manifest[file].importLine,'');for(const c of manifest[file].changes)text=text.replace(c.replacement,c.original);fs.writeFileSync(file,text);}
 execFileSync('npm',['run','build:web'],{stdio:'pipe'});const baseline=htmls();
 for(const[file,text]of Object.entries(originals))fs.writeFileSync(file,text);
 execFileSync('npm',['run','build:web'],{stdio:'pipe'});const bound=htmls();
 fs.writeFileSync('/tmp/yukti-baseline-html.json',JSON.stringify(baseline));fs.writeFileSync('/tmp/yukti-bound-html.json',JSON.stringify(bound));
 const failures=Object.keys(baseline).filter(key=>visible(baseline[key])!==visible(bound[key]));
 fs.writeFileSync('docs/cms/template-render-verification.json',JSON.stringify({pages:Object.keys(baseline).length,failures,method:'Prerender baseline versus field-bound templates, empty published snapshot, HTML head/scripts removed. Pixel checks remain separate.'},null,2)+'\n');
 console.log({pages:Object.keys(baseline).length,failures});if(failures.length)process.exitCode=1;
}finally{for(const[file,text]of Object.entries(originals))fs.writeFileSync(file,text);}
