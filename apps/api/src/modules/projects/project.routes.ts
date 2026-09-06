import { Router } from 'express';
import type { Request, Response } from 'express';
import * as svc from './project.service.js';
import { createProjectSchema, updateProjectSchema } from './project.schema.js';
import { validate } from '../../middlewares/validate.js';
import { verifyToken, requireRole } from '../../middlewares/auth.js';
import { asyncHandler, ok, created } from '../../utils/http.js';
import { recordAudit } from '../../utils/audit.js';
import { idParamSchema, slugParamSchema } from '../services/service.schema.js';

export const publicProjectRouter = Router();
publicProjectRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) =>
    ok(res, await svc.listPublic(req.query.featured === 'true')),
  ),
);
publicProjectRouter.get(
  '/:slug',
  validate({ params: slugParamSchema }),
  asyncHandler(async (req: Request, res: Response) => ok(res, await svc.getPublicBySlug(req.params.slug))),
);

export const adminProjectRouter = Router();
adminProjectRouter.use(verifyToken, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'));
adminProjectRouter.get('/', asyncHandler(async (_req, res) => ok(res, await svc.listAll())));
adminProjectRouter.get(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(async (req, res) => ok(res, await svc.getById(req.params.id))),
);
adminProjectRouter.post(
  '/',
  validate({ body: createProjectSchema }),
  asyncHandler(async (req, res) => {
    const p = await svc.create(req.body);
    await recordAudit({ userId: req.user?.id, action: 'CREATED', entity: 'PROJECT', entityId: p.id });
    return created(res, p);
  }),
);
adminProjectRouter.put(
  '/:id',
  validate({ params: idParamSchema, body: updateProjectSchema }),
  asyncHandler(async (req, res) => {
    const p = await svc.update(req.params.id, req.body);
    await recordAudit({ userId: req.user?.id, action: 'UPDATED', entity: 'PROJECT', entityId: p.id });
    return ok(res, p);
  }),
);
adminProjectRouter.delete(
  '/:id',
  requireRole('SUPER_ADMIN', 'ADMIN'),
  validate({ params: idParamSchema }),
  asyncHandler(async (req, res) => {
    await svc.remove(req.params.id);
    await recordAudit({ userId: req.user?.id, action: 'DELETED', entity: 'PROJECT', entityId: req.params.id });
    return ok(res, { id: req.params.id });
  }),
);
