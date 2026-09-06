import { Router } from 'express';
import * as controller from './service.controller.js';
import {
  createServiceSchema,
  updateServiceSchema,
  slugParamSchema,
  idParamSchema,
} from './service.schema.js';
import { validate } from '../../middlewares/validate.js';
import { verifyToken, requireRole } from '../../middlewares/auth.js';
import { asyncHandler } from '../../utils/http.js';

// Public router — mounted at /api/v1/services
export const publicServiceRouter = Router();
publicServiceRouter.get('/', asyncHandler(controller.listPublic));
publicServiceRouter.get(
  '/:slug',
  validate({ params: slugParamSchema }),
  asyncHandler(controller.getPublicBySlug),
);

// Admin router — mounted at /api/v1/admin/services (auth + RBAC applied here)
export const adminServiceRouter = Router();
adminServiceRouter.use(verifyToken, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'));
adminServiceRouter.get('/', asyncHandler(controller.listAll));
adminServiceRouter.get('/:id', validate({ params: idParamSchema }), asyncHandler(controller.getById));
adminServiceRouter.post('/', validate({ body: createServiceSchema }), asyncHandler(controller.create));
adminServiceRouter.put(
  '/:id',
  validate({ params: idParamSchema, body: updateServiceSchema }),
  asyncHandler(controller.update),
);
adminServiceRouter.delete(
  '/:id',
  requireRole('SUPER_ADMIN', 'ADMIN'),
  validate({ params: idParamSchema }),
  asyncHandler(controller.remove),
);
