import { Router } from 'express';
import { prisma, ContentStatus } from '@yukti/database';
import { env } from '../../config/env.js';
import { asyncHandler } from '../../utils/http.js';

export const seoRouter = Router();

// Dynamic sitemap.xml built from published content.
seoRouter.get(
  '/sitemap.xml',
  asyncHandler(async (_req, res) => {
    const base = env.PUBLIC_SITE_URL.replace(/\/$/, '');
    const staticPaths = ['', '/about', '/services', '/work', '/case-studies', '/insights', '/contact', '/free-growth-audit', '/privacy', '/terms'];

    const [services, projects, caseStudies, insights] = await Promise.all([
      prisma.service.findMany({ where: { status: ContentStatus.PUBLISHED }, select: { slug: true, updatedAt: true } }),
      prisma.project.findMany({ where: { status: ContentStatus.PUBLISHED }, select: { slug: true, updatedAt: true } }),
      prisma.caseStudy.findMany({ where: { status: ContentStatus.PUBLISHED }, select: { slug: true, updatedAt: true } }),
      prisma.insight.findMany({ where: { status: ContentStatus.PUBLISHED }, select: { slug: true, updatedAt: true } }),
    ]);

    const urls: string[] = [
      ...staticPaths.map((p) => `${base}${p}`),
      ...services.map((s) => `${base}/services/${s.slug}`),
      ...projects.map((p) => `${base}/work/${p.slug}`),
      ...caseStudies.map((c) => `${base}/case-studies/${c.slug}`),
      ...insights.map((i) => `${base}/insights/${i.slug}`),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>`;
    res.header('Content-Type', 'application/xml').send(xml);
  }),
);

// robots.txt
seoRouter.get('/robots.txt', (_req, res) => {
  const base = env.PUBLIC_SITE_URL.replace(/\/$/, '');
  res
    .header('Content-Type', 'text/plain')
    .send(`User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${base}/sitemap.xml\n`);
});
