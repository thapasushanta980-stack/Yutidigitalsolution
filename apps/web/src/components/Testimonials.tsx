import { Star } from 'lucide-react';
import { Section, Container } from '@yukti/ui';
import { useTestimonials, type Testimonial } from '../lib/queries.js';
import { SectionHeader } from './SectionHeader.js';
import { Stagger } from './Stagger.js';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure className="card testimonial-card">
      {t.approved === false && <span className="testimonial-card__tag">Draft · awaiting client approval</span>}
      {t.rating != null && (
        <p className="testimonial-card__rating" aria-label={`Rated ${t.rating} out of 5`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Star key={n} size={16} aria-hidden="true" className={n <= t.rating! ? 'is-filled' : ''} />
          ))}
        </p>
      )}
      <blockquote>
        <p>“{t.quote}”</p>
      </blockquote>
      <figcaption className="testimonial-card__person">
        {t.photo ? (
          <img src={t.photo} alt="" width={44} height={44} loading="lazy" />
        ) : (
          <span className="testimonial-card__avatar" aria-hidden="true">
            {initials(t.clientName)}
          </span>
        )}
        <span>
          <strong>{t.clientName}</strong>
          {(t.clientRole || t.company) && (
            <span className="muted">{[t.clientRole, t.company].filter(Boolean).join(', ')}</span>
          )}
        </span>
      </figcaption>
    </figure>
  );
}

// Drafts (approved: false) are visible in local preview only, so they can be
// reviewed in place; a production build shows approved reviews alone and hides
// the section when there are none.
export function Testimonials() {
  const { data } = useTestimonials();
  const items = (data ?? []).filter((t) => t.approved !== false || import.meta.env.DEV);
  if (!items.length) return null;

  return (
    <Section tone="alt">
      <Container>
        <SectionHeader eyebrow="Testimonials" title="What our clients say." />
        <Stagger className="grid grid-2 rail">
          {items.map((t) => (
            <TestimonialCard key={t.id} t={t} />
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}
