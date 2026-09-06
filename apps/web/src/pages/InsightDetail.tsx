import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Section, Container } from '@yukti/ui';
import { fetchData } from '../lib/api.js';
import { Seo } from '../lib/Seo.js';
import { Breadcrumb } from '../components/Breadcrumb.js';
import { QueryState } from '../components/QueryState.js';
import { InsightCard } from '../components/Cards.js';
import type { InsightSummary } from '../lib/queries.js';

interface InsightDetailData extends InsightSummary {
  content: string;
  canonicalUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: string;
  related: InsightSummary[];
}

export default function InsightDetail() {
  const { slug = '' } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['insight', slug],
    queryFn: () => fetchData<InsightDetailData>(`/insights/${slug}`),
  });

  return (
    <QueryState isLoading={isLoading} isError={isError} isEmpty={!data}>
      {data && (
        <>
          <Seo
            title={data.seoTitle || data.title}
            description={data.seoDescription || data.excerpt}
            path={`/insights/${data.slug}`}
            type="article"
            image={data.coverImage ?? undefined}
            jsonLd={{
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: data.title,
              description: data.excerpt,
              author: { '@type': 'Person', name: data.author },
              datePublished: data.publishedAt,
              dateModified: data.updatedAt,
              publisher: { '@type': 'Organization', name: 'Yukti Digital Solutions' },
            }}
          />
          <Section className="page-hero" tone="paper">
            <Container>
              <Breadcrumb
                items={[
                  { label: 'Home', href: '/' },
                  { label: 'Insights', href: '/insights' },
                  { label: data.title },
                ]}
              />
              {data.category && <p className="fig-label">{data.category.name}</p>}
              <h1>{data.title}</h1>
              <p className="fig-label">
                {data.author} ·{' '}
                {data.publishedAt ? new Date(data.publishedAt).toLocaleDateString() : ''} ·{' '}
                {data.readingMinutes} min read
              </p>
            </Container>
          </Section>

          {data.coverImage && (
            <Container>
              <img src={data.coverImage} alt={data.title} style={{ width: '100%', borderRadius: 4 }} />
            </Container>
          )}

          <Section tone="paper">
            <Container>
              <article className="prose">
                {data.content.split('\n').filter(Boolean).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </article>
            </Container>
          </Section>

          {data.related?.length > 0 && (
            <Section tone="alt">
              <Container>
                <h2>Related reading</h2>
                <div className="grid grid-3">
                  {data.related.map((r) => <InsightCard key={r.id} item={r} />)}
                </div>
              </Container>
            </Section>
          )}
        </>
      )}
    </QueryState>
  );
}
