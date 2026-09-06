# Yukti API — Reference

Base URL: `/api/v1` · Version prefix is required.

## Conventions

**Success**

```json
{ "success": true, "data": { }, "meta": { "page": 1, "pageSize": 12, "total": 40, "totalPages": 4 } }
```

`meta` is present only on paginated list endpoints.

**Error**

```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Validation failed", "details": [] } }
```

| Code               | HTTP | Meaning                          |
| ------------------ | ---- | -------------------------------- |
| `BAD_REQUEST`      | 400  | Malformed request                |
| `UNAUTHORIZED`     | 401  | Missing/invalid session          |
| `FORBIDDEN`        | 403  | Role not permitted               |
| `NOT_FOUND`        | 404  | Resource/route missing           |
| `CONFLICT`         | 409  | Duplicate (e.g. slug/email)      |
| `VALIDATION_ERROR` | 422  | Zod validation failed (`details`)|
| `RATE_LIMITED`     | 429  | Too many requests                |
| `INTERNAL_ERROR`   | 500  | Unexpected (no stack in prod)    |

**Auth:** admin endpoints require a valid JWT sent automatically via the `yukti_token`
HTTP-only cookie. Send credentials (`withCredentials: true` / `credentials: 'include'`).

---

## Authentication

| Method | Path            | Auth | Body                         | Notes |
| ------ | --------------- | ---- | ---------------------------- | ----- |
| POST   | `/auth/login`   | —    | `{ email, password }`        | Sets httpOnly cookie; rate-limited |
| POST   | `/auth/logout`  | —    | —                            | Clears cookie |
| GET    | `/auth/me`      | ✔    | —                            | Returns current user |

## Public content (returns PUBLISHED only)

| Method | Path                       | Description |
| ------ | -------------------------- | ----------- |
| GET    | `/services`                | List services |
| GET    | `/services/:slug`          | One service |
| GET    | `/projects?featured=true`  | List projects (optional featured filter) |
| GET    | `/projects/:slug`          | Project + images + related |
| GET    | `/case-studies?featured=`  | List case studies (+ metrics) |
| GET    | `/case-studies/:slug`      | Case study + metrics + images + testimonials |
| GET    | `/insights?q=&category=&page=&pageSize=` | Paginated articles |
| GET    | `/insights/categories`     | Category list |
| GET    | `/insights/:slug`          | Article + related |
| GET    | `/testimonials`            | Published testimonials |
| GET    | `/clients`                 | Published client logos |
| GET    | `/team`                    | Team members |
| GET    | `/team/values`             | About-page values |
| GET    | `/metrics`                 | Homepage/about metrics |
| GET    | `/site-settings`           | Key/value settings map |
| GET    | `/site-settings/navigation`| Navigation items |
| GET    | `/search?q=`               | Categorised search |

## Public forms

**POST `/leads`** — Free Growth Audit. Required: `name`, `email`, `website`, `challenge`.

```json
// request
{ "name": "Jane Doe", "email": "jane@acme.com", "website": "https://acme.com", "challenge": "Grow organic traffic", "company": "Acme", "phone": "+9779...", "industry": "Retail", "budget": "$1k–5k / mo", "services": ["SEO"], "message": "..." }
// response
{ "success": true, "data": { "id": "clx..." } }
```

Internal lead fields (status, notes, assignee) are **never** returned to public callers.

**POST `/contact`** — Contact form. Required: `name`, `email`, `message`.

Both forms include a hidden `company_website` honeypot (must be empty) and are rate-limited.

## Admin (require auth + role)

Roles: `SUPER_ADMIN`, `ADMIN`, `EDITOR`. Deletes generally require `SUPER_ADMIN`/`ADMIN`.

| Method | Path                          | Description |
| ------ | ----------------------------- | ----------- |
| GET    | `/admin/leads/stats`          | Dashboard counts |
| GET    | `/admin/leads?status=&q=&page=` | List leads |
| GET    | `/admin/leads/:id`            | Lead detail (incl. internal note) |
| PUT    | `/admin/leads/:id`            | Update status / note / assignee |
| DELETE | `/admin/leads/:id`            | Delete lead |
| GET/POST | `/admin/services`           | List / create |
| GET/PUT/DELETE | `/admin/services/:id` | Read / update / delete |
| …      | `/admin/projects`, `/admin/case-studies`, `/admin/insights` | Same CRUD shape |
| GET/POST/PUT/DELETE | `/admin/testimonials`, `/admin/clients`, `/admin/team`, `/admin/metrics` | Collection CRUD |
| GET/PUT | `/admin/settings`            | Read / bulk-update site settings |
| GET/POST/DELETE | `/admin/media`       | List / upload (multipart `file`) / delete |

## SEO (served at root, not under `/api`)

| Method | Path            | Description |
| ------ | --------------- | ----------- |
| GET    | `/sitemap.xml`  | Dynamic sitemap of published content |
| GET    | `/robots.txt`   | Robots policy |
| GET    | `/health`       | Health check |
