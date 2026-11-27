import {pageCopies} from '../lib/pageContent.js';
const pageCopy=pageCopies['blog-post'];
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Section, Container } from '@yukti/ui';
import { fetchData } from '../lib/api.js';
import { Seo } from '../lib/Seo.js';
import { Breadcrumb } from '../components/Breadcrumb.js';
import { QueryState } from '../components/QueryState.js';
import { InsightCard } from '../components/Cards.js';
import type { InsightSummary } from '../lib/queries.js';
import { siteUrl } from '../lib/siteUrl.js';
import { ServiceArt } from '../components/ServiceArt.js';

interface InsightDetailData extends InsightSummary {
  content: string;
  canonicalUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: string;
  related: InsightSummary[];
}

export default function BlogPost() {
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
            path={`/blog/${data.slug}`}
            canonicalUrl={data.canonicalUrl ?? undefined}
            type="article"
            image={data.coverImage ?? undefined}
            jsonLd={{
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: data.title,
              description: data.excerpt,
              ...(data.publishedAt ? { datePublished: data.publishedAt } : {}),
              ...(data.updatedAt ? { dateModified: data.updatedAt } : {}),
              ...(data.coverImage ? { image: siteUrl(data.coverImage) } : {}),
              mainEntityOfPage: data.canonicalUrl || siteUrl(`/blog/${data.slug}`),
              author: { '@type': 'Organization', name: data.author },
              publisher: { '@type': 'Organization', name: 'Yukti Digital Solutions' },
            }}
          />
          <Section className="page-hero" tone="paper">
            <Container>
              <Breadcrumb
                items={[
                  { label: 'Home', href: '/' },
                  { label: 'Blog', href: '/blog' },
                  { label: data.title },
                ]}
              />
              {data.category && <p className="fig-label">{data.category.name}</p>}
              <h1>{data.title}</h1>
              <p className="fig-label">
                {data.author} {pageCopy.field1}{data.readingMinutes} {pageCopy.field2}</p>
            </Container>
          </Section>

          {(data.coverImage || data.art) && (
            <Container>
              <div className="post-cover">
                {data.coverImage ? <img src={data.coverImage} alt="" /> : <ServiceArt kind={data.art!} />}
              </div>
            </Container>
          )}

          <Section tone="paper">
            <Container>
              <article className="prose">
                <PostBody content={data.content} />
              </article>
            </Container>
          </Section>

          {data.related?.length > 0 && (
            <Section tone="alt">
              <Container>
                <h2>{pageCopy.field3}</h2>
                <div className="grid grid-3 rail">
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

// Blank lines separate blocks; "## " starts a subheading and "- " a list item.
function PostBody({ content }: { content: string }) {
  return (
    <>
      {content.split(/\n\s*\n/).map((block, i) => {
        const lines = block.trim().split('\n');
        if (lines[0].startsWith('## ')) return <h2 key={i}>{lines[0].slice(3)}</h2>;
        if (lines.every((l) => l.startsWith('- '))) {
          return (
            <ul key={i}>
              {lines.map((l) => <li key={l}>{l.slice(2)}</li>)}
            </ul>
          );
        }
        return <p key={i}>{block.trim()}</p>;
      })}
    </>
  );
}
