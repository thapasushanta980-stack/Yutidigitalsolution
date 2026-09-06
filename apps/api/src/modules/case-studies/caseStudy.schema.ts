import { z } from 'zod';

export const createCaseStudySchema = z.object({
  title: z.string().min(2).max(160),
  slug: z.string().optional(),
  client: z.string().max(160).optional().nullable(),
  industry: z.string().max(120).optional().nullable(),
  service: z.string().max(120).optional().nullable(),
  challenge: z.string().min(2),
  strategy: z.string().optional().nullable(),
  implementation: z.string().optional().nullable(),
  results: z.string().optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
  featured: z.boolean().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  publishedAt: z.coerce.date().optional().nullable(),
  seoTitle: z.string().max(160).optional().nullable(),
  seoDescription: z.string().max(320).optional().nullable(),
  // metrics editable from CMS — values never hardcoded server-side
  metrics: z
    .array(z.object({ label: z.string().max(120), value: z.string().max(60), displayOrder: z.number().int().optional() }))
    .max(12)
    .optional(),
});
export const updateCaseStudySchema = createCaseStudySchema.partial();
