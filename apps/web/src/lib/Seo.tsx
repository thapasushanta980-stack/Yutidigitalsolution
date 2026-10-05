import { Helmet } from 'react-helmet-async';
import { SITE_ORIGIN, siteUrl } from './siteUrl.js';

interface SeoProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
}

const SITE_NAME = 'Yukti Digital Solutions';
const ORIGIN = SITE_ORIGIN;

// Centralised head management: title, meta, canonical, OpenGraph, Twitter, JSON-LD.
export function Seo({ title, description, path = '', image, type = 'website', jsonLd, noindex }: SeoProps) {
  const fullTitle = title ? (title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`) : undefined;
  const canonical = path && !noindex ? siteUrl(path) : undefined;
  return (
    <Helmet>
      {fullTitle && <title>{fullTitle}</title>}
      {description && <meta name="description" content={description} />}
      {title && <meta name="robots" content={noindex ? 'noindex, follow' : 'index, follow'} />}
      {canonical && <link rel="canonical" href={canonical} />}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      {fullTitle && <meta property="og:title" content={fullTitle} />}
      {description && <meta property="og:description" content={description} />}
      {canonical && <meta property="og:url" content={canonical} />}
      {image && <meta property="og:image" content={siteUrl(image)} />}

      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      {fullTitle && <meta name="twitter:title" content={fullTitle} />}
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={siteUrl(image)} />}

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>}
    </Helmet>
  );
}

// Organization + WebSite JSON-LD used on the homepage.
export function organizationJsonLd() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: ORIGIN,
      address: { '@type': 'PostalAddress', addressLocality: 'Biratnagar', addressCountry: 'NP' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: ORIGIN,
    },
  ];
}
