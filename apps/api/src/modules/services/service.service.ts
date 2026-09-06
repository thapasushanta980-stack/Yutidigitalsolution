import { prisma, ContentStatus } from '@yukti/database';
import { ApiError } from '../../utils/ApiError.js';
import { uniqueSlug } from '../../utils/slugify.js';
import type { CreateServiceInput, UpdateServiceInput } from './service.schema.js';

// ── Public reads (PUBLISHED only) ──────────────────────────
export function listPublic() {
  return prisma.service.findMany({
    where: { status: ContentStatus.PUBLISHED },
    orderBy: { displayOrder: 'asc' },
  });
}

export async function getPublicBySlug(slug: string) {
  const service = await prisma.service.findFirst({
    where: { slug, status: ContentStatus.PUBLISHED },
  });
  if (!service) throw ApiError.notFound('Service not found');
  return service;
}

// ── Admin reads (all statuses) ─────────────────────────────
export function listAll() {
  return prisma.service.findMany({ orderBy: { displayOrder: 'asc' } });
}

export async function getById(id: string) {
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) throw ApiError.notFound('Service not found');
  return service;
}

// ── Mutations ──────────────────────────────────────────────
export async function create(input: CreateServiceInput) {
  const slug = await uniqueSlug('service', input.slug || input.title);
  return prisma.service.create({ data: { ...input, slug } });
}

export async function update(id: string, input: UpdateServiceInput) {
  await getById(id);
  const data: UpdateServiceInput & { slug?: string } = { ...input };
  if (input.slug || input.title) {
    data.slug = await uniqueSlug('service', input.slug || input.title || '', id);
  }
  return prisma.service.update({ where: { id }, data });
}

export async function remove(id: string) {
  await getById(id);
  await prisma.service.delete({ where: { id } });
}
