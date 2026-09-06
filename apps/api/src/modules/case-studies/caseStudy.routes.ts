import { Router } from 'express';
import * as svc from './caseStudy.service.js';
import { createCaseStudySchema, updateCaseStudySchema } from './caseStudy.schema.js';
import { validate } from '../../middlewares/validate.js';
import { verifyToken, requireRole } from '../../middlewares/auth.js';
import { asyncHandler, ok, created } from '../../utils/http.js';
import { recordAudit } from '../../utils/audit.js';
import { idParamSchema, slugParamSchema } from '../services/service.schema.js';

export const publicCaseStudyRouter = Router();
publicCaseStudyRouter.get(
  '/',
  asyncHandler(async (req, res) => ok(res, await svc.listPublic(req.query.featured === 'true'))),
);
publicCaseStudyRouter.get(
  '/:slug',
  validate({ params: slugParamSchema }),
  asyncHandler(async (req, res) => ok(res, await svc.getPublicBySlug(req.params.slug))),
);

export const adminCaseStudyRouter = Router();
adminCaseStudyRouter.use(verifyToken, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'));
adminCaseStudyRouter.get('/', asyncHandler(async (_req, res) => ok(res, await svc.listAll())));
adminCaseStudyRouter.get(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(async (req, res) => ok(res, await svc.getById(req.params.id))),
);
adminCaseStudyRouter.post(
  '/',
  validate({ body: createCaseStudySchema }),
  asyncHandler(async (req, res) => {
    const cs = await svc.create(req.body);
    await recordAudit({ userId: req.user?.id, action: 'CREATED', entity: 'CASE_STUDY', entityId: cs.id });
    return created(res, cs);
  }),
);
adminCaseStudyRouter.put(
  '/:id',
  validate({ params: idParamSchema, body: updateCaseStudySchema }),
  asyncHandler(async (req, res) => {
    const cs = await svc.update(req.params.id, req.body);
    await recordAudit({ userId: req.user?.id, action: 'UPDATED', entity: 'CASE_STUDY', entityId: cs.id });
    return ok(res, cs);
  }),
);
adminCaseStudyRouter.delete(
  '/:id',
  requireRole('SUPER_ADMIN', 'ADMIN'),
  validate({ params: idParamSchema }),
  asyncHandler(async (req, res) => {
    await svc.remove(req.params.id);
    await recordAudit({ userId: req.user?.id, action: 'DELETED', entity: 'CASE_STUDY', entityId: req.params.id });
    return ok(res, { id: req.params.id });
  }),
);
