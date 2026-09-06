import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { Service } from '@yukti/types';
import { Section, Container, Button } from '@yukti/ui';
import { fetchData } from '../lib/api.js';
import { Seo } from '../lib/Seo.js';
import { Breadcrumb } from '../components/Breadcrumb.js';
import { QueryState } from '../components/QueryState.js';

export default function ServiceDetail() {
  const { slug = '' } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['service', slug],
    queryFn: () => fetchData<Service>(`/services/${slug}`),
  });

  return (
    <Section className="page-hero" tone="paper">
      <Container>
        <QueryState isLoading={isLoading} isError={isError} isEmpty={!data}>
          {data && (
            <>
              <Seo
                title={data.seoTitle || data.title}
                description={data.shortDescription}
                path={`/services/${data.slug}`}
                jsonLd={{
                  '@context': 'https://schema.org',
                  '@type': 'Service',
                  name: data.title,
                  description: data.shortDescription,
                  provider: { '@type': 'Organization', name: 'Yukti Digital Solutions' },
                }}
              />
              <Breadcrumb
                items={[
                  { label: 'Home', href: '/' },
                  { label: 'Services', href: '/services' },
                  { label: data.title },
                ]}
              />
              <h1>{data.title}</h1>
              <p className="lead">{data.shortDescription}</p>
              <div className="prose" style={{ marginTop: 'var(--space-8)' }}>
                {data.description.split('\n').map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <div style={{ marginTop: 'var(--space-8)' }}>
                <Button as="a" href="/free-growth-audit">
                  Get Your Free Growth Audit
                </Button>
              </div>
            </>
          )}
        </QueryState>
      </Container>
    </Section>
  );
}
