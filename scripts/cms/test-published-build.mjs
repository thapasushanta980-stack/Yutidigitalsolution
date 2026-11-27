import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const path='packages/content/published-pages.json';const prior=fs.readFileSync(path,'utf8');
try{
 fs.writeFileSync('/tmp/yukti-published-test.json',JSON.stringify({contact:{version:2,fields:{copy4:'Published contact build fixture'}},'collection-services':{version:3,fields:{value1:'Published service fixture'}}}));
 execFileSync('node',['scripts/cms/export-pages.mjs','/tmp/yukti-published-test.json']);
 execFileSync('npm',['run','build:web'],{stdio:'pipe'});
 const contact=fs.readFileSync('apps/web/dist/contact/index.html','utf8');const services=fs.readFileSync('apps/web/dist/services/index.html','utf8');
 if(!contact.includes('Published contact build fixture'))throw Error('Published page snapshot not rendered');
 if(!services.includes('Published service fixture'))throw Error('Published collection snapshot not rendered');
 const priorOutput=fs.readFileSync(path,'utf8');
 fs.writeFileSync('/tmp/yukti-invalid-snapshot.json',JSON.stringify({contact:{version:3,fields:{layout:'break'}}}));
 let rejected=false;try{execFileSync('node',['scripts/cms/export-pages.mjs','/tmp/yukti-invalid-snapshot.json'],{stdio:'pipe'});}catch{rejected=true;}
 if(!rejected||fs.readFileSync(path,'utf8')!==priorOutput)throw Error('Invalid export changed prior snapshot');
 console.log('Published page+collection build tested, unknown layout field rejected without replacing prior snapshot.');
}finally{fs.writeFileSync(path,prior);execFileSync('npm',['run','build:web'],{stdio:'pipe'});}
