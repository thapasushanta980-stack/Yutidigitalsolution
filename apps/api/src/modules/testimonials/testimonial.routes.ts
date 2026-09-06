import { Router } from 'express';
import { z } from 'zod';
import { prisma, ContentStatus } from '@yukti/database';
import { validate } from '../../middlewares/validate.js';
import { verifyToken, requireRole } from '../../middlewares/auth.js';
import { asyncHandler, ok, created } from '../../utils/http.js';
import { recordAudit } from '../../utils/audit.js';
import { idParamSchema } from '../services/service.schema.js';

const schema = z.object({
  clientName: z.string().min(2).max(120),
  clientRole: z.string().max(120).optional().nullable(),
  company: z.string().max(160).optional().nullable(),
  quote: z.string().min(2).max(2000),
  avatar: z.string().url().optional().nullable(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  featured: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  caseStudyId: z.string().optional().nullable(),
});

export const publicTestimonialRouter = Router();
publicTestimonialRouter.get(
  '/',
  asyncHandler(async (_req, res) =>
    ok(
      res,
      await prisma.testimonial.findMany({
        where: { status: ContentStatus.PUBLISHED },
        orderBy: [{ featured: 'desc' }, { displayOrder: 'asc' }],
      }),
    ),
  ),
);

export const adminTestimonialRouter = Router();
adminTestimonialRouter.use(verifyToken, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'));
adminTestimonialRouter.get('/', asyncHandler(async (_req, res) => ok(res, await prisma.testimonial.findMany({ orderBy: { displayOrder: 'asc' } }))));
adminTestimonialRouter.post(
  '/',
  validate({ body: schema }),
  asyncHandler(async (req, res) => {
    const t = await prisma.testimonial.create({ data: req.body });
    await recordAudit({ userId: req.user?.id, action: 'CREATED', entity: 'TESTIMONIAL', entityId: t.id });
    return created(res, t);
  }),
);
adminTestimonialRouter.put(
  '/:id',
  validate({ params: idParamSchema, body: schema.partial() }),
  asyncHandler(async (req, res) => {
    const t = await prisma.testimonial.update({ where: { id: req.params.id }, data: req.body });
    await recordAudit({ userId: req.user?.id, action: 'UPDATED', entity: 'TESTIMONIAL', entityId: t.id });
    return ok(res, t);
  }),
);
adminTestimonialRouter.delete(
  '/:id',
  requireRole('SUPER_ADMIN', 'ADMIN'),
  validate({ params: idParamSchema }),
  asyncHandler(async (req, res) => {
    await prisma.testimonial.delete({ where: { id: req.params.id } });
    await recordAudit({ userId: req.user?.id, action: 'DELETED', entity: 'TESTIMONIAL', entityId: req.params.id });
    return ok(res, { id: req.params.id });
  }),
);
