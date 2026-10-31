import { useState } from 'react';
import { Section, Container } from '@yukti/ui';
import { SectionHeader } from './SectionHeader.js';
import { siteSettings } from '../lib/staticData.js';

// Cal.com booking link, e.g. "yukti/growth-audit" (username/event-slug).
// Allow a build-time override while keeping the confirmed event available by default.
const CAL_LINK = (import.meta.env.VITE_CAL_LINK || 'yuktids.bookings-towxqf/30min')
  .replace(/^https?:\/\/cal\.com\//, '')
  .replace(/^\/|\/$/g, '');

interface Props {
  eyebrow?: string;
  title?: string;
  intro?: string;
  tone?: 'paper' | 'alt';
}

// Inline Cal.com scheduler. A plain iframe keeps it dependency-free and lazy.
export function CalBooking({
  eyebrow = 'Book a call',
  title = 'Prefer to talk it through?',
  intro = 'Pick a time that suits you for a free 30-minute strategy call.',
  tone = 'paper',
}: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Section tone={tone} id="book">
      <Container>
        <SectionHeader eyebrow={eyebrow} title={title} intro={intro} />
        {CAL_LINK ? (
          <div className="cal-embed" data-loaded={loaded || undefined}>
            {!loaded && <p className="cal-embed__loading muted">Loading calendar...</p>}
            <iframe
              title="Book a call with Yukti Digital Solutions"
              src={`https://cal.com/${CAL_LINK}?embed=true&layout=month_view`}
              loading="lazy"
              allow="payment"
              onLoad={() => setLoaded(true)}
            />
          </div>
        ) : (
          <p className="muted">
            Email <a href={`mailto:${siteSettings.email}`}>{siteSettings.email}</a> to book a call.
          </p>
        )}
        {CAL_LINK && (
          <p className="muted cal-embed__fallback">
            Calendar not loading?{' '}
            <a href={`https://cal.com/${CAL_LINK}`} target="_blank" rel="noopener noreferrer">
              Open the booking page
            </a>
            .
          </p>
        )}
      </Container>
    </Section>
  );
}
