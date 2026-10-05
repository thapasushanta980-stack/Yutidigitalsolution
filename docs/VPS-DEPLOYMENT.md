# Agency landing site: VPS deployment

The current release is the public agency marketing site in `apps/web`. It retains
its existing landing page, service/about pages and enquiry pages. Content comes
from `apps/web/src/lib/staticData.ts` and images from `apps/web/public`.

The VPS serves static files with Nginx. No API process, admin dashboard, database,
Docker, Prisma migration, SMTP configuration or production `.env` is needed.
CRM and CMS work is deferred; see [future notes](FUTURE-FULLSTACK.md).

## Local development and build

From the repository root, install only the landing site's workspace dependencies:

```sh
npm ci --workspace @yukti/web --workspace @yukti/ui --workspace @yukti/config --workspace @yukti/types --include-workspace-root=false
npm run dev:landing
```

Build and check the release:

```sh
npm run test:landing
npm run build:landing
npm run preview:landing
```

Deploy only the contents of `apps/web/dist`. The existing root `build` and `dev`
commands are full-stack commands; use the `:landing` commands for this release.
Node/npm are build tools and need not run on the VPS when building elsewhere.

## Enquiries and content

Contact and audit forms prepare email drafts addressed to the agency. Visitors
must send the draft themselves. The website neither saves leads nor confirms
email delivery. Both flows explain this and allow returning to edit the details.
A visible agency email provides a fallback when no email app is configured.

Edit business details, navigation and service copy in `staticData.ts`, then rebuild.
Check the agency email, phone, social links and images before launch. Review the
placeholder privacy/terms copy in `pages/Legal.tsx` before publishing those pages.

The build generates `robots.txt` and `sitemap.xml` for `https://yuktids.com`.
Canonical URLs use the same domain. An optional public `VITE_SITE_URL` override
can be set in `apps/web/.env.local`; production builds require a valid HTTPS origin.
See [the SEO plan](SEO-PLAN.md) for priorities and verification criteria.

## VPS setup

1. Confirm the Linux distribution, domain and existing server configuration.
2. Install Nginx. Point the domain's DNS at the VPS.
3. Create `/srv/yukti/static` with read/traverse access for the Nginx user.
4. Copy **only the contents** of `apps/web/dist` there. Do not upload `.env`, source,
   node_modules, API/admin builds or database files into the web root.
5. Provision an HTTPS certificate using an initial HTTP-only ACME configuration.
   The supplied final configuration requires existing certificate files.
6. Use the configured `yuktids.com` canonical domain and `www.yuktids.com` redirect. Provision a certificate covering both names.
   Install it using the distribution's Nginx site configuration convention.
7. Run `sudo nginx -t`, then reload Nginx. Check automated certificate renewal.
8. Allow HTTP/HTTPS and restricted SSH through the firewall, preserving SSH access.
   No application or database ports need to be opened.

`deploy/nginx.conf` serves public SPA routes, caches hashed assets and disables
caching of the HTML entry point. `/admin`, `/api` and `/uploads` return 404.
The templates under `deploy/future` are inactive planning files.

## Acceptance checks

- Open the home page and refresh `/about`, `/services` and a service detail URL.
- Check mobile navigation, images, contact links and the main enquiry calls to action.
- Complete each form: verify the email draft includes the entered details (including
  website/services), excludes the honeypot, and never claims delivery.
- Return to edit the draft and check values are retained; test the manual email fallback.
- Confirm the browser makes no `/api` requests and displays no console errors.
- Check HTTP redirects to HTTPS; `/robots.txt` returns text; `/api` and `/admin` return 404.
- Verify page titles, canonical URLs, real business details and legal copy.

## Updates and rollback

Keep a copy of the previous static release outside the web root. Stage each new
build in a separate release directory, then switch the `/srv/yukti/static` symlink
atomically to avoid mixing builds. Keep the prior release for rollback. Nginx
configuration changes require `nginx -t` before reload. Content changes require a
new build but no database migration or application restart.

## Validation status

The landing production build has passed, including TypeScript and sitemap/robots
emission. Browser performance and deployed HTTP behavior remain unverified. Run
`npm run test:landing` for metadata and component regression coverage. Nginx still
requires `nginx -t` on the target Linux host. No VPS has been accessed or changed.
Backend dependency findings belong to the future CMS release and do not block
serving this static artifact. Static pre-rendering remains the next SEO milestone.
