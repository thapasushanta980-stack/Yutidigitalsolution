import {contactCopy} from '../lib/pageContent.js';
import { Section, Container } from '@yukti/ui';
import { Seo } from '../lib/Seo.js';
import { SectionHeader } from '../components/SectionHeader.js';
import { CalBooking } from '../components/CalBooking.js';
import { useSiteSettings } from '../lib/queries.js';

export default function Contact() {
  const { data: settings } = useSiteSettings();
  const mapsUrl = settings?.google_maps_url;

  return (
    <>
      <Seo
        title={contactCopy.copy1}
        description={contactCopy.copy2}
        path="/contact"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: 'Yukti Digital Solutions',
          address: { '@type': 'PostalAddress', addressLocality: 'Biratnagar', addressCountry: 'NP' },
          email: settings?.email,
          telephone: settings?.phone,
        }}
      />

      <CalBooking
        eyebrow={contactCopy.copy3}
        title={contactCopy.copy4}
        intro={contactCopy.copy5}
        tone="alt"
        headingAs="h1"
        className="page-top"
      />

      <Section tone="paper">
        <Container>
          <div className={mapsUrl ? 'split' : undefined}>
            <div>
              <SectionHeader
                eyebrow={contactCopy.copy6}
                title={contactCopy.copy7}
                intro={contactCopy.copy8}
              />
              <ul className="prose muted" style={{ listStyle: 'none', padding: 0 }}>
                {settings?.email && (
                  <li>
                    Email: <a href={`mailto:${settings.email}`}>{settings.email}</a>
                  </li>
                )}
                {settings?.phone && (
                  <li>
                    Contact No: <a href={`tel:${settings.phone.replace(/\s/g, '')}`}>{settings.phone}</a>
                  </li>
                )}
                <li>{settings?.address ?? 'Biratnagar, Nepal'}</li>
              </ul>
            </div>
            {mapsUrl && (
              <div className="map-embed">
                <iframe title="Office location" src={mapsUrl} loading="lazy" />
              </div>
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}
