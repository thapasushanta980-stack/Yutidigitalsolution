import { Router } from 'express';
import * as controller from './lead.controller.js';
import {
  createLeadSchema,
  createContactSchema,
  updateLeadSchema,
  leadQuerySchema,
} from './lead.schema.js';
import { validate } from '../../middlewares/validate.js';
import { verifyToken, requireRole } from '../../middlewares/auth.js';
import { asyncHandler } from '../../utils/http.js';
import { strictLimiter } from '../../middlewares/rateLimit.js';
import { idParamSchema } from '../services/service.schema.js';

// Public — /api/v1/leads and /api/v1/contact (rate-limited, spam-protected)
export const publicLeadRouter = Router();
publicLeadRouter.post(
  '/leads',
  strictLimiter,
  validate({ body: createLeadSchema }),
  asyncHandler(controller.createLead),
);
publicLeadRouter.post(
  '/contact',
  strictLimiter,
  validate({ body: createContactSchema }),
  asyncHandler(controller.createContact),
);

// Admin — /api/v1/admin/leads (auth + RBAC)
export const adminLeadRouter = Router();
adminLeadRouter.use(verifyToken, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'));
adminLeadRouter.get('/stats', asyncHandler(controller.stats));
adminLeadRouter.get('/', validate({ query: leadQuerySchema }), asyncHandler(controller.listLeads));
adminLeadRouter.get('/:id', validate({ params: idParamSchema }), asyncHandler(controller.getLead));
adminLeadRouter.put(
  '/:id',
  validate({ params: idParamSchema, body: updateLeadSchema }),
  asyncHandler(controller.updateLead),
);
adminLeadRouter.delete(
  '/:id',
  requireRole('SUPER_ADMIN', 'ADMIN'),
  validate({ params: idParamSchema }),
  asyncHandler(controller.deleteLead),
);
