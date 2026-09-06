import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(2).max(160),
  slug: z.string().optional(),
  clientId: z.string().optional().nullable(),
  industry: z.string().max(120).optional().nullable(),
  service: z.string().max(120).optional().nullable(),
  description: z.string().min(2),
  challenge: z.string().optional().nullable(),
  solution: z.string().optional().nullable(),
  result: z.string().optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
  featured: z.boolean().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  publishedAt: z.coerce.date().optional().nullable(),
  seoTitle: z.string().max(160).optional().nullable(),
  seoDescription: z.string().max(320).optional().nullable(),
});
export const updateProjectSchema = createProjectSchema.partial();
