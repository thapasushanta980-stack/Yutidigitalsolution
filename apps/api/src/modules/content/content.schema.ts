import {collectionName,parseCollection} from '../../../../../packages/content/collections.mjs';
import {z} from 'zod';
import registry from '../../../../../packages/content/page-fields.json' with {type:'json'};
// Templates, layout, routes and links are code-owned, never arbitrary HTML.
export const pageKeys=['home','about','services','contact','free-growth-audit','work','case-studies','privacy','terms','service-detail','work-detail','case-study-detail','blog','blog-post','legal'] as const;
export const pageParam=z.object({key:z.string().refine(key=>Object.hasOwn(registry,key),'Unknown registered content page')});
export const contentFields=z.record(z.string().regex(/^[a-zA-Z][a-zA-Z0-9_.-]{0,99}$/),z.string().max(20000)).refine(v=>Object.keys(v).length<=200,'Too many fields');
export const saveContent=z.object({expectedVersion:z.number().int().min(0),fields:contentFields}).strict();
export const versionBody=z.object({expectedVersion:z.number().int().min(1)}).strict();
export const restoreBody=versionBody.extend({revision:z.number().int().min(1)}).strict();

export function allowedFields(page:string,fields:Record<string,string>):boolean {
 const entry=(registry as Record<string,{fields:Record<string,string>}>)[page];
 if(!entry || !Object.keys(fields).every(key=>Object.hasOwn(entry.fields,key)))return false;
 const name=collectionName(page);if(name&&fields.items){try{parseCollection(name,fields.items)}catch{return false;}}
 return true;
}
