import { prisma, ContentStatus, Prisma } from '@yukti/database';
import { ApiError } from '../../utils/ApiError.js';
import { uniqueSlug } from '../../utils/slugify.js';

type MetricInput = { label: string; value: string; displayOrder?: number };

export function listPublic(featuredOnly = false) {
  const where: Prisma.CaseStudyWhereInput = { status: ContentStatus.PUBLISHED };
  if (featuredOnly) where.featured = true;
  return prisma.caseStudy.findMany({
    where,
    orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
    include: { metrics: { orderBy: { displayOrder: 'asc' } } },
  });
}

export async function getPublicBySlug(slug: string) {
  const cs = await prisma.caseStudy.findFirst({
    where: { slug, status: ContentStatus.PUBLISHED },
    include: {
      metrics: { orderBy: { displayOrder: 'asc' } },
      images: { orderBy: { displayOrder: 'asc' } },
      testimonials: { where: { status: ContentStatus.PUBLISHED } },
    },
  });
  if (!cs) throw ApiError.notFound('Case study not found');
  return cs;
}

export function listAll() {
  return prisma.caseStudy.findMany({ orderBy: { updatedAt: 'desc' }, include: { metrics: true } });
}
export async function getById(id: string) {
  const cs = await prisma.caseStudy.findUnique({ where: { id }, include: { metrics: true } });
  if (!cs) throw ApiError.notFound('Case study not found');
  return cs;
}

export async function create(input: Record<string, unknown> & { title: string; slug?: string; challenge: string }) {
  const { metrics, ...rest } = input as { metrics?: MetricInput[] } & Record<string, unknown>;
  const slug = await uniqueSlug('caseStudy', (input.slug as string) || input.title);
  return prisma.caseStudy.create({
    data: {
      ...(rest as Prisma.CaseStudyCreateInput),
      slug,
      metrics: metrics ? { create: metrics } : undefined,
    },
    include: { metrics: true },
  });
}

export async function update(id: string, input: Record<string, unknown> & { title?: string; slug?: string }) {
  await getById(id);
  const { metrics, ...rest } = input as { metrics?: MetricInput[] } & Record<string, unknown>;
  const data: Record<string, unknown> = { ...rest };
  if (input.slug || input.title)
    data.slug = await uniqueSlug('caseStudy', (input.slug as string) || (input.title as string) || '', id);
  // Replace metrics wholesale when provided.
  if (metrics) {
    await prisma.caseStudyMetric.deleteMany({ where: { caseStudyId: id } });
    data.metrics = { create: metrics };
  }
  return prisma.caseStudy.update({ where: { id }, data, include: { metrics: true } });
}

export async function remove(id: string) {
  await getById(id);
  await prisma.caseStudy.delete({ where: { id } });
}
