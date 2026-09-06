import { Router } from 'express';
import * as controller from './auth.controller.js';
import { loginSchema } from './auth.schema.js';
import { validate } from '../../middlewares/validate.js';
import { verifyToken } from '../../middlewares/auth.js';
import { asyncHandler } from '../../utils/http.js';
import { strictLimiter } from '../../middlewares/rateLimit.js';

const router = Router();

router.post('/login', strictLimiter, validate({ body: loginSchema }), asyncHandler(controller.login));
router.post('/logout', asyncHandler(controller.logout));
router.get('/me', verifyToken, asyncHandler(controller.me));

export default router;
