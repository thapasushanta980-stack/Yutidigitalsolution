import { Link } from 'react-router-dom';
import { Container, Button, Logo } from '@yukti/ui';
import { useSiteSettings } from '../lib/queries.js';

const COLUMNS = [
  {
    title: 'Explore',
    links: [
      ['Services', '/services'],
      ['Work', '/work'],
      ['Case Studies', '/case-studies'],
      ['Insights', '/insights'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About', '/about'],
      ['Contact', '/contact'],
      ['Free Growth Audit', '/free-growth-audit'],
    ],
  },
  {
    title: 'Legal',
    links: [
      ['Privacy Policy', '/privacy'],
      ['Terms & Conditions', '/terms'],
    ],
  },
];

export function Footer() {
  const { data: settings } = useSiteSettings();
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <Container>
        <div className="footer__cta">
          <div>
            <p className="eyebrow">Ready when you are</p>
            <h2>Turn your digital presence into measurable growth.</h2>
          </div>
          <Button as="a" href="/free-growth-audit" size="lg">
            Get Your Free Growth Audit
          </Button>
        </div>

        <div className="footer__grid">
          <div className="footer__brand">
            <Logo variant="light" height={28} />
            <p className="muted">{settings?.address ?? 'Kathmandu, Nepal'}</p>
            <p className="muted">{settings?.coverage ?? 'South Asia · The Gulf · Australia'}</p>
            {settings?.email && (
              <p>
                <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </p>
            )}
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.title} className="footer__col" aria-label={col.title}>
              <h4 className="fig-label">{col.title}</h4>
              <ul>
                {col.links.map(([label, href]) => (
                  <li key={href}>
                    <Link to={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="footer__bar">
          <p className="muted">{settings?.footer_note ?? `© ${year} Yukti Digital Solutions`}</p>
        </div>
      </Container>
    </footer>
  );
}
