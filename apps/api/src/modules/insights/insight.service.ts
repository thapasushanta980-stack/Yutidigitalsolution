import { prisma, ContentStatus, Prisma } from '@yukti/database';
import { ApiError } from '../../utils/ApiError.js';
import { uniqueSlug, slugify } from '../../utils/slugify.js';

function readingMinutes(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

interface ListParams {
  q?: string;
  category?: string;
  skip: number;
  take: number;
}

type PublicPost=Awaited<ReturnType<typeof prisma.insight.findMany>>[number]&{category?:{name:string;slug:string}|null};
const publishedKey=(id:string)=>`cms.post.published.${id}`;
async function publicCopies(includeArchived=false):Promise<PublicPost[]>{
 const [legacy,records]=await Promise.all([prisma.insight.findMany({where:{status:ContentStatus.PUBLISHED},include:{category:true,tags:{include:{tag:true}}}}),prisma.siteSetting.findMany({where:{key:{startsWith:'cms.post.published.'}}})]);
 const ids=new Set(records.map(r=>r.key.slice('cms.post.published.'.length)));
 return [...legacy.filter(p=>!ids.has(p.id)),...records.flatMap(r=>{const p=JSON.parse(r.value) as PublicPost;return p.status==='PUBLISHED'||includeArchived&&p.status==='ARCHIVED'?[p]:[]})];
}
export async function publishedSnapshot(){return publicCopies(true);}
export async function listPublic({q,category,skip,take}:ListParams){
 const needle=q?.toLowerCase();const all=(await publicCopies()).filter(p=>(!needle||`${p.title} ${p.excerpt}`.toLowerCase().includes(needle))&&(!category||p.category?.slug===category)).sort((a,b)=>new Date(b.publishedAt??0).getTime()-new Date(a.publishedAt??0).getTime());return {items:all.slice(skip,skip+take),total:all.length};
}
export async function getPublicBySlug(slug:string){const posts=await publicCopies();const post=posts.find(p=>p.slug===slug);if(!post)throw ApiError.notFound('Article not found');return {...post,related:posts.filter(p=>p.id!==post.id&&p.categoryId===post.categoryId).slice(0,3)};}
async function storePublished(tx:Prisma.TransactionClient,id:string,post:unknown){const key=publishedKey(id),value=JSON.stringify(post);if(Buffer.byteLength(value)>60000)throw ApiError.conflict('Published post exceeds current snapshot capacity. Nothing changed.');await tx.siteSetting.upsert({where:{key},create:{key,value},update:{value}});}

export function listCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}

export function listAll() {
  return prisma.insight.findMany({ orderBy: { updatedAt: 'desc' }, include: { category: true } });
}
export async function getById(id: string) {
  const i = await prisma.insight.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } } },
  });
  if (!i) throw ApiError.notFound('Article not found');
  return i;
}

async function connectTags(names: string[]) {
  const tags = await Promise.all(
    names.map((name) =>
      prisma.tag.upsert({
        where: { slug: slugify(name) },
        update: {},
        create: { name, slug: slugify(name) },
      }),
    ),
  );
  return tags.map((t) => ({ tag: { connect: { id: t.id } } }));
}

export async function create(input: Record<string, unknown> & { title: string; content: string }) {
  const { tags, ...rest } = input as { tags?: string[] } & Record<string, unknown>;
  const slug = await uniqueSlug('insight', (input.slug as string) || input.title);
  const tagConnections=tags?await connectTags(tags):undefined;
  return prisma.$transaction(async tx=>{
  const result=await tx.insight.create({
    data: {
      ...(rest as Prisma.InsightCreateInput),
      slug,
      publishedAt: input.status === 'PUBLISHED' ? (input.publishedAt as Date | undefined) || new Date() : input.publishedAt as Date | undefined,
      readingMinutes: readingMinutes(input.content),
      tags: tags ? { create: tagConnections } : undefined,
    },
  });
  if(result.status===ContentStatus.PUBLISHED){const post=await tx.insight.findUnique({where:{id:result.id},include:{category:true,tags:{include:{tag:true}}}});await storePublished(tx,result.id,post);}
  return result;
  });
}

