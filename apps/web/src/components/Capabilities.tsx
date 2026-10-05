import { Container } from '@yukti/ui';
import { Stagger } from './Stagger.js';

// How Yukti works, in four beats. Replaces the old one-line "Strategy + Creative…"
// strip: each pillar gets a number, a name and a plain-language promise so the
// first scroll answers "what do these people actually do?".
const PILLARS = [
  { title: 'Strategy', text: 'Research, positioning and a plan tied to revenue, not impressions.' },
  { title: 'Creative', text: 'Brand, design and video that make the offer impossible to scroll past.' },
  { title: 'Technology', text: 'Fast, search-ready websites and tracking you can trust.' },
  { title: 'Performance', text: 'Meta ads and SEO measured against cost per enquiry and sales.' },
];

export function Capabilities() {
  return (
    <section className="capabilities" aria-labelledby="capabilities-title">
      <Container>
        <h2 id="capabilities-title" className="yk-sr-only">
          How we work
        </h2>
        <Stagger className="capabilities__grid">
          {PILLARS.map((p, i) => (
            <article key={p.title} className="capability">
              <span className="capability__no">{String(i + 1).padStart(2, '0')}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </article>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
