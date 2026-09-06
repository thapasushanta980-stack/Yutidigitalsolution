# Yukti Digital Solutions — Full-Stack Platform

A production-oriented, full-stack website + CMS for **Yukti Digital Solutions**, a digital
growth agency based in Kathmandu, Nepal. Built as a modular monorepo: a public marketing
site, a REST API, and a secure admin dashboard, all backed by MySQL.

> **Design philosophy:** editorial, minimal, high-end. Ink-on-paper palette, strong
> typography, restrained motion. No gratuitous gradients, shadows, or rounded cards.

---

## 1. Overview

| Layer     | Stack                                                                 |
| --------- | --------------------------------------------------------------------- |
| Web       | React 18 · Vite · TypeScript · React Router · TanStack Query · RHF · Zod · Framer Motion |
| Admin     | React 18 · Vite · TypeScript · TanStack Query · RHF · Zod             |
| API       | Node · Express · TypeScript · Zod · JWT · bcrypt · Helmet · Pino      |
| Database  | MySQL 8 · Prisma ORM                                                  |
| Shared    | `@yukti/types`, `@yukti/config` (design tokens), `@yukti/ui`, `@yukti/database` |

Content (services, projects, case studies, insights, testimonials, team, clients, metrics,
site settings) is **CMS-driven** — no code changes are needed for normal content updates.

## 2. Features

- Public site: Home, About, Services, Work, Case Studies, Insights, Contact, Free Growth Audit, legal pages
- CMS-driven content with DRAFT / PUBLISHED / ARCHIVED status (public API returns PUBLISHED only)
- Free Growth Audit + Contact forms → secure leads pipeline (with honeypot + rate limiting)
- Admin dashboard: auth, stats, lead management (status, private notes), Services CRUD, and scaffolds for every other collection
- JWT auth via **HTTP-only, SameSite, secure** cookies + role-based access control (SUPER_ADMIN / ADMIN / EDITOR)
- SEO: per-page meta, OpenGraph, Twitter, canonical, JSON-LD (Organization, WebSite, Service, Article, BreadcrumbList, LocalBusiness), dynamic `sitemap.xml`, `robots.txt`
- Accessibility: skip link, focus states, ARIA, keyboard nav, reduced-motion support
- Security: Helmet, CORS allowlist, rate limiting, Zod validation, Prisma (SQL-injection safe), request size limits, audit log, secure file uploads (MIME + size validation)
- Performance: route-level code splitting, vendor chunking, lazy images

## 3. Architecture

```
Visitor ─▶ React Web (/web) ─┐
                             ├─▶ Express API (/api, /api/v1) ─▶ Prisma ─▶ MySQL
Admin  ─▶ React Admin (/admin)┘        │
                                       ├─ Auth (JWT httpOnly cookie) + RBAC
                                       ├─ Content services (services/projects/…)
                                       └─ Lead service (+ non-blocking email)
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for diagrams and the ERD.

## 4. Requirements

- Node.js ≥ 20, npm ≥ 10
- MySQL 8 (Docker Compose provided) or Docker Desktop

## 5. Installation

```bash
npm install
cp .env.example .env       # then edit values (JWT_SECRET, DATABASE_URL, …)
npm run db:generate        # generate Prisma client
```

## 6. Environment variables

All variables live in a **single root `.env`** (see `.env.example`). Key ones:
`DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_URL`, `ADMIN_URL`, `PUBLIC_SITE_URL`,
`UPLOAD_DIR`, `MAX_FILE_SIZE`, SMTP\_\*, `GOOGLE_MAPS_API_KEY`, `RATE_LIMIT_*`, `SEED_ADMIN_*`.

## 7. Database setup, migration & seed

```bash
docker compose up -d       # starts MySQL (3306) + Adminer (8080)
npm run db:migrate         # create tables (Prisma migrate dev)
npm run db:seed            # roles, seed admin, services, metrics, values, settings, nav
```

The seed inserts **structure and clearly-marked placeholder content only** — it never
invents client statistics, testimonials, or real business metrics.

## 8. Development

```bash
npm run dev                # runs api (4000) + web (5173) + admin (5174) together
# or individually:
npm run dev:api
npm run dev:web
npm run dev:admin
```

- Web: http://localhost:5173
- Admin: http://localhost:5174/admin
- API: http://localhost:4000/api/v1 · health at `/health`

## 9. Admin access

Seeded from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (defaults `admin@yukti.example` /
`ChangeMe!2026`). **Change the password after first login.**

## 10. Testing

```bash
npm test                   # api (vitest) + web (vitest + Testing Library)
```

## 11. Production build

```bash
npm run build              # prisma client, types, api (typecheck + tsup bundle → dist/), web, admin
npm start --workspace @yukti/api   # serve compiled API (node dist/server.js)
```

The API is bundled with **tsup** to `apps/api/dist/server.js` (ESM, Node 20). The Prisma
client stays external and is loaded from `node_modules` at runtime, so run `npm run db:generate`
on the deploy host (or ship `node_modules/.prisma`).

Serve `apps/web/dist` and `apps/admin/dist` behind a reverse proxy / CDN (see §14).

## 12. API documentation

See [`docs/API.md`](docs/API.md) for the full endpoint list, request/response shapes, and errors.

## 13. Project structure

```
yukti-digital-solutions/
├─ apps/
│  ├─ web/     # public React site
│  ├─ api/     # Express REST API (modular: modules/<name>/*.{routes,controller,service,schema})
│  └─ admin/   # React admin dashboard
├─ packages/
│  ├─ database/  # Prisma schema, client, seed
│  ├─ types/     # shared API contract types
│  ├─ config/    # design tokens (tokens.css + TS)
│  └─ ui/        # shared React primitives (Button, Container, Section, FormField, Spinner)
├─ docs/         # API.md, ARCHITECTURE.md
├─ docker-compose.yml
└─ .env.example
```

## 14. Deployment

- Frontend (web/admin): static hosting / CDN. Set API base or proxy `/api` to the backend.
- API: Node host behind Nginx; terminate TLS at the proxy. Set `NODE_ENV=production` (enables secure cookies).
- MySQL: private network only — never publicly exposed. Run `npm run db:deploy` for migrations.
- Media: local disk by default; swap `apps/api/src/modules/media/storage.ts` for S3/R2/Cloudinary without touching business logic.

## 15. Troubleshooting

- **`Invalid environment variables`** → fill required keys in root `.env` (JWT_SECRET ≥ 16 chars, DATABASE_URL set).
- **Prisma can't reach DB** → ensure `docker compose up -d` is healthy; check `DATABASE_URL` host/port.
- **CORS errors** → `FRONTEND_URL` / `ADMIN_URL` must exactly match the browser origin.
- **Cookie not set on login** → in dev use http on localhost; in prod cookies require HTTPS.

## 16. Known limitations & future work

See the bottom of [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## 17. Git & commits

Conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`).
Branches: `main`, `develop`, `feature/*`, `fix/*`, `hotfix/*`.

## License

UNLICENSED — © 2026 Yukti Digital Solutions.
