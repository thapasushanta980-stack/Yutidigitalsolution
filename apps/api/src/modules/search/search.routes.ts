import { Router } from 'express';
import { z } from 'zod';
import { prisma, ContentStatus } from '@yukti/database';
import type { SearchResults } from '@yukti/types';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler, ok } from '../../utils/http.js';

const querySchema = z.object({ q: z.string().trim().min(1).max(120) });

export const searchRouter = Router();

// GET /api/v1/search?q= — categorised results across published content.
searchRouter.get(
  '/',
  validate({ query: querySchema }),
  asyncHandler(async (req, res) => {
    const q = req.query.q as string;
    const published = { status: ContentStatus.PUBLISHED };
    const [services, work, caseStudies, insights] = await Promise.all([
      prisma.service.findMany({ where: { ...published, title: { contains: q } }, select: { title: true, slug: true }, take: 5 }),
      prisma.project.findMany({ where: { ...published, title: { contains: q } }, select: { title: true, slug: true }, take: 5 }),
      prisma.caseStudy.findMany({ where: { ...published, title: { contains: q } }, select: { title: true, slug: true }, take: 5 }),
      prisma.insight.findMany({ where: { ...published, title: { contains: q } }, select: { title: true, slug: true }, take: 5 }),
    ]);
    const results: SearchResults = { services, work, caseStudies, insights };
    return ok(res, results);
  }),
);
