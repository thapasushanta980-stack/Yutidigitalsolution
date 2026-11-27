import {pageCopies} from '../lib/pageContent.js';
import { Section, Container } from '@yukti/ui';
import { Seo } from '../lib/Seo.js';

const CONTENT = {
  privacy: {
    title: pageCopies.privacy.title,
    body: [
      pageCopies.privacy.paragraph1,
      pageCopies.privacy.paragraph2,
      pageCopies.privacy.paragraph3,
    ],
  },
  terms: {
    title: pageCopies.terms.title,
    body: [
      pageCopies.terms.paragraph1,
      pageCopies.terms.paragraph2,
    ],
  },
} as const;

export default function Legal({ kind }: { kind: 'privacy' | 'terms' }) {
  const c = CONTENT[kind];
  return (
    <>
      <Seo title={c.title} path={`/${kind}`} noindex />
      <Section className="page-hero" tone="paper">
        <Container>
          <h1>{c.title}</h1>
          <div className="prose muted">
            {c.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
