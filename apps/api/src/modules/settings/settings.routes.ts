import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@yukti/database';
import { validate } from '../../middlewares/validate.js';
import { verifyToken, requireRole } from '../../middlewares/auth.js';
import { asyncHandler, ok } from '../../utils/http.js';
import { recordAudit } from '../../utils/audit.js';

// Returns settings as a flat key/value map for easy consumption.
async function settingsMap() {
  const rows = await prisma.siteSetting.findMany({where:{NOT:{key:{startsWith:'cms.'}}}});
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export const publicSettingsRouter = Router();
publicSettingsRouter.get('/', asyncHandler(async (_req, res) => ok(res, await settingsMap())));

publicSettingsRouter.get(
  '/navigation',
  asyncHandler(async (_req, res) =>
    ok(res, await prisma.navigationItem.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } })),
  ),
);

const updateSchema = z.object({ settings: z.record(z.string().refine(key=>!key.startsWith('cms.'), 'Reserved content namespace'), z.string()) });

export const adminSettingsRouter = Router();
adminSettingsRouter.use(verifyToken, requireRole('SUPER_ADMIN', 'ADMIN'));
adminSettingsRouter.get('/', asyncHandler(async (_req, res) => ok(res, await settingsMap())));
adminSettingsRouter.put(
  '/',
  validate({ body: updateSchema }),
  asyncHandler(async (req, res) => {
    const entries = Object.entries(req.body.settings as Record<string, string>);
    await prisma.$transaction(
      entries.map(([key, value]) =>
        prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } }),
      ),
    );
    await recordAudit({ userId: req.user?.id, action: 'UPDATED', entity: 'SITE_SETTINGS' });
    return ok(res, await settingsMap());
  }),
);
