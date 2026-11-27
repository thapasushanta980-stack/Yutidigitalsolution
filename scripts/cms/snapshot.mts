import fs from 'node:fs';
import * as data from '../../apps/web/src/lib/staticData.js';
import {indexablePaths,prerenderPaths} from '../../apps/web/src/lib/sitePaths.js';
const snapshot={schemaVersion:1,sourceCommit:'4c574ab50adb945864eeae42f46243b80a4182b3',indexablePaths,prerenderPaths,collections:Object.fromEntries(Object.entries(data).filter(([,value])=>typeof value!=='function'))};
fs.writeFileSync('docs/cms/original-content-snapshot.json',JSON.stringify(snapshot,null,2)+'\n');
console.log(JSON.stringify({indexable:indexablePaths.length,prerender:prerenderPaths.length,collections:Object.fromEntries(Object.entries(snapshot.collections).map(([k,v])=>[k,Array.isArray(v)?v.length:typeof v]))}));
