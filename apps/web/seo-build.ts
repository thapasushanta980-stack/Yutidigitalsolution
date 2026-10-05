import type { Plugin } from 'vite';
import { services } from './src/lib/staticData';

// Only useful, published landing-site pages belong in the search sitemap.
export const indexablePaths = [
  '/', '/about', '/services', '/contact', '/free-growth-audit',
  ...services.map((service) => `/services/${service.slug}`),
];

export function seoBuild(siteOrigin: string): Plugin {
  let origin: string;
  return {
    name: 'landing-seo-files',
    apply: 'build',
    buildStart() {
      let url: URL;
      try { url = new URL(siteOrigin); }
      catch { throw new Error('Set VITE_SITE_URL to the final HTTPS origin in apps/web/.env.local before building.'); }
      if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash ||
          url.username || url.password || url.hostname === 'localhost' || url.hostname.endsWith('.example') ||
          url.hostname === 'example.com') {
        throw new Error('VITE_SITE_URL must be a real HTTPS origin without a path, query or credentials.');
      }
      origin = url.origin;
    },
    generateBundle() {
      const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
      this.emitFile({
        type: 'asset', fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexablePaths.map((path) => `  <url><loc>${escape(new URL(path, origin).href)}</loc></url>`).join('\n')}\n</urlset>\n`,
      });
      this.emitFile({
        type: 'asset', fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\n\nSitemap: ${origin}/sitemap.xml\n`,
      });
    },
  };
}
