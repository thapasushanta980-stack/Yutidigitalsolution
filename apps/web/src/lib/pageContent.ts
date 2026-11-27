import registry from '../../../../packages/content/page-fields.json';
import snapshot from '../../../../packages/content/published-pages.json';
// Build-time snapshot only. Never reads drafts or a mutable live CMS endpoint.
const published=snapshot as Record<string,{fields:Record<string,string>}>;
function fields<K extends keyof typeof registry>(key:K):typeof registry[K]['fields'] {
 const defaults=registry[key].fields;const content=published[key]?.fields||{};
 return Object.fromEntries(Object.entries(defaults).map(([name,value])=>[name,content[name]??value])) as typeof defaults;
}
export const pageCopies=Object.fromEntries(Object.keys(registry).map(key=>[key,fields(key as keyof typeof registry)])) as {[K in keyof typeof registry]:typeof registry[K]['fields']};
export const contactCopy=pageCopies.contact;
