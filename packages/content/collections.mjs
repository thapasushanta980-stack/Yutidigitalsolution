import mappings from './collection-field-paths.json' with {type:'json'};
import original from './collection-defaults.json' with { type: 'json' };
export const collectionColumns = {
    clients: { name: 'Client name', logoUrl: 'Logo path', websiteUrl: 'Website URL' },
    faqs: { q: 'Question', a: 'Answer' },
    values: { title: 'Title', description: 'Description' },
    team: { name: 'Name', role: 'Role', bio: 'Biography', photo: 'Photo path', linkedin: 'LinkedIn URL' },
    testimonials: { clientName: 'Client name', quote: 'Quote', clientRole: 'Role', company: 'Company', photo: 'Photo path' },
};
export function collectionName(key) { const name = key.replace(/^collection-/, ''); return Object.hasOwn(collectionColumns, name) ? name : null; }
export function collectionDefaults(name, fields = {}) { const rows=JSON.parse(JSON.stringify(original[name])); for(const [key,path] of Object.entries(mappings[name].paths)){if(typeof fields[key]!=='string')continue;let target=rows;for(const part of path.slice(0,-1))target=target[part];target[path.at(-1)]=fields[key];}return rows; }
const urlFields = new Set(['websiteUrl', 'linkedin']);
const imageFields = new Set(['logoUrl', 'photo']);
export function parseCollection(name, text) {
    if (text.length > 20000)
        throw Error('Collection is too large');
    const rows = JSON.parse(text);
    if (!Array.isArray(rows) || rows.length > 50)
        throw Error('Use at most 50 items');
    const allowed = new Set(['id', ...Object.keys(collectionColumns[name]), ...(name === 'testimonials' ? ['rating', 'approved'] : [])]);
    const ids = new Set();
    for (const row of rows) {
        if (!row || typeof row !== 'object' || Array.isArray(row) || Object.keys(row).some(k => !allowed.has(k)))
            throw Error('Unregistered collection field');
        if (name !== 'faqs') {
            if (typeof row.id !== 'string' || !/^[-a-zA-Z0-9_]{1,80}$/.test(row.id) || ids.has(row.id))
                throw Error('Invalid or duplicate item ID');
            ids.add(row.id);
        }
        for (const key of Object.keys(collectionColumns[name])) {
            const value = row[key];
            if (value !== null && value !== undefined && (typeof value !== 'string' || value.length > 5000))
                throw Error('Invalid collection text');
            if (typeof value === 'string' && value) {
                if (urlFields.has(key)) {
                    let u;
                    try {
                        u = new URL(value);
                    }
                    catch {
                        throw Error('Use a complete HTTPS URL');
                    }
                    if (u.protocol !== 'https:')
                        throw Error('Use HTTPS URLs only');
                }
                if (imageFields.has(key) && (!value.startsWith('/') || value.startsWith('//') || value.includes('..') || !/^\/[a-zA-Z0-9_./-]+\.(png|jpe?g|webp|avif)$/i.test(value)))
                    throw Error('Use an existing local image path');
            }
        }
        if (name === 'testimonials') {
            if (row.approved !== undefined && typeof row.approved !== 'boolean')
                throw Error('Invalid approval');
            if (row.rating !== null && row.rating !== undefined && (!Number.isInteger(row.rating) || Number(row.rating) < 1 || Number(row.rating) > 5))
                throw Error('Invalid rating');
        }
    }
    return rows;
}
