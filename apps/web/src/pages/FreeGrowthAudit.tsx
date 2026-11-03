import { Section, Container } from '@yukti/ui';
import { Seo } from '../lib/Seo.js';
import { SectionHeader } from '../components/SectionHeader.js';
import { CalBooking } from '../components/CalBooking.js';

export default function FreeGrowthAudit() {
  return (
    <>
      <Seo
        title="Free Growth Audit"
        description="Book a free 30-minute growth call with Yukti Digital Solutions and discuss practical opportunities for your business."
        path="/free-growth-audit"
      />

      <Section className="page-hero" tone="paper">
        <Container>
          <SectionHeader
            as="h1"
            eyebrow="Free Growth Audit"
            title="Find your next growth opportunity."
            intro="Book a focused 30-minute call to talk through your website, marketing, and the next steps that make sense for your business."
          />
        </Container>
      </Section>

      <CalBooking
        eyebrow="Choose a time that works for you"
        title="Reserve your free growth call"
        intro="Book directly through Cal.com. You’ll receive your confirmation and meeting details there."
        tone="alt"
      />

      <Section tone="paper">
        <Container>
          <SectionHeader
            eyebrow="Make the most of your call"
            title="Bring your biggest growth question."
            intro="We’ll use the conversation to understand your goals, look at where you are now, and identify practical opportunities to explore next."
          />
        </Container>
      </Section>
    </>
  );
}
