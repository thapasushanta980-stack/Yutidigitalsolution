import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Section, Container, Button } from '@yukti/ui';
import { fetchData } from '../lib/api.js';
import { Seo } from '../lib/Seo.js';
import { Breadcrumb } from '../components/Breadcrumb.js';
import { QueryState } from '../components/QueryState.js';
import { ProjectCard } from '../components/Cards.js';
import type { ProjectSummary } from '../lib/queries.js';

interface ProjectDetail extends ProjectSummary {
  description: string;
  challenge: string | null;
  solution: string | null;
  result: string | null;
  images: { id: string; url: string; altText: string | null }[];
  related: ProjectSummary[];
}

export default function WorkDetail() {
  const { slug = '' } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['project', slug],
    queryFn: () => fetchData<ProjectDetail>(`/projects/${slug}`),
  });

  return (
    <QueryState isLoading={isLoading} isError={isError} isEmpty={!data}>
      {data && (
        <>
          <Seo
            title={data.title}
            description={data.description.slice(0, 160)}
            path={`/work/${data.slug}`}
            image={data.coverImage ?? undefined}
          />
          <Section className="page-hero" tone="paper">
            <Container>
              <Breadcrumb
                items={[{ label: 'Home', href: '/' }, { label: 'Work', href: '/work' }, { label: data.title }]}
              />
              <h1>{data.title}</h1>
              <p className="lead">
                {[data.client?.name, data.industry, data.service].filter(Boolean).join(' · ')}
              </p>
            </Container>
          </Section>

          {data.coverImage && (
            <Container>
              <img src={data.coverImage} alt={data.title} className="map-embed" style={{ width: '100%' }} />
            </Container>
          )}

          <Section tone="alt">
            <Container>
              <div className="prose">
                <p>{data.description}</p>
                {data.challenge && (
                  <>
                    <h2>Challenge</h2>
                    <p>{data.challenge}</p>
                  </>
                )}
                {data.solution && (
                  <>
                    <h2>Approach</h2>
                    <p>{data.solution}</p>
                  </>
                )}
                {data.result && (
                  <>
                    <h2>Results</h2>
                    <p>{data.result}</p>
                  </>
                )}
              </div>
            </Container>
          </Section>

          {data.related?.length > 0 && (
            <Section tone="paper">
              <Container>
                <h2>Related work</h2>
                <div className="grid grid-3">
                  {data.related.map((p) => <ProjectCard key={p.id} project={p} />)}
                </div>
              </Container>
            </Section>
          )}

          <Section tone="ink">
            <Container>
              <Button as="a" href="/free-growth-audit" size="lg">
                Start your growth audit
              </Button>
            </Container>
          </Section>
        </>
      )}
    </QueryState>
  );
}
