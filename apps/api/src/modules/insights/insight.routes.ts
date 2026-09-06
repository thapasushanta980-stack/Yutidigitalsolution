import { Router } from 'express';
import * as svc from './insight.service.js';
import { createInsightSchema, updateInsightSchema, insightQuerySchema } from './insight.schema.js';
import { validate } from '../../middlewares/validate.js';
import { verifyToken, requireRole } from '../../middlewares/auth.js';
import { asyncHandler, ok, created, parsePagination, paginationMeta } from '../../utils/http.js';
import { recordAudit } from '../../utils/audit.js';
import { idParamSchema, slugParamSchema } from '../services/service.schema.js';

export const publicInsightRouter = Router();
publicInsightRouter.get(
  '/',
  validate({ query: insightQuerySchema }),
  asyncHandler(async (req, res) => {
    const { page, pageSize, skip, take } = parsePagination(req, 9, 24);
    const { items, total } = await svc.listPublic({
      q: req.query.q as string | undefined,
      category: req.query.category as string | undefined,
      skip,
      take,
    });
    return ok(res, items, paginationMeta(page, pageSize, total));
  }),
);
publicInsightRouter.get('/categories', asyncHandler(async (_req, res) => ok(res, await svc.listCategories())));
publicInsightRouter.get(
  '/:slug',
  validate({ params: slugParamSchema }),
  asyncHandler(async (req, res) => ok(res, await svc.getPublicBySlug(req.params.slug))),
);

export const adminInsightRouter = Router();
adminInsightRouter.use(verifyToken, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'));
adminInsightRouter.get('/', asyncHandler(async (_req, res) => ok(res, await svc.listAll())));
adminInsightRouter.get(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(async (req, res) => ok(res, await svc.getById(req.params.id))),
);
adminInsightRouter.post(
  '/',
  validate({ body: createInsightSchema }),
  asyncHandler(async (req, res) => {
    const i = await svc.create(req.body);
    await recordAudit({ userId: req.user?.id, action: 'CREATED', entity: 'INSIGHT', entityId: i.id });
    return created(res, i);
  }),
);
adminInsightRouter.put(
  '/:id',
  validate({ params: idParamSchema, body: updateInsightSchema }),
  asyncHandler(async (req, res) => {
    const i = await svc.update(req.params.id, req.body);
    await recordAudit({ userId: req.user?.id, action: 'UPDATED', entity: 'INSIGHT', entityId: i.id });
    return ok(res, i);
  }),
);
adminInsightRouter.delete(
  '/:id',
  requireRole('SUPER_ADMIN', 'ADMIN'),
  validate({ params: idParamSchema }),
  asyncHandler(async (req, res) => {
    await svc.remove(req.params.id);
    await recordAudit({ userId: req.user?.id, action: 'DELETED', entity: 'INSIGHT', entityId: req.params.id });
    return ok(res, { id: req.params.id });
  }),
);
