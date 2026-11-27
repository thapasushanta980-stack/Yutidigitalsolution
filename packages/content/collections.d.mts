export type CollectionName='clients'|'faqs'|'values'|'team'|'testimonials';
export const collectionColumns:Record<CollectionName,Record<string,string>>;
export function collectionName(key:string):CollectionName|null;
export function collectionDefaults(name:CollectionName,fields?:Record<string,string>):Record<string,unknown>[];
export function parseCollection(name:CollectionName,text:string):Record<string,unknown>[];
