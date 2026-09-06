import { Router } from 'express';
import { z } from 'zod';
import { prisma, ContentStatus } from '@yukti/database';
import { validate } from '../../middlewares/validate.js';
import { verifyToken, requireRole } from '../../middlewares/auth.js';
import { asyncHandler, ok, created } from '../../utils/http.js';
import { recordAudit } from '../../utils/audit.js';
import { idParamSchema } from '../services/service.schema.js';

const memberSchema = z.object({
  name: z.string().min(2).max(120),
  role: z.string().min(1).max(120),
  bio: z.string().max(2000).optional().nullable(),
  photo: z.string().url().optional().nullable(),
  linkedin: z.string().url().optional().nullable(),
  displayOrder: z.number().int().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

const valueSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().min(2).max(1000),
  displayOrder: z.number().int().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

// Public: team members + values (both drive the About page)
export const publicTeamRouter = Router();
publicTeamRouter.get(
  '/',
  asyncHandler(async (_req, res) =>
    ok(res, await prisma.teamMember.findMany({ where: { status: ContentStatus.PUBLISHED }, orderBy: { displayOrder: 'asc' } })),
  ),
);
publicTeamRouter.get(
  '/values',
  asyncHandler(async (_req, res) =>
    ok(res, await prisma.value.findMany({ where: { status: ContentStatus.PUBLISHED }, orderBy: { displayOrder: 'asc' } })),
  ),
);

export const adminTeamRouter = Router();
adminTeamRouter.use(verifyToken, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'));
adminTeamRouter.get('/', asyncHandler(async (_req, res) => ok(res, await prisma.teamMember.findMany({ orderBy: { displayOrder: 'asc' } }))));
adminTeamRouter.post('/', validate({ body: memberSchema }), asyncHandler(async (req, res) => {
  const m = await prisma.teamMember.create({ data: req.body });
  await recordAudit({ userId: req.user?.id, action: 'CREATED', entity: 'TEAM_MEMBER', entityId: m.id });
  return created(res, m);
}));
adminTeamRouter.put('/:id', validate({ params: idParamSchema, body: memberSchema.partial() }), asyncHandler(async (req, res) => {
  const m = await prisma.teamMember.update({ where: { id: req.params.id }, data: req.body });
  await recordAudit({ userId: req.user?.id, action: 'UPDATED', entity: 'TEAM_MEMBER', entityId: m.id });
  return ok(res, m);
}));
adminTeamRouter.delete('/:id', requireRole('SUPER_ADMIN', 'ADMIN'), validate({ params: idParamSchema }), asyncHandler(async (req, res) => {
  await prisma.teamMember.delete({ where: { id: req.params.id } });
  await recordAudit({ userId: req.user?.id, action: 'DELETED', entity: 'TEAM_MEMBER', entityId: req.params.id });
  return ok(res, { id: req.params.id });
}));

// Admin values
adminTeamRouter.get('/values/all', asyncHandler(async (_req, res) => ok(res, await prisma.value.findMany({ orderBy: { displayOrder: 'asc' } }))));
adminTeamRouter.post('/values', validate({ body: valueSchema }), asyncHandler(async (req, res) => {
  const v = await prisma.value.create({ data: req.body });
  await recordAudit({ userId: req.user?.id, action: 'CREATED', entity: 'VALUE', entityId: v.id });
  return created(res, v);
}));
adminTeamRouter.put('/values/:id', validate({ params: idParamSchema, body: valueSchema.partial() }), asyncHandler(async (req, res) => {
  const v = await prisma.value.update({ where: { id: req.params.id }, data: req.body });
  return ok(res, v);
}));
adminTeamRouter.delete('/values/:id', requireRole('SUPER_ADMIN', 'ADMIN'), validate({ params: idParamSchema }), asyncHandler(async (req, res) => {
  await prisma.value.delete({ where: { id: req.params.id } });
  return ok(res, { id: req.params.id });
}));