export async function update(id: string, input: Record<string, unknown> & { title?: string; content?: string }) {
  const existing = await getById(id);
  const { tags, expectedUpdatedAt, ...rest } = input as { tags?: string[]; expectedUpdatedAt?: string } & Record<string, unknown>;
  if (expectedUpdatedAt && new Date(expectedUpdatedAt).getTime() !== existing.updatedAt.getTime()) throw ApiError.conflict('This post changed. Reload before saving.');
  const data: Record<string, unknown> = { ...rest };
  // Title edits never change established URLs. Published URLs remain locked
  // until a durable redirect mechanism is available.
  if (typeof input.slug === 'string' && input.slug.trim()) {
    const requestedSlug = slugify(input.slug);
    if ((existing.publishedAt || existing.status === ContentStatus.PUBLISHED) && requestedSlug !== existing.slug)
      throw ApiError.conflict('Published article URL is locked. A redirect plan is required before changing it.');
    data.slug = await uniqueSlug('insight', requestedSlug, id);
  } else {
    data.slug = existing.slug;
  }
  if (input.status === 'PUBLISHED' && !existing.publishedAt && !input.publishedAt) data.publishedAt = new Date();
  // Keep first-publication history even if an article is later archived/drafted.
  if (existing.publishedAt && input.publishedAt === null) data.publishedAt = existing.publishedAt;
  if (typeof input.content === 'string') data.readingMinutes = readingMinutes(input.content);
  const tagConnections = tags ? await connectTags(tags) : undefined;
  return prisma.$transaction(async tx => {
    const frozen=await tx.siteSetting.findUnique({where:{key:publishedKey(id)}});
    if(!frozen&&existing.status===ContentStatus.PUBLISHED){const legacy=await tx.insight.findUnique({where:{id},include:{category:true,tags:{include:{tag:true}}}});await storePublished(tx,id,legacy);}
    const lock = await tx.insight.updateMany({where:{id,updatedAt:existing.updatedAt},data:{updatedAt:new Date()}});
    if(lock.count!==1)throw ApiError.conflict('This post changed. Reload before saving.');
    if (tags) {await tx.insightTag.deleteMany({where:{insightId:id}});data.tags={create:tagConnections};}
    const updated=await tx.insight.update({where:{id},data});
    if(input.status==='PUBLISHED'||input.status==='ARCHIVED'){const copy=await tx.insight.findUnique({where:{id},include:{category:true,tags:{include:{tag:true}}}});await storePublished(tx,id,copy);}
    const key=`cms.post.history.${id}`;
    const record=await tx.siteSetting.findUnique({where:{key}});
    const history:PostRevision[]=record?JSON.parse(record.value):[{version:1,at:existing.updatedAt.toISOString(),fields:revisionFields(existing)}];
    history.push({version:history.length+1,at:updated.updatedAt.toISOString(),fields:revisionFields(updated)});
    const value=JSON.stringify(history);
    if(Buffer.byteLength(value)>60000)throw ApiError.conflict('Post revision capacity reached. Export history before saving. Nothing changed.');
    await tx.siteSetting.upsert({where:{key},create:{key,value},update:{value}});
    return updated;
  });
}

export async function remove(id: string) {
  const item=await getById(id);
  if(item.publishedAt||item.status===ContentStatus.PUBLISHED||await prisma.siteSetting.findUnique({where:{key:publishedKey(id)}}))throw ApiError.conflict('Published article history must be retained. Archive instead of deleting.');
  await prisma.insight.delete({ where: { id } });
}

const revisionKeys=['title','slug','excerpt','content','coverImage','author','seoTitle','seoDescription','canonicalUrl'] as const;
type PostRevision={version:number;at:string;fields:Record<string,unknown>};
function revisionFields(post:Record<string,unknown>){return Object.fromEntries(revisionKeys.map(key=>[key,post[key]]));}
export async function revisions(id:string){await getById(id);const row=await prisma.siteSetting.findUnique({where:{key:`cms.post.history.${id}`}});return row?JSON.parse(row.value) as PostRevision[]:[];}
export async function restoreRevision(id:string,version:number,expectedUpdatedAt:string){
 const current=await getById(id);
 // Restoring changes only the draft row; its immutable published copy stays unchanged.

 const history=await revisions(id);const revision=history.find(r=>r.version===version);if(!revision)throw ApiError.notFound('Post revision not found');
 return update(id,{...revision.fields,slug:current.slug,status:'DRAFT',expectedUpdatedAt});
}
