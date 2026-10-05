# Deferred CRM and CMS deployment notes

Archived planning reference only. The current launch is the standalone landing site; see VPS-DEPLOYMENT.md. The active Nginx configuration is static-only and must be redesigned before enabling the API/admin. deploy/future contains inactive templates.

# VPS preparation and readiness review

Status: prepared templates, not deployed or runtime-verified. This is a focused
deployment review, not a full codebase security audit. Assumption: Linux with
systemd, Nginx, a local MySQL server, and one HTTPS domain for web and /admin.
Confirm the provider, OS, domain, RAM and existing services before provisioning.

## Changes prepared

- Nginx serves the public build and /admin SPA, and proxies API, media and SEO routes.
- API binds to loopback, checks DB connectivity at startup, and rejects example
  JWT secrets and HTTP origins in production.
- systemd runs as an unprivileged user, with persistent writable uploads only.
- Development database/Adminer ports now bind to loopback. That Compose file
  still has development passwords and must not be used for production.
- Contact/audit forms now submit to the API and only show success after acceptance.
- SVG uploads are disabled; legacy uploaded documents receive a sandbox CSP.
- A separate administrator bootstrap creates roles/user without altering content.

## Launch blockers and remaining checks

1. Dependencies are not installed in this checkout. Build, tests, migrations,
   Nginx validation and end-to-end tests have NOT run. The security-audit skill
   requires isolated execution with no network, explicit environment, read-only
   source/toolchain, scratch-only writes and resource limits; that sandbox is
   not established in this session. Validate in an isolated Linux build environment
   with pre-provisioned dependencies and dummy configuration.
2. API declares Multer 1.x. Upgrade Multer and its types together, regenerate the
   lockfile, audit the resolved dependencies and test upload success/error/size
   cases before release. Upstream lists versions below 2.3.0 as affected by
   GHSA-535w-7cp7-47q4. Here upload parsing follows authentication and editor/admin
   role checks; do not describe the endpoint as anonymously exploitable.
   Source: https://github.com/expressjs/multer/security/advisories/GHSA-535w-7cp7-47q4
3. Public content still comes from apps/web/src/lib/staticData.ts. CMS edits do
   not change it. The DB-generated sitemap can therefore disagree with the site.
   Decide whether to retain static content or migrate it into the CMS before
   enabling CMS-driven public reads. Do not replace existing content with seeds.
4. SMTP delivery is optional and failure does not undo saved leads. Configure and
   verify sender/domain delivery before promising email confirmations.
5. Upload filtering uses declared MIME type; image decoding/signature validation
   remains a follow-up. Review any existing SVGs before migration.
6. Confirm TLS renewal, firewall, monitoring, backup retention and restore on the
   actual VPS. No server or credentials were supplied and none was accessed.

## Host layout

Use a patched Node 24 LTS runtime (verify /usr/bin/node), Nginx, MySQL 8 and a
dedicated `yukti` system user. Node release reference: https://github.com/nodejs/Release

| Path | Purpose |
| --- | --- |
| /srv/yukti/releases/RELEASE | Built monorepo with Linux dependencies and generated Prisma client |
| /srv/yukti/current | Symlink to active release |
| /srv/yukti/static | Public dist files, with admin dist files inside admin/ |
| /etc/yukti/api.env | Production variables, root-owned mode 600 |
| /var/lib/yukti/uploads | Owned by yukti, persistent between releases |

Keep source and dependencies read-only to the service user. Give Nginx read/traverse
access to static files. Do not put .env, source, dependencies or backups in the
static directory. Allow inbound HTTPS/HTTP and your restricted SSH port only;
do not expose 4000, 3306, 5173, 5174 or 8080. Preserve SSH access when changing firewall rules.

## Release procedure

1. Resolve the blockers above. Prepare dependencies from the committed lockfile
   in the build environment (`npm ci`), generate Prisma (`npm run db:generate`),
   then run `npm test` and `npm run build`. Build for Linux, including Prisma's
   native engine; do not copy Windows node_modules. These are deployment
   instructions, not commands already executed by this review.
2. Create a dedicated MySQL database and password-protected user restricted to
   that database/local host. Use a separate migration credential if runtime
   database grants exclude schema changes. Keep MySQL on loopback.
3. Copy deploy/api.env.example to /etc/yukti/api.env; replace every placeholder.
   Set all three URLs to the exact same HTTPS origin (no /admin suffix). Use a
   randomly generated JWT secret, for example output from `openssl rand -hex 32`.
   URL-encode the DB password in DATABASE_URL. Do not put secrets into shell history.
4. Back up an existing database and uploads before migrations. In a controlled
   release shell with production variables securely loaded, run `npm run db:deploy`
   from the release root. Use migrate deploy, never migrate dev or db push.
5. For the first installation only, securely supply SEED_ADMIN_EMAIL and a unique
   SEED_ADMIN_PASSWORD of at least 16 characters, then run
   `npm run bootstrap:admin --workspace @yukti/database`. Remove these variables
   from the release shell afterwards. Never run db:seed on production: the
   development seed deletes and overwrites content. Bootstrap refuses existing users.
6. Publish apps/web/dist into /srv/yukti/static and apps/admin/dist into
   /srv/yukti/static/admin. Stage these together per release to avoid mixed builds.
7. Install deploy/yukti-api.service into /etc/systemd/system, create the uploads
   directory, then `systemctl daemon-reload` and `systemctl enable --now yukti-api`.
   Verify `curl --fail http://127.0.0.1:4000/health` and inspect service logs.
8. Point the domain DNS at the VPS. Provision a valid certificate using an initial
   HTTP-only ACME configuration; the supplied final Nginx config needs certificate
   files to exist first. Replace example.com throughout deploy/nginx.conf,
   install the configuration, run `nginx -t`, then reload Nginx. Verify automatic
   certificate renewal. Do not expose admin login over HTTP.

## Acceptance and operations

On staging, test direct refresh on public routes and /admin/login, admin login /
logout and secure cookies, invalid login handling, unauthenticated admin API denial,
contact and audit submission (visible in admin), validation errors, valid image
upload and SVG rejection, uploaded-image persistence after service restart, sitemap,
robots, and expected rate-limit behavior behind the proxy. Check real SMTP delivery
separately. /health is liveness only; use an independent database check for readiness.

Back up MySQL with a consistent transactional dump and uploads on a schedule;
encrypt copies off-server, restrict backup credentials and test a restore into an
isolated database. Record retention/recovery objectives before accepting leads.
Monitor service restarts, disk, memory, HTTP errors and certificate expiry. Logs
contain personal request metadata; limit access and retention.

For application rollback, restore the previous current symlink AND matching static
build, then restart the API. Only do so when its schema is compatible with applied
migrations. Database rollback requires a reviewed migration/restore plan; do not
blindly restore old backups over new leads. Keep uploads outside release folders.
