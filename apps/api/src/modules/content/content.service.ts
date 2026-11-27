import {allowedFields} from './content.schema.js';
import {prisma} from '@yukti/database';
import {ApiError} from '../../utils/ApiError.js';
type Fields=Record<string,string>;
type Revision={version:number;fields:Fields;action:'SAVE'|'RESTORE'|'PUBLISH';at:string};
type Document={version:number;draft:Fields;published:Fields|null;publishedVersion:number|null;history:Revision[]};
const keyFor=(page:string)=>`cms.page.${page}`;
const empty=():Document=>({version:0,draft:{},published:null,publishedVersion:null,history:[]});
export async function read(page:string):Promise<Document>{const row=await prisma.siteSetting.findUnique({where:{key:keyFor(page)}});return row?JSON.parse(row.value):empty();}
async function mutate(page:string,expectedVersion:number,apply:(doc:Document)=>{fields:Fields;action:Revision['action'];publish?:boolean}){
 return prisma.$transaction(async tx=>{
  const row=await tx.siteSetting.findUnique({where:{key:keyFor(page)}});
  const old:Document=row?JSON.parse(row.value):empty();
  if(old.version!==expectedVersion)throw ApiError.conflict('This page changed. Reload before saving.');
  const change=apply(old);const version=old.version+1;
  // Never silently trim revisions. A bounded document fails safely instead.
  if(old.history.length>=500)throw ApiError.conflict('Revision capacity reached. Export and archive history before continuing.');
  const next:Document={version,draft:change.fields,published:change.publish?change.fields:old.published,publishedVersion:change.publish?version:old.publishedVersion,history:[...old.history,{version,fields:change.fields,action:change.action,at:new Date().toISOString()}]};
  const value=JSON.stringify(next);
  if(Buffer.byteLength(value)>60000)throw ApiError.badRequest('Page history is too large. Nothing was saved.');
  if(row){const r=await tx.siteSetting.updateMany({where:{id:row.id,value:row.value},data:{value}});if(r.count!==1)throw ApiError.conflict('This page changed. Reload before saving.');}
  else {try{await tx.siteSetting.create({data:{key:keyFor(page),value}});}catch(e){if((e as {code?:string}).code==='P2002')throw ApiError.conflict('This page was created in another session. Reload.');throw e;}}
  return next;
 });
}
export const save=(page:string,version:number,fields:Fields)=>{if(!allowedFields(page,fields))throw ApiError.badRequest('Only registered content fields may be edited.');return mutate(page,version,()=>({fields,action:'SAVE'}));};
export const publish=(page:string,version:number)=>mutate(page,version,doc=>({fields:doc.draft,action:'PUBLISH',publish:true}));
export const restore=(page:string,version:number,revision:number)=>mutate(page,version,doc=>{const r=doc.history.find(x=>x.version===revision);if(!r)throw ApiError.notFound('Revision not found');return {fields:r.fields,action:'RESTORE'};});
export async function published(){const rows=await prisma.siteSetting.findMany({where:{key:{startsWith:'cms.page.'}}});return Object.fromEntries(rows.flatMap(row=>{const doc:Document=JSON.parse(row.value);return doc.published?[[row.key.slice(9),{fields:doc.published,version:doc.publishedVersion}]]:[]}));}

export async function draftSnapshot(){const rows=await prisma.siteSetting.findMany({where:{key:{startsWith:'cms.page.'}}});return Object.fromEntries(rows.map(row=>{const doc:Document=JSON.parse(row.value);return [row.key.slice(9),{fields:doc.draft,version:doc.version}]}));}
