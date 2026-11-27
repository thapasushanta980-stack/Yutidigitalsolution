import {collectionName,parseCollection} from '../../../../packages/content/collections.mjs';
import * as original from './staticData.js';
import snapshot from '../../../../packages/content/published-pages.json';
import postSnapshot from '../../../../packages/content/published-posts.json';
import mappings from '../../../../packages/content/collection-field-paths.json';
import type {SearchResults} from '@yukti/types';
const published=snapshot as Record<string,{fields:Record<string,string>}>;
function collection<K extends keyof typeof mappings>(key:K):typeof original[K]{
 const copy=JSON.parse(JSON.stringify(original[key]));
 const mapping=mappings[key];const fields=published[mapping.key]?.fields;
 const name=collectionName(mapping.key);if(name&&fields?.items)return parseCollection(name,fields.items) as typeof original[K];
 if(fields)for(const[field,path]of Object.entries(mapping.paths)){
  if(typeof fields[field]!=='string')continue;
  let target=copy;const parts=path as (string|number)[];
  for(const part of parts.slice(0,-1))target=target[part];
  target[parts[parts.length-1]]=fields[field];
 }
 return copy;
}
export const siteSettings=collection('siteSettings');
export const services=collection('services');
export const serviceHeadings=collection('serviceHeadings');
export const metrics=collection('metrics');
export const clients=collection('clients');
export const testimonials=collection('testimonials');
export const team=collection('team');
export const values=collection('values');
export const faqs=collection('faqs');
export const insightCategories=collection('insightCategories');
type ContentPost={id:string;slug:string;title:string;excerpt:string;content:string;author:string;coverImage:string|null;art?:'social'|'video'|'ads'|'seo';readingMinutes:number;publishedAt:string|null;updatedAt:string;category?:{name:string;slug:string}|null;canonicalUrl:string|null;seoTitle:string|null;seoDescription:string|null};
const postOverrides=postSnapshot as unknown as (ContentPost&{status:'DRAFT'|'PUBLISHED'|'ARCHIVED'})[];
const overridden=new Set(postOverrides.map(p=>p.slug));
export const insights:ContentPost[]=[...collection('insights').filter(p=>!overridden.has(p.slug)),...postOverrides.filter(p=>p.status!=='ARCHIVED').map(p=>({...p,coverImage:p.coverImage??null,readingMinutes:p.readingMinutes??Math.max(1,Math.round(p.content.split(/\s+/).length/200)),canonicalUrl:p.canonicalUrl??null,seoTitle:p.seoTitle??null,seoDescription:p.seoDescription??null,category:p.category??undefined}))];
export const heroVideos=original.heroVideos;
export const projects=original.projects;
export const caseStudies=original.caseStudies;
export function search(q:string):SearchResults{
 const needle=q.toLowerCase();return {services:services.filter(s=>`${s.title} ${s.shortDescription}`.toLowerCase().includes(needle)),work:[],caseStudies:[],insights:insights.filter(p=>`${p.title} ${p.excerpt}`.toLowerCase().includes(needle))};
}
