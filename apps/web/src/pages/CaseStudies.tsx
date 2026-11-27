import {pageCopies} from '../lib/pageContent.js';
const pageCopy=pageCopies['case-studies'];
import { Section, Container } from '@yukti/ui';
import { Stagger } from '../components/Stagger.js';
import { Seo } from '../lib/Seo.js';
import { SectionHeader } from '../components/SectionHeader.js';
import { CaseStudyCard } from '../components/Cards.js';
import { QueryState } from '../components/QueryState.js';
import { useCaseStudies } from '../lib/queries.js';

export default function CaseStudies() {
  const { data, isLoading, isError } = useCaseStudies();
  return (
    <>
      <Seo
        title={pageCopy.field1}
        description={pageCopy.field2}
        path="/case-studies"
        noindex={!data?.length}
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
          <QueryState
            isLoading={isLoading}
            isError={isError}
            isEmpty={!data?.length}
            emptyMessage={pageCopy.field6}
          >
            <Stagger className="grid grid-3">
              {data?.map((c) => <CaseStudyCard key={c.id} item={c} />)}
            </Stagger>
          </QueryState>
        </Container>
      </Section>
    </>
  );
}
