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

export async function listPublic({ q, category, skip, take }: ListParams) {
  const where: Prisma.InsightWhereInput = { status: ContentStatus.PUBLISHED };
  if (q) where.OR = [{ title: { contains: q } }, { excerpt: { contains: q } }];
  if (category) where.category = { slug: category };
  const [items, total] = await Promise.all([
    prisma.insight.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip,
      take,
      include: { category: true, tags: { include: { tag: true } } },
    }),
    prisma.insight.count({ where }),
  ]);
  return { items, total };
}

export async function getPublicBySlug(slug: string) {
  const insight = await prisma.insight.findFirst({
    where: { slug, status: ContentStatus.PUBLISHED },
    include: { category: true, tags: { include: { tag: true } } },
  });
  if (!insight) throw ApiError.notFound('Article not found');
  const related = await prisma.insight.findMany({
    where: { status: ContentStatus.PUBLISHED, id: { not: insight.id }, categoryId: insight.categoryId },
    take: 3,
    orderBy: { publishedAt: 'desc' },
  });
  return { ...insight, related };
}

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
  return prisma.insight.create({
    data: {
      ...(rest as Prisma.InsightCreateInput),
      slug,
      readingMinutes: readingMinutes(input.content),
      tags: tags ? { create: await connectTags(tags) } : undefined,
    },
  });
}

export async function update(id: string, input: Record<string, unknown> & { title?: string; content?: string }) {
  await getById(id);
  const { tags, ...rest } = input as { tags?: string[] } & Record<string, unknown>;
  const data: Record<string, unknown> = { ...rest };
  if (input.slug || input.title)
    data.slug = await uniqueSlug('insight', (input.slug as string) || (input.title as string) || '', id);
  if (typeof input.content === 'string') data.readingMinutes = readingMinutes(input.content);
  if (tags) {
    await prisma.insightTag.deleteMany({ where: { insightId: id } });
    data.tags = { create: await connectTags(tags) };
  }
  return prisma.insight.update({ where: { id }, data });
}

export async function remove(id: string) {
  await getById(id);
  await prisma.insight.delete({ where: { id } });
}
