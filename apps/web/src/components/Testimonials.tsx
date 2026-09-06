import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTestimonials } from '../lib/queries.js';

// One testimonial at a time, manual navigation only (no auto-advance).
export function Testimonials() {
  const { data } = useTestimonials();
  const [i, setI] = useState(0);
  if (!data || data.length === 0) return null;

  const t = data[i];
  const go = (dir: number) => setI((prev) => (prev + dir + data.length) % data.length);

  return (
    <div className="testimonial">
      <blockquote>
        <p>“{t.quote}”</p>
        <cite>
          <strong>{t.clientName}</strong>
          {(t.clientRole || t.company) && (
            <span className="muted">
              {' '}
              — {[t.clientRole, t.company].filter(Boolean).join(', ')}
            </span>
          )}
        </cite>
      </blockquote>
      {data.length > 1 && (
        <div className="testimonial__nav">
          <button aria-label="Previous testimonial" onClick={() => go(-1)} className="nav__icon">
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <span className="fig-label" aria-live="polite">
            {i + 1} / {data.length}
          </span>
          <button aria-label="Next testimonial" onClick={() => go(1)} className="nav__icon">
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
