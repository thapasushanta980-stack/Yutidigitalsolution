# Architecture

## System

```
                    ┌─────────────────────┐
                    │      Visitor        │
                    └──────────┬──────────┘
                               ▼
                    ┌─────────────────────┐        ┌─────────────────────┐
                    │  React Web (/web)   │        │ React Admin (/admin)│
                    └──────────┬──────────┘        └──────────┬──────────┘
                               │      REST / HTTPS (cookies)   │
                               └───────────────┬──────────────┘
                                               ▼
                                    ┌─────────────────────┐
                                    │  Express API (/api) │
                                    │  helmet · cors ·    │
                                    │  rate-limit · zod   │
                                    └──────────┬──────────┘
                        ┌──────────────────────┼──────────────────────┐
                        ▼                      ▼                      ▼
                   Auth (JWT)           Content services         Lead service
                   RBAC                 (services/projects/…)    (+ async email)
                        └──────────────────────┼──────────────────────┘
                                               ▼
                                    ┌─────────────────────┐
                                    │      Prisma ORM     │
                                    └──────────┬──────────┘
                                               ▼
                                    ┌─────────────────────┐
                                    │      MySQL 8        │
                                    └─────────────────────┘
```

Each backend module is self-contained: `modules/<name>/<name>.routes.ts` (thin),
`.controller.ts` (thin — HTTP in/out), `.service.ts` (business logic + Prisma), and
`.schema.ts` (Zod validation). Cross-cutting concerns live in `middlewares/` and `utils/`.

## Entity-Relationship (ERD, simplified)

```
Role 1───* User *───1 Role
User 1───* Media
User 1───* AuditLog
User 1───* Lead (assignee, optional)
User 1───1 TeamMember (optional)

Client 1───* Project 1───* ProjectImage
CaseStudy 1───* CaseStudyMetric
CaseStudy 1───* CaseStudyImage
CaseStudy 1───* Testimonial

Category 1───* Insight *───* Tag   (via InsightTag)

Standalone CMS: Service, Metric, Value, SiteSetting, NavigationItem, ContactSubmission
```

All content tables carry a `ContentStatus` (DRAFT/PUBLISHED/ARCHIVED); public reads filter to
PUBLISHED. Slugs are unique and auto-deduplicated (`-2`, `-3`, …).

## Security model

- **Auth:** bcrypt password hashing (cost 12); JWT in an HTTP-only, SameSite, `secure`-in-prod cookie. Constant-time-ish login to resist user enumeration.
- **RBAC:** `verifyToken` then `requireRole(...)` per admin router.
- **Input:** every mutating route validated with Zod; Prisma parameterises all queries.
- **Transport/headers:** Helmet, CORS allowlist (`FRONTEND_URL`, `ADMIN_URL`), 1 MB body limit.
- **Abuse:** global rate limiter + stricter limiter on auth and public forms; honeypot on forms.
- **Uploads:** in-memory buffer, MIME allowlist (jpeg/png/webp/svg), size cap, random filenames.
- **Auditing:** admin actions + logins recorded in `AuditLog` (best-effort, non-blocking).
- **Never exposed:** passwordHash, JWT secret, DB credentials, internal lead notes.

## Checklists

**Security**
- [x] Helmet · CORS allowlist · rate limiting · body size limit
- [x] Zod validation (client + server) · Prisma (SQLi-safe)
- [x] httpOnly + SameSite + secure cookies · RBAC · audit log
- [x] File upload MIME/size validation · no secrets in code

**SEO**
- [x] Per-page title/description/canonical · OpenGraph · Twitter
- [x] JSON-LD: Organization, WebSite, Service, Article, BreadcrumbList, LocalBusiness
- [x] Dynamic sitemap.xml · robots.txt · semantic headings · alt text · lazy images

**Performance**
- [x] Route-level code splitting · vendor chunking · lazy images
- [x] TanStack Query caching · compression · minimal animation (reduced-motion aware)

## Known limitations & future work

- **Runtime:** API runs via `tsx` (TypeScript at runtime) rather than a pre-compiled `dist/`. For maximum cold-start performance, add a bundler (tsup/esbuild) build step.
- **Admin CMS depth:** Services has a full CRUD form; Projects/Case Studies/Insights/Testimonials/Clients/Team/Metrics/Media/Settings ship with read scaffolds wired to their (already complete) admin APIs — full edit forms follow the identical `ServicesCms.tsx` pattern.
- **Email:** SMTP is optional and fire-and-forget; wire a queue (BullMQ) for retries at scale.
- **Media:** local disk driver by default; `storage.ts` is an abstraction ready for S3/R2/Cloudinary. Responsive image derivatives (sharp) are a future addition.
- **Search:** simple `LIKE` search; move to full-text / a search engine as content grows.
- **Testing:** unit/validation + a component test are included; expand integration/E2E (supertest is installed) and add CI.
- **Rendering:** SPA (client-rendered). For best SEO/LCP, consider SSR/SSG (Next.js/Astro) later — current setup already emits correct meta + JSON-LD via react-helmet-async.

## Scalability recommendations

- Put the API behind a load balancer; keep it stateless (JWT) for horizontal scaling.
- Add Redis for rate-limit state and caching hot public reads.
- Read replicas for MySQL; connection pooling (PgBouncer-equivalent / Prisma Accelerate).
- CDN for `/uploads` and static frontends. Daily DB backups: keep 7 daily / 4 weekly / 3 monthly.
