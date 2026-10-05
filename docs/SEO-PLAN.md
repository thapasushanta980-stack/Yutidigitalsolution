# SEO plan for yuktids.com

Scope: the static agency marketing site, with Biratnagar, Nepal as the stated
location. CRM/CMS remain deferred. The supplied image is a checklist to assess,
not a promise of rankings or a requirement to apply every item blindly.

## 1. Technical foundation — changes implemented

| Area | Change | Acceptance check |
| --- | --- | --- |
| Canonical host | https://yuktids.com is the build default; metadata and breadcrumbs share it | Inspect canonical on home and every service page |
| Sitemap | Build emits nine URLs: home, about, services, four services, contact, free audit | Open /sitemap.xml; all entries should return 200 |
| Robots | Build emits crawl permissions and the sitemap URL | Fetch /robots.txt; ensure no global block |
| Indexing | Keep errors, legal placeholders and empty collections noindex | Inspect rendered robots metadata; test route changes |
| HTTP status | Nginx only falls back to the SPA for known routes | Unknown paths, nonexistent service slugs and missing assets return 404 |
| Redirects | HTTP and HTTPS www point to HTTPS apex | Check each host variant; provision a certificate covering both names |
| Metadata | Consistent local homepage description; service overview describes actual offerings | One rendered title, description and canonical per indexable page |
| First visit | Removed the 2.3-second intro splash | Page becomes accessible without waiting for the intro |

The source changes and build output do not establish deployed behavior. Validate
Nginx and HTTP responses after installation. Adding a route requires updating the
Nginx allowlist; adding indexable content requires updating `seo-build.ts`.

## 2. Next engineering milestone — static pre-rendering

The site is still client-rendered. Its initial HTML has metadata but an empty
React root. Generate page-specific HTML **at build time** for the nine indexable
routes, preserving static VPS hosting. A runtime SSR server is unnecessary for
content that only changes with a release.

Acceptance criteria:

- With JavaScript disabled, each published URL exposes its H1, main copy and links.
- View Source includes that page's title, description, canonical and valid JSON-LD.
- React attaches without replacing visible content with loaders or hiding it behind animations.
- Unknown URLs retain a true 404; internal navigation and email forms still work.
- The build fails if an indexable page cannot render. Do not ship crawler-only HTML.

Google recommends considering server rendering or pre-rendering because not all
crawlers execute JavaScript. This is a delivery improvement, not a guarantee of
indexing: [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

## 3. Content and local relevance — owner input needed

| Page | Search intent | Content to add or verify |
| --- | --- | --- |
| Home | Digital marketing agency in Biratnagar | Actual services, location, contact path, clear business proposition |
| About | Who runs Yukti | Approved founder bios, roles and relevant experience |
| Social media service | Social media marketing support | Deliverables, platforms, approval process and sample work |
| Video/TVC service | Video production support | Production stages, deliverables and approved portfolio links |
| Meta ads service | Facebook/Instagram campaign support | Setup, creative, measurement and reporting responsibilities |
| SEO service | Search optimisation support | Audit scope, technical/on-page work, reporting and realistic expectations |
| Contact / audit | Enquire about working together | Confirm email, phone if offered, service area and what the audit includes |

Write from actual business facts. Confirm founding year, client-logo permission,
brands-served/markets claims and founder details before launch. Do not invent
testimonials, qualifications, project outcomes, phone numbers or street addresses.
Keep one clear page H1 and a useful heading hierarchy; this is a clarity convention,
not a magic ranking rule. Add descriptive internal links where they help readers.

Existing service breadcrumbs should remain visible and match their structured data.
Use useful FAQs only when there are real customer questions to answer. FAQ markup
is not a priority for agency rich results; Google's eligibility is limited:
[FAQ rich-result guidance](https://developers.google.com/search/blog/2023/08/howto-faq-changes).

Do not remove noindex from error or unfinished pages just to satisfy the image's
checklist. Publish real work/insights before adding those collections to the sitemap.
Review the current placeholder legal text before launch.

## 4. Performance and images — measure before claiming success

Measure home, services and a service-detail page on mobile with PageSpeed Insights
after deployment. Separate lab diagnostics from real-user field data. Targets at
the 75th percentile: LCP <= 2.5 seconds, INP <= 200 ms, CLS <= 0.1.
[Core Web Vitals reference](https://web.dev/articles/vitals).

- Preserve image space with correct dimensions or an aspect-ratio wrapper; check
  client logos, portraits, fonts, video frames and loading states for shifts.
- Existing portraits are roughly 100–115 KB and the largest logo inspected is
  about 58 KB. Compare WebP/AVIF against the originals before replacing assets;
  conversion alone does not prove a performance gain.
- Keep useful alt text for informative images. Decorative images use empty alt;
  do not stuff keywords into every image.
- Lazy-load below-fold media, but avoid delaying above-fold content. Inspect the
  animation and third-party video/feed costs before deciding what to remove.
- Test keyboard/reduced-motion behavior along with performance.

No load-time, Core Web Vitals pass or ranking result has been measured yet.

## 5. Launch and measurement — after DNS/TLS are live

1. Validate the Nginx configuration and redirects, 404 responses, robots and sitemap.
2. Verify domain ownership for yuktids.com in Google Search Console using DNS.
   This requires the domain owner's account; no verification/submission was performed here.
3. Submit https://yuktids.com/sitemap.xml and inspect the home and service URLs.
4. Check rendered content and structured data with URL Inspection/Rich Results Test.
5. Verify consistent business information in an owner-managed Google Business
   Profile if the business is eligible. Seek relevant local listings and genuine
   client/partner references; avoid purchased link schemes or invented endorsements.
6. Record a launch baseline, then review weekly: indexing, impressions, relevant
   queries, clicks, landing pages and actual enquiries. Review trends monthly;
   the email-draft site does not itself confirm completed enquiries.

A sitemap helps discovery but cannot guarantee indexing or rank:
[Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview).
There is no credible "rank #1 by Friday" acceptance criterion.
