import {pageCopies} from '../lib/pageContent.js';
const pageCopy=pageCopies['case-study-detail'];
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Section, Container, Button } from '@yukti/ui';
import { fetchData } from '../lib/api.js';
import { Seo } from '../lib/Seo.js';
import { Breadcrumb } from '../components/Breadcrumb.js';
import { QueryState } from '../components/QueryState.js';

interface CaseStudyDetailData {
  title: string;
  slug: string;
  client: string | null;
  industry: string | null;
  challenge: string;
  strategy: string | null;
  implementation: string | null;
  results: string | null;
  coverImage: string | null;
  metrics: { id: string; label: string; value: string }[];
  testimonials: { id: string; clientName: string; company: string | null; quote: string }[];
}

export default function CaseStudyDetail() {
  const { slug = '' } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['case-study', slug],
    queryFn: () => fetchData<CaseStudyDetailData>(`/case-studies/${slug}`),
  });

  return (
    <QueryState isLoading={isLoading} isError={isError} isEmpty={!data}>
      {data && (
        <>
          <Seo
            title={data.title}
            description={data.challenge.slice(0, 160)}
            path={`/case-studies/${data.slug}`}
            image={data.coverImage ?? undefined}
          />
          <Section className="page-hero" tone="paper">
            <Container>
              <Breadcrumb
                items={[
                  { label: 'Home', href: '/' },
                  { label: 'Case Studies', href: '/case-studies' },
                  { label: data.title },
                ]}
              />
              <h1>{data.title}</h1>
              <p className="lead">{[data.client, data.industry].filter(Boolean).join(' · ')}</p>
            </Container>
          </Section>

          {data.metrics.length > 0 && (
            <Section tone="ink">
              <Container>
                <div className="metrics">
                  {data.metrics.map((m) => (
                    <div key={m.id} className="metric">
                      <p className="metric__value">{m.value}</p>
                      <p className="metric__label">{m.label}</p>
                    </div>
                  ))}
                </div>
              </Container>
            </Section>
          )}

          <Section tone="alt">
            <Container>
              <div className="prose">
                <h2>{pageCopy.field1}</h2>
                <p>{data.challenge}</p>
                {data.strategy && (
                  <>
                    <h2>{pageCopy.field2}</h2>
                    <p>{data.strategy}</p>
                  </>
                )}
                {data.implementation && (
                  <>
                    <h2>{pageCopy.field3}</h2>
                    <p>{data.implementation}</p>
                  </>
                )}
                {data.results && (
                  <>
                    <h2>{pageCopy.field4}</h2>
                    <p>{data.results}</p>
                  </>
                )}
              </div>
            </Container>
          </Section>

          {data.testimonials.length > 0 && (
            <Section tone="paper">
              <Container>
                {data.testimonials.map((t) => (
                  <blockquote key={t.id} className="testimonial">
                    <p>{pageCopy.field5}{t.quote}{pageCopy.field6}</p>
                    <cite>
                      <strong>{t.clientName}</strong>
                      {t.company && <span className="muted"> {pageCopy.field7}{t.company}</span>}
                    </cite>
                  </blockquote>
                ))}
              </Container>
            </Section>
          )}

          <Section tone="ink">
            <Container>
              <Button as="a" href="/free-growth-audit" size="lg">
                {pageCopy.field8}</Button>
            </Container>
          </Section>
        </>
      )}
    </QueryState>
  );
}
