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
import { sniffImage, cleanAltText, checkImage } from '../../utils/imageSniff.js';
import { z } from 'zod';
import path from 'node:path';
import { assertWithinQuota, quotaBytesFromEnv, withUploadLock } from '../../utils/uploadQuota.js';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

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
    const { buffer, originalname, size } = req.file;
    // Trust the file bytes, not the browser-declared type: reject anything that is not a real JPEG, PNG or WebP.
    const mimetype = sniffImage(buffer);
    if (!mimetype || mimetype !== req.file.mimetype) throw ApiError.badRequest('File is not a valid JPEG, PNG or WebP image');
    try { checkImage(buffer, mimetype); } catch (e) { throw ApiError.badRequest((e as Error).message); }
    let altText: string | null;
    try { altText = cleanAltText(req.body?.altText); } catch (e) { throw ApiError.badRequest((e as Error).message); }
    // One upload at a time passes the quota check and writes its file, so concurrent requests cannot all pass the check against the same free space.
    const stored = await withUploadLock(async () => {
      try { assertWithinQuota(path.resolve(env.UPLOAD_DIR), buffer.length, quotaBytesFromEnv(process.env.CMS_UPLOAD_QUOTA_MB)); } catch (e) { throw new ApiError(413, 'UPLOAD_QUOTA', (e as Error).message); }
      return storage.save(buffer, originalname, mimetype);
    });
    const media = await prisma.media.create({
      data: {
        fileName: stored.fileName,
        originalName: originalname,
        mimeType: mimetype,
        fileSize: size,
        url: stored.url,
        altText,
        uploadedById: req.user?.id,
      },
    });
    await recordAudit({ userId: req.user?.id, action: 'CREATED', entity: 'MEDIA', entityId: media.id });
    return created(res, media);
  }),
);

adminMediaRouter.patch(
  '/:id',
  validate({ params: idParamSchema, body: z.object({ altText: z.string().max(300) }).strict() }),
  asyncHandler(async (req, res) => {
    let altText: string | null;
    try { altText = cleanAltText(req.body.altText); } catch (e) { throw ApiError.badRequest((e as Error).message); }
    const media = await prisma.media.update({ where: { id: req.params.id }, data: { altText } });
    await recordAudit({ userId: req.user?.id, action: 'UPDATED', entity: 'MEDIA', entityId: media.id });
    return ok(res, media);
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
