import { z } from 'zod';

export const createInsightSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().optional(),
  excerpt: z.string().min(2).max(400),
  content: z.string().min(2),
  coverImage: z.string().url().optional().nullable(),
  author: z.string().min(2).max(120),
  categoryId: z.string().optional().nullable(),
  tags: z.array(z.string().max(60)).max(20).optional(),
  seoTitle: z.string().max(160).optional().nullable(),
  seoDescription: z.string().max(320).optional().nullable(),
  canonicalUrl: z.string().url().optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  publishedAt: z.coerce.date().optional().nullable(),
});
export const updateInsightSchema = createInsightSchema.partial();

export const insightQuerySchema = z.object({
  q: z.string().max(120).optional(),
  category: z.string().max(120).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(24).optional(),
});
