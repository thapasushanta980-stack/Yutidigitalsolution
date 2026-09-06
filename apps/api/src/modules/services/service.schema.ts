import { z } from 'zod';

export const createServiceSchema = z.object({
  title: z.string().min(2).max(120),
  slug: z.string().optional(),
  shortDescription: z.string().min(2).max(280),
  description: z.string().min(2),
  icon: z.string().max(60).optional().nullable(),
  featured: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  seoTitle: z.string().max(160).optional().nullable(),
  seoDescription: z.string().max(320).optional().nullable(),
});

export const updateServiceSchema = createServiceSchema.partial();

export const slugParamSchema = z.object({ slug: z.string().min(1) });
export const idParamSchema = z.object({ id: z.string().min(1) });

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
