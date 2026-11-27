import { Plus } from 'lucide-react';
import { Section, Container } from '@yukti/ui';
import { faqs } from '../lib/siteContent.js';
import { SectionHeader } from './SectionHeader.js';

/** FAQPage structured data for the same questions, for the page's <Seo jsonLd>. */
export function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

// Common questions, each a native <details> so it opens without JavaScript
// and the answers stay in the page for search engines.
export function Faq() {
  return (
    <Section tone="paper" id="answers">
      <Container>
        <div className="faq">
          <SectionHeader
            eyebrow="Answers"
            title="Questions we get asked."
            intro="Quick answers about Yukti Digital Solutions and how we work."
          />
          <div className="faq__list">
            {faqs.map(({ q, a }, i) => (
              <details key={q} className="faq__item" open={i === 0}>
                <summary>
                  <h3>{q}</h3>
                  <Plus size={20} aria-hidden="true" />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
