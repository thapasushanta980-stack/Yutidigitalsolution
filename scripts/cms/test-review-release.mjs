import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const out='/tmp/yukti-reviewed-releases';fs.mkdirSync(out,{recursive:true});const original=fs.readFileSync('packages/content/published-pages.json','utf8');
const synthetic={id:'review-only',slug:'cms-build-test-post',title:'Snapshot post fixture',excerpt:'Synthetic test excerpt',content:'Synthetic post body',author:'Test fixture',status:'DRAFT',publishedAt:null,updatedAt:'2026-11-24T00:00:00Z',category:null};
fs.writeFileSync('/tmp/yukti-release-good.json',JSON.stringify({pages:{contact:{version:1,fields:{copy4:'Isolated review release fixture'}}},posts:[synthetic],reviewDraft:true}));
const r=execFileSync(process.execPath,['scripts/cms/build-review-release.mjs','/tmp/yukti-release-good.json',out],{encoding:'utf8'});console.log(r.trim());
if(!fs.readFileSync(out+'/current/blog/cms-build-test-post/index.html','utf8').includes('Snapshot post fixture'))throw Error('Post snapshot missing from rendered template');
const prior=fs.readlinkSync(out+'/current');const html=fs.readFileSync(out+'/current/contact/index.html','utf8');
if(!html.includes('Isolated review release fixture')||!html.includes('noindex, nofollow, noarchive'))throw Error('Review rendering/noindex failed');
fs.writeFileSync('/tmp/yukti-release-bad.json',JSON.stringify({contact:{version:1,fields:{layout:'invalid'}}}));let rejected=false;
try{execFileSync(process.execPath,['scripts/cms/build-review-release.mjs','/tmp/yukti-release-bad.json',out],{stdio:'pipe'})}catch{rejected=true}
if(!rejected||fs.readlinkSync(out+'/current')!==prior)throw Error('Failure did not preserve prior release');
if(fs.readFileSync('packages/content/published-pages.json','utf8')!==original)throw Error('Source snapshot not restored');
console.log('Passed review build/noindex/atomic-release and failed-input preservation checks. No production deployment.');
