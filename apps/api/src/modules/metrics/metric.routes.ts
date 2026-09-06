import { Router } from 'express';
import { z } from 'zod';
import { prisma, ContentStatus } from '@yukti/database';
import { validate } from '../../middlewares/validate.js';
import { verifyToken, requireRole } from '../../middlewares/auth.js';
import { asyncHandler, ok, created } from '../../utils/http.js';
import { recordAudit } from '../../utils/audit.js';
import { idParamSchema } from '../services/service.schema.js';

const schema = z.object({
  code: z.string().min(1).max(20),
  label: z.string().min(1).max(120),
  value: z.string().min(1).max(60), // editable — never hardcoded fake stats
  displayOrder: z.number().int().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

export const publicMetricRouter = Router();
publicMetricRouter.get(
  '/',
  asyncHandler(async (_req, res) =>
    ok(res, await prisma.metric.findMany({ where: { status: ContentStatus.PUBLISHED }, orderBy: { displayOrder: 'asc' } })),
  ),
);

export const adminMetricRouter = Router();
adminMetricRouter.use(verifyToken, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'));
adminMetricRouter.get('/', asyncHandler(async (_req, res) => ok(res, await prisma.metric.findMany({ orderBy: { displayOrder: 'asc' } }))));
adminMetricRouter.post('/', validate({ body: schema }), asyncHandler(async (req, res) => {
  const m = await prisma.metric.create({ data: req.body });
  await recordAudit({ userId: req.user?.id, action: 'CREATED', entity: 'METRIC', entityId: m.id });
  return created(res, m);
}));
adminMetricRouter.put('/:id', validate({ params: idParamSchema, body: schema.partial() }), asyncHandler(async (req, res) => {
  const m = await prisma.metric.update({ where: { id: req.params.id }, data: req.body });
  await recordAudit({ userId: req.user?.id, action: 'UPDATED', entity: 'METRIC', entityId: m.id });
  return ok(res, m);
}));
adminMetricRouter.delete('/:id', requireRole('SUPER_ADMIN', 'ADMIN'), validate({ params: idParamSchema }), asyncHandler(async (req, res) => {
  await prisma.metric.delete({ where: { id: req.params.id } });
  return ok(res, { id: req.params.id });
}));
