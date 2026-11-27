import ts from 'typescript';
import fs from 'node:fs';
const pages={Home:'home',About:'about',Services:'services',ServiceDetail:'service-detail',Work:'work',WorkDetail:'work-detail',CaseStudies:'case-studies',CaseStudyDetail:'case-study-detail',Blog:'blog',BlogPost:'blog-post',Contact:'contact',FreeGrowthAudit:'free-growth-audit',Legal:'legal'};
const registry=JSON.parse(fs.readFileSync('packages/content/page-fields.json','utf8'));
const manifest={};
function cleanJsx(text){const lines=text.split(/\r\n|\n|\r/);let lastNonEmptyLine=0;for(let i=0;i<lines.length;i++)if(/[^ \t]/.test(lines[i]))lastNonEmptyLine=i;let str='';for(let i=0;i<lines.length;i++){let line=lines[i].replace(/\t/g,' ');if(i!==0)line=line.replace(/^ +/,'');if(i!==lines.length-1)line=line.replace(/ +$/,'');if(line){if(i!==lastNonEmptyLine)line+=' ';str+=line;}}return str;}
for(const[component,key]of Object.entries(pages)){
 if(key==='contact')continue;
 const file=`apps/web/src/pages/${component}.tsx`;let source=fs.readFileSync(file,'utf8');
 if(source.includes("from '../lib/pageContent.js'"))continue;
 const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);const changes=[];const fields={};const labels={};let count=0;
 function add(node,value,label,expression=false){if(!value.trim())return;const name=`field${++count}`;fields[name]=value;labels[name]=label;const start=node.getStart(ast),end=node.getEnd();changes.push({start,end,original:source.slice(start,end),replacement:expression?`{pageCopy.${name}}`:`{pageCopy.${name}}`});}
 function visit(n){
  if(ts.isJsxAttribute(n)&&['title','description','eyebrow','intro','emptyMessage','label','placeholder'].includes(n.name.getText(ast))&&n.initializer&&ts.isStringLiteral(n.initializer))add(n.initializer,n.initializer.text,n.name.getText(ast)+' · '+n.initializer.text.slice(0,75));
  if(ts.isJsxText(n)&&n.text.trim()){const value=cleanJsx(n.text);add(n,value,'Text · '+value.slice(0,75),true);}
  ts.forEachChild(n,visit);
 }
 visit(ast);if(!changes.length)continue;
 for(const c of changes.slice().sort((a,b)=>b.start-a.start))source=source.slice(0,c.start)+c.replacement+source.slice(c.end);
 const importLine=`import {pageCopies} from '../lib/pageContent.js';\nconst pageCopy=pageCopies['${key}'];\n`;
 source=importLine+source;fs.writeFileSync(file,source);registry[key]={label:component,fields,labels};manifest[file]={importLine,changes};
}
fs.writeFileSync('packages/content/page-fields.json',JSON.stringify(registry,null,2)+'\n');fs.writeFileSync('docs/cms/template-binding-manifest.json',JSON.stringify(manifest,null,2)+'\n');
console.log(Object.fromEntries(Object.entries(registry).map(([k,v])=>[k,Object.keys(v.fields).length])));
