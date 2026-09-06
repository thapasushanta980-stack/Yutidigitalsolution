import { Section, Container } from '@yukti/ui';
import { Seo } from '../lib/Seo.js';

const CONTENT = {
  privacy: {
    title: 'Privacy Policy',
    body: [
      'This placeholder privacy policy describes how Yukti Digital Solutions handles information submitted through this website. Replace this copy with your reviewed legal text before launch.',
      'We collect the information you provide via our forms (such as name, email, and website) solely to respond to your enquiry. We do not sell your data.',
      'For any privacy questions, contact us using the details on our contact page.',
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    body: [
      'These placeholder terms govern your use of the Yukti Digital Solutions website. Replace this copy with your reviewed legal text before launch.',
      'Content on this site is provided for general information. Engagements are governed by separate signed agreements.',
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
