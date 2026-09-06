import { Section, Container } from '@yukti/ui';
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
        title="Case Studies"
        description="Measurable outcomes for the brands we work with."
        path="/case-studies"
      />
      <Section className="page-hero" tone="paper">
        <Container>
          <SectionHeader
            as="h1"
            eyebrow="Case Studies"
            title="The Proof Is in the Numbers."
            intro="Every engagement starts with numbers and ends with numbers."
          />
        </Container>
      </Section>
      <Section tone="alt">
        <Container>
          <QueryState
            isLoading={isLoading}
            isError={isError}
            isEmpty={!data?.length}
            emptyMessage="Case studies will be published here soon."
          >
            <div className="grid grid-3">
              {data?.map((c) => <CaseStudyCard key={c.id} item={c} />)}
            </div>
          </QueryState>
        </Container>
      </Section>
    </>
  );
}
