import { Link } from 'react-router-dom';
import { ArrowUp, ArrowUpRight, Mail, Youtube } from 'lucide-react';
import { Container, Button, Logo } from '@yukti/ui';
import { useSiteSettings } from '../lib/queries.js';

const COLUMNS = [
  {
    title: 'Explore',
    links: [
      ['Services', '/services'],
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
            <h2>
              Turn your digital presence into measurable <span className="accent-underline">growth.</span>
            </h2>
          </div>
          <Button as="a" href="/free-growth-audit" size="lg">
            Get Your Free Growth Audit
          </Button>
        </div>

        <div className="footer__grid">
          <div className="footer__brand">
            <Logo variant="light" height={28} />
            <p className="muted">{settings?.address ?? 'Biratnagar, Nepal'}</p>
            {settings?.email && (
              <p>
                <a className="footer__mail" href={`mailto:${settings.email}`}>
                  <Mail size={16} aria-hidden="true" /> {settings.email}
                </a>
              </p>
            )}
            {settings?.social_youtube && (
              <p>
                <a className="footer__mail" href={settings.social_youtube} target="_blank" rel="noopener noreferrer">
                  <Youtube size={16} aria-hidden="true" /> YouTube <ArrowUpRight size={14} aria-hidden="true" />
                </a>
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
          <button type="button" className="footer__top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Back to top <ArrowUp size={14} aria-hidden="true" />
          </button>
        </div>
      </Container>
    </footer>
  );
}
