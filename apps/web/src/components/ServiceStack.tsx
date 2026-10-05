import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { Service } from '@yukti/types';
import { gsap } from '../lib/motion.js';
import { ServiceArt, artKind } from './ServiceArt.js';

// Apple-style stacking cards: each card sticks under the nav while the next one
// slides up over it. As a card is covered it scales back and dims, so the stack
// reads as a deck. On small screens and with reduced motion it is a plain list.
export function ServiceStack({ services }: { services: Service[] }) {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference) and (min-width: 768px)', () => {
      const items = gsap.utils.toArray<HTMLElement>('.stack__item', el);
      items.forEach((item, i) => {
        const next = items[i + 1];
        const card = item.querySelector<HTMLElement>('.stack__card');
        if (!card) return;

        // Entrance: the card rises into place as the deck scrolls in.
        // (Applied to the wrapper so it never competes with the card's scrubbed scale.)
        gsap.from(item, {
          y: 80,
          opacity: 0,
          duration: 1,
          scrollTrigger: { trigger: item, start: 'top 90%', once: true },
        });

        // Recede: scale back and dim while the next card covers this one.
        if (next) {
          gsap.to(card, {
            scale: 0.93,
            '--dim': 0.6,
            ease: 'none',
            scrollTrigger: { trigger: next, start: 'top 85%', end: 'top 20%', scrub: true },
          });
        }

        // Slow parallax drift on the numeral.
        const numeral = card.querySelector('.stack__art');
        if (numeral) {
          gsap.fromTo(
            numeral,
            { yPercent: 12 },
            {
              yPercent: -12,
              ease: 'none',
              scrollTrigger: { trigger: item, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          );
        }
      });
    });
    return () => mm.revert();
  }, [services.length]);

  return (
    <div className="stack" ref={root}>
      {services.map((s, i) => (
        <div key={s.id} className="stack__item" style={{ ['--i' as string]: i }}>
          <Link to={`/services/${s.slug}`} className="stack__card">
            <div className="stack__copy">
              <span className="stack__index">
                {String(i + 1).padStart(2, '0')} / {String(services.length).padStart(2, '0')}
              </span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.shortDescription}</p>
              </div>
              <span className="stack__more">
                Explore <ArrowUpRight size={18} aria-hidden="true" />
              </span>
            </div>
            <div className="stack__visual" aria-hidden="true">
              <span className="stack__badge">{String(i + 1).padStart(2, '0')}</span>
              <div className="stack__art">
                {artKind(s.slug, s.title) ? (
                  <ServiceArt kind={artKind(s.slug, s.title)!} />
                ) : (
                  <span className="stack__numeral">{String(i + 1).padStart(2, '0')}</span>
                )}
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
