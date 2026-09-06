import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Section, Container } from '@yukti/ui';
import type { ApiResponse, PaginationMeta } from '@yukti/types';
import { api } from '../lib/api.js';
import { Seo } from '../lib/Seo.js';
import { SectionHeader } from '../components/SectionHeader.js';
import { InsightCard } from '../components/Cards.js';
import { QueryState } from '../components/QueryState.js';
import { fetchData } from '../lib/api.js';
import type { InsightSummary } from '../lib/queries.js';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function Insights() {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  const { data: categories } = useQuery({
    queryKey: ['insight-categories'],
    queryFn: () => fetchData<Category[]>('/insights/categories'),
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['insights', { q, category, page }],
    queryFn: async () => {
      const res = await api.get<ApiResponse<InsightSummary[]>>('/insights', {
        params: { q: q || undefined, category: category || undefined, page, pageSize: 9 },
      });
      if (!res.data.success) throw new Error(res.data.error.message);
      return { items: res.data.data, meta: res.data.meta as PaginationMeta };
    },
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <Seo
        title="Insights"
        description="Perspectives on SEO, performance marketing, and digital growth."
        path="/insights"
      />
      <Section className="page-hero" tone="paper">
        <Container>
          <SectionHeader as="h1" eyebrow="Insights" title="Ideas that drive growth." />
          <input
            type="search"
            className="yk-input"
            placeholder="Search insights…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            aria-label="Search insights"
            style={{ maxWidth: 420 }}
          />
        </Container>
      </Section>
      <Section tone="alt">
        <Container>
          <div className="filters" role="group" aria-label="Filter by category">
            <button className={!category ? 'is-active' : ''} onClick={() => { setCategory(''); setPage(1); }}>
              All
            </button>
            {categories?.map((c) => (
              <button
                key={c.id}
                className={category === c.slug ? 'is-active' : ''}
                onClick={() => { setCategory(c.slug); setPage(1); }}
              >
                {c.name}
              </button>
            ))}
          </div>

          <QueryState
            isLoading={isLoading}
            isError={isError}
            isEmpty={!data?.items.length}
            emptyMessage="No articles found."
          >
            <div className="grid grid-3">
              {data?.items.map((i) => <InsightCard key={i.id} item={i} />)}
            </div>
          </QueryState>

          {data?.meta && data.meta.totalPages > 1 && (
            <div className="pagination">
              <button
                className="yk-btn yk-btn--secondary yk-btn--sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span className="fig-label">
                Page {data.meta.page} of {data.meta.totalPages}
              </span>
              <button
                className="yk-btn yk-btn--secondary yk-btn--sm"
                disabled={page >= data.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
