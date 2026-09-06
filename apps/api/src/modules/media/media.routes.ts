import { Router } from 'express';
import multer from 'multer';
import { prisma } from '@yukti/database';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import { verifyToken, requireRole } from '../../middlewares/auth.js';
import { asyncHandler, ok, created } from '../../utils/http.js';
import { recordAudit } from '../../utils/audit.js';
import { storage } from './storage.js';
import { idParamSchema } from '../services/service.schema.js';
import { validate } from '../../middlewares/validate.js';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']);

// In-memory storage so we can validate before persisting anywhere.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_FILE_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) return cb(new Error('UNSUPPORTED_TYPE'));
    cb(null, true);
  },
});

export const adminMediaRouter = Router();
adminMediaRouter.use(verifyToken, requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'));

adminMediaRouter.get(
  '/',
  asyncHandler(async (_req, res) => ok(res, await prisma.media.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }))),
);

adminMediaRouter.post(
  '/',
  (req, res, next) =>
    upload.single('file')(req, res, (err: unknown) => {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE')
        return next(ApiError.badRequest('File exceeds maximum allowed size'));
      if (err) return next(ApiError.badRequest('Invalid file upload'));
      next();
    }),
  asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest('No file provided');
    const { buffer, originalname, mimetype, size } = req.file;
    const stored = await storage.save(buffer, originalname, mimetype);
    const media = await prisma.media.create({
      data: {
        fileName: stored.fileName,
        originalName: originalname,
        mimeType: mimetype,
        fileSize: size,
        url: stored.url,
        altText: (req.body?.altText as string) ?? null,
        uploadedById: req.user?.id,
      },
    });
    await recordAudit({ userId: req.user?.id, action: 'CREATED', entity: 'MEDIA', entityId: media.id });
    return created(res, media);
  }),
);

adminMediaRouter.delete(
  '/:id',
  requireRole('SUPER_ADMIN', 'ADMIN'),
  validate({ params: idParamSchema }),
  asyncHandler(async (req, res) => {
    await prisma.media.delete({ where: { id: req.params.id } });
    await recordAudit({ userId: req.user?.id, action: 'DELETED', entity: 'MEDIA', entityId: req.params.id });
    return ok(res, { id: req.params.id });
  }),
);
