import { Star } from 'lucide-react';
import { Section, Container } from '@yukti/ui';
import { useTestimonials, type Testimonial } from '../lib/queries.js';
import { SectionHeader } from './SectionHeader.js';
import { Stagger } from './Stagger.js';

// Stand-ins so the layout can be reviewed locally. They are never shown in a
// production build: until real reviews are added to staticData.testimonials
// the whole section is hidden.
const PLACEHOLDERS: Testimonial[] = [1, 2, 3].map((n) => ({
  id: `placeholder-${n}`,
  clientName: 'Client name',
  clientRole: 'Role',
  company: 'Company',
  quote: 'Placeholder review. Replace with a genuine review from a client, used with their permission.',
  rating: null,
  photo: null,
}));

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

function TestimonialCard({ t, placeholder }: { t: Testimonial; placeholder: boolean }) {
  return (
    <figure className="card testimonial-card">
      {placeholder && <span className="testimonial-card__tag">Placeholder</span>}
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

export function Testimonials() {
  const { data } = useTestimonials();
  const real = data ?? [];
  const placeholder = real.length === 0 && import.meta.env.DEV;
  const items = placeholder ? PLACEHOLDERS : real;
  if (!items.length) return null;

  return (
    <Section tone="alt">
      <Container>
        <SectionHeader eyebrow="Testimonials" title="What our clients say." />
        <Stagger className="grid grid-3">
          {items.map((t) => (
            <TestimonialCard key={t.id} t={t} placeholder={placeholder} />
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}
