import {pageCopies} from '../lib/pageContent.js';
const pageCopy=pageCopies['services'];
import { Section, Container } from '@yukti/ui';
import { Stagger } from '../components/Stagger.js';
import { Seo } from '../lib/Seo.js';
import { SectionHeader } from '../components/SectionHeader.js';
import { CalBooking } from '../components/CalBooking.js';
import { ServiceCard } from '../components/Cards.js';
import { QueryState } from '../components/QueryState.js';
import { useServices } from '../lib/queries.js';

export default function Services() {
  const { data, isLoading, isError } = useServices();
  return (
    <>
      <Seo
        title={pageCopy.field1}
        description={pageCopy.field2}
        path="/services"
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
      <Section tone="alt">
        <Container>
          <QueryState isLoading={isLoading} isError={isError} isEmpty={!data?.length}>
            <Stagger className="grid grid-3">
              {data?.map((s) => <ServiceCard key={s.id} service={s} />)}
            </Stagger>
          </QueryState>
        </Container>
      </Section>
      <CalBooking
        title={pageCopy.field6}
        intro={pageCopy.field7}
      />
    </>
  );
}
