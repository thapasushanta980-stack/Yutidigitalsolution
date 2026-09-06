import { prisma, ContentStatus, Prisma } from '@yukti/database';
import { ApiError } from '../../utils/ApiError.js';
import { uniqueSlug } from '../../utils/slugify.js';

export function listPublic(featuredOnly = false) {
  const where: Prisma.ProjectWhereInput = { status: ContentStatus.PUBLISHED };
  if (featuredOnly) where.featured = true;
  return prisma.project.findMany({
    where,
    orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
    include: { client: { select: { name: true } } },
  });
}

export async function getPublicBySlug(slug: string) {
  const project = await prisma.project.findFirst({
    where: { slug, status: ContentStatus.PUBLISHED },
    include: { images: { orderBy: { displayOrder: 'asc' } }, client: true },
  });
  if (!project) throw ApiError.notFound('Project not found');
  const related = await prisma.project.findMany({
    where: { status: ContentStatus.PUBLISHED, id: { not: project.id } },
    take: 3,
    orderBy: { publishedAt: 'desc' },
  });
  return { ...project, related };
}

export function listAll() {
  return prisma.project.findMany({ orderBy: { updatedAt: 'desc' } });
}
export async function getById(id: string) {
  const p = await prisma.project.findUnique({ where: { id }, include: { images: true } });
  if (!p) throw ApiError.notFound('Project not found');
  return p;
}
export async function create(input: Prisma.ProjectCreateInput & { slug?: string; title: string }) {
  const slug = await uniqueSlug('project', input.slug || input.title);
  return prisma.project.create({ data: { ...input, slug } });
}
export async function update(id: string, input: Record<string, unknown> & { title?: string; slug?: string }) {
  await getById(id);
  const data = { ...input };
  if (input.slug || input.title) data.slug = await uniqueSlug('project', input.slug || input.title || '', id);
  return prisma.project.update({ where: { id }, data });
}
export async function remove(id: string) {
  await getById(id);
  await prisma.project.delete({ where: { id } });
}
