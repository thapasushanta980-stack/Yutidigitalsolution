import {pageCopies} from '../lib/pageContent.js';
const pageCopy=pageCopies['free-growth-audit'];
import { Section, Container } from '@yukti/ui';
import { Seo } from '../lib/Seo.js';
import { SectionHeader } from '../components/SectionHeader.js';
import { CalBooking } from '../components/CalBooking.js';

export default function FreeGrowthAudit() {
  return (
    <>
      <Seo
        title={pageCopy.field1}
        description={pageCopy.field2}
        path="/free-growth-audit"
      />

      <Section className="page-hero" tone="paper">
        <Container>
          <SectionHeader
            as="h1"
            eyebrow={pageCopy.field3}
            title={pageCopy.field4}
            intro={pageCopy.field5}
          />
        </Container>
      </Section>

      <CalBooking
        eyebrow={pageCopy.field6}
        title={pageCopy.field7}
        intro={pageCopy.field8}
        tone="alt"
      />

      <Section tone="paper">
        <Container>
          <SectionHeader
            eyebrow={pageCopy.field9}
            title={pageCopy.field10}
            intro={pageCopy.field11}
          />
        </Container>
      </Section>
    </>
  );
}
