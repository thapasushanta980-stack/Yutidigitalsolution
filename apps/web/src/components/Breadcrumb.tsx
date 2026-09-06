import { Link } from 'react-router-dom';
import { Seo } from '../lib/Seo.js';

interface Crumb {
  label: string;
  href?: string;
}

// Renders a visible breadcrumb + emits BreadcrumbList JSON-LD.
export function Breadcrumb({ items }: { items: Crumb[] }) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${origin}${c.href}` } : {}),
    })),
  };
  return (
    <>
      <Seo title="" jsonLd={jsonLd} />
      <nav aria-label="Breadcrumb">
        <ol className="breadcrumb">
          {items.map((c, i) => (
            <li key={i}>
              {c.href && i < items.length - 1 ? <Link to={c.href}>{c.label}</Link> : <span>{c.label}</span>}
              {i < items.length - 1 && <span aria-hidden="true"> / </span>}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
