import { Section, Container } from '@yukti/ui';
import { Seo } from '../lib/Seo.js';
import { SectionHeader } from '../components/SectionHeader.js';
import { ProjectCard } from '../components/Cards.js';
import { QueryState } from '../components/QueryState.js';
import { useProjects } from '../lib/queries.js';

export default function Work() {
  const { data, isLoading, isError } = useProjects();
  return (
    <>
      <Seo title="Work" description="Selected projects and outcomes for brands we partner with." path="/work" />
      <Section className="page-hero" tone="paper">
        <Container>
          <SectionHeader as="h1" eyebrow="Work" title="Built to create impact." />
        </Container>
      </Section>
      <Section tone="alt">
        <Container>
          <QueryState
            isLoading={isLoading}
            isError={isError}
            isEmpty={!data?.length}
            emptyMessage="Projects will be published here soon."
          >
            <div className="grid grid-3">
              {data?.map((p) => <ProjectCard key={p.id} project={p} />)}
            </div>
          </QueryState>
        </Container>
      </Section>
    </>
  );
}
