import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { InsightCard } from '../components/Cards.js';
import { fetchData } from '../lib/api.js';
import { insights } from '../lib/staticData.js';
import type { InsightSummary } from '../lib/queries.js';

describe('blog', () => {
  it('serves posts by slug and filters by category', async () => {
    const post = await fetchData<InsightSummary>(`/insights/${insights[0].slug}`);
    expect(post.title).toBe(insights[0].title);
    const seo = await fetchData<InsightSummary[]>('/insights', { category: 'seo' });
    expect(seo.every((p) => p.category?.slug === 'seo')).toBe(true);
    await expect(fetchData('/insights/missing-post')).rejects.toThrow();
  });

  it('renders a card with category, excerpt and a link to the post, without a date', () => {
    render(<MemoryRouter><InsightCard item={insights[0]} /></MemoryRouter>);
    expect(screen.getByRole('link')).toHaveAttribute('href', `/blog/${insights[0].slug}`);
    expect(screen.getByText(insights[0].category.name)).toBeInTheDocument();
    expect(screen.queryByText(/2026/)).not.toBeInTheDocument();
    expect(screen.getByText(insights[0].excerpt)).toBeInTheDocument();
  });
});
