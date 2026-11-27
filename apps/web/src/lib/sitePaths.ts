import { insights, services } from './siteContent.js';

// Only useful, published landing-site pages belong in the search sitemap.
export const indexablePaths = [
  '/', '/about', '/services', '/blog', '/contact', '/free-growth-audit',
  ...services.map((service) => `/services/${service.slug}`),
  ...insights.map((post) => `/blog/${post.slug}`),
];

// Every page written out as ready-made HTML at build time (see prerender.mjs).
export const prerenderPaths = [...indexablePaths, '/work', '/case-studies', '/privacy', '/terms'];
