import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import { publicServiceRouter, adminServiceRouter } from '../modules/services/service.routes.js';
import { publicProjectRouter, adminProjectRouter } from '../modules/projects/project.routes.js';
import { publicCaseStudyRouter, adminCaseStudyRouter } from '../modules/case-studies/caseStudy.routes.js';
import { publicInsightRouter, adminInsightRouter } from '../modules/insights/insight.routes.js';
import { publicLeadRouter, adminLeadRouter } from '../modules/leads/lead.routes.js';
import { publicTestimonialRouter, adminTestimonialRouter } from '../modules/testimonials/testimonial.routes.js';
import { publicClientRouter, adminClientRouter } from '../modules/clients/client.routes.js';
import { publicTeamRouter, adminTeamRouter } from '../modules/team/team.routes.js';
import { publicMetricRouter, adminMetricRouter } from '../modules/metrics/metric.routes.js';
import { publicSettingsRouter, adminSettingsRouter } from '../modules/settings/settings.routes.js';
import { searchRouter } from '../modules/search/search.routes.js';
import { adminMediaRouter } from '../modules/media/media.routes.js';

// Versioned API surface: /api/v1
const router = Router();

// ── Public ──────────────────────────────────────────────
router.use('/auth', authRoutes);
router.use('/services', publicServiceRouter);
router.use('/projects', publicProjectRouter);
router.use('/case-studies', publicCaseStudyRouter);
router.use('/insights', publicInsightRouter);
router.use('/testimonials', publicTestimonialRouter);
router.use('/clients', publicClientRouter);
router.use('/team', publicTeamRouter);
router.use('/metrics', publicMetricRouter);
router.use('/site-settings', publicSettingsRouter);
router.use('/search', searchRouter);
router.use('/', publicLeadRouter); // POST /leads, POST /contact

// ── Admin (auth + RBAC enforced inside each router) ─────
router.use('/admin/services', adminServiceRouter);
router.use('/admin/projects', adminProjectRouter);
router.use('/admin/case-studies', adminCaseStudyRouter);
router.use('/admin/insights', adminInsightRouter);
router.use('/admin/leads', adminLeadRouter);
router.use('/admin/testimonials', adminTestimonialRouter);
router.use('/admin/clients', adminClientRouter);
router.use('/admin/team', adminTeamRouter);
router.use('/admin/metrics', adminMetricRouter);
router.use('/admin/settings', adminSettingsRouter);
router.use('/admin/media', adminMediaRouter);

export default router;
