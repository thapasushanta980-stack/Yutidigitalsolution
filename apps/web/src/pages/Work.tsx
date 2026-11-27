import {pageCopies} from '../lib/pageContent.js';
const pageCopy=pageCopies['work'];
import { Section, Container } from '@yukti/ui';
import { Stagger } from '../components/Stagger.js';
import { Seo } from '../lib/Seo.js';
import { SectionHeader } from '../components/SectionHeader.js';
import { ProjectCard } from '../components/Cards.js';
import { QueryState } from '../components/QueryState.js';
import { useProjects } from '../lib/queries.js';

export default function Work() {
  const { data, isLoading, isError } = useProjects();
  return (
    <>
      <Seo title={pageCopy.field1} description={pageCopy.field2} path="/work" noindex={!data?.length} />
      <Section className="page-hero" tone="paper">
        <Container>
          <SectionHeader as="h1" eyebrow={pageCopy.field3} title={pageCopy.field4} />
        </Container>
      </Section>
      <Section tone="alt">
        <Container>
          <QueryState
            isLoading={isLoading}
            isError={isError}
            isEmpty={!data?.length}
            emptyMessage={pageCopy.field5}
          >
            <Stagger className="grid grid-3">
              {data?.map((p) => <ProjectCard key={p.id} project={p} />)}
            </Stagger>
          </QueryState>
        </Container>
      </Section>
    </>
  );
}
