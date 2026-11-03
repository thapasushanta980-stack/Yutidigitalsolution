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
        title="Contact"
        description="Book a call with Yukti Digital Solutions or contact our team in Biratnagar, Nepal."
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

      <Section className="page-hero" tone="paper">
        <Container>
          <SectionHeader
            as="h1"
            eyebrow="Contact"
            title="Let’s talk growth."
            intro="Book a time online, or email Yukti Digital Solutions in Biratnagar, Nepal."
          />
        </Container>
      </Section>

      <CalBooking
        eyebrow="The easiest way to connect"
        title="Book a free 30-minute call"
        intro="Choose a time in our live Cal.com calendar. Your booking confirmation and meeting details will come directly from Cal.com."
        tone="alt"
      />

      <Section tone="paper">
        <Container>
          <div className={mapsUrl ? 'split' : undefined}>
            <div>
              <SectionHeader
                eyebrow="Prefer email?"
                title="Reach our team directly."
                intro="For general questions or help with a booking, email us and we’ll get back to you."
              />
              <ul className="prose muted" style={{ listStyle: 'none', padding: 0 }}>
                {settings?.email && (
                  <li>
                    Email: <a href={`mailto:${settings.email}`}>{settings.email}</a>
                  </li>
                )}
                {settings?.phone && (
                  <li>
                    Phone: <a href={`tel:${settings.phone}`}>{settings.phone}</a>
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
