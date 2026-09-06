import { Router } from 'express';
import { z } from 'zod';
import { prisma, ContentStatus } from '@yukti/database';
import { validate } from '../../middlewares/validate.js';
import { verifyToken, requireRole } from '../../middlewares/auth.js';
import { asyncHandler, ok, created } from '../../utils/http.js';
import { recordAudit } from '../../utils/audit.js';
import { idParamSchema } from '../services/service.schema.js';

const schema = z.object({
  name: z.string().min(1).max(160),
  websiteUrl: z.string().url().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  displayOrder: z.number().int().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

export const publicClientRouter = Router();
publicClientRouter.get(
  '/',
  asyncHandler(async (_req, res) =>
    ok(
      res,
      await prisma.client.findMany({
        where: { status: ContentStatus.PUBLISHED },
        orderBy: { displayOrder: 'asc' },
      }),
    ),
  ),
);

export const adminClientRouter = Router();
adminClientRouter.use(verifyToken, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'));
adminClientRouter.get('/', asyncHandler(async (_req, res) => ok(res, await prisma.client.findMany({ orderBy: { displayOrder: 'asc' } }))));
adminClientRouter.post(
  '/',
  validate({ body: schema }),
  asyncHandler(async (req, res) => {
    const c = await prisma.client.create({ data: req.body });
    await recordAudit({ userId: req.user?.id, action: 'CREATED', entity: 'CLIENT', entityId: c.id });
    return created(res, c);
  }),
);
adminClientRouter.put(
  '/:id',
  validate({ params: idParamSchema, body: schema.partial() }),
  asyncHandler(async (req, res) => {
    const c = await prisma.client.update({ where: { id: req.params.id }, data: req.body });
    await recordAudit({ userId: req.user?.id, action: 'UPDATED', entity: 'CLIENT', entityId: c.id });
    return ok(res, c);
  }),
);
adminClientRouter.delete(
  '/:id',
  requireRole('SUPER_ADMIN', 'ADMIN'),
  validate({ params: idParamSchema }),
  asyncHandler(async (req, res) => {
    await prisma.client.delete({ where: { id: req.params.id } });
    await recordAudit({ userId: req.user?.id, action: 'DELETED', entity: 'CLIENT', entityId: req.params.id });
    return ok(res, { id: req.params.id });
  }),
);
