import type { ApiResponse } from '@yukti/types';
import * as data from './staticData.js';

// Static build: content is served from ./staticData.ts instead of the API.
// The same fetchData/postData signatures are kept so pages need no changes
// and the CMS-backed API can be re-enabled later.

function resolve(url: string, params: Record<string, unknown> = {}): { data: unknown; meta?: unknown } {
  const path = url.replace(/^\/+/, '');
  const [root, slug] = path.split('/');
  switch (root) {
    case 'site-settings':
      return { data: data.siteSettings };
    case 'services':
      if (slug) {
        const s = data.services.find((x) => x.slug === slug);
        if (!s) throw new Error('Not found');
        return { data: s };
      }
      return { data: data.services };
    case 'metrics':
      return { data: data.metrics };
    case 'clients':
      return { data: data.clients };
    case 'testimonials':
      return { data: data.testimonials };
    case 'projects':
      if (slug) throw new Error('Not found');
      return { data: data.projects };
    case 'case-studies':
      if (slug) throw new Error('Not found');
      return { data: data.caseStudies };
    case 'team':
      return { data: slug === 'values' ? data.values : data.team };
    case 'insights':
      if (slug === 'categories') return { data: data.insightCategories };
      if (slug) {
        const post = data.insights.find((p) => p.slug === slug);
        if (!post) throw new Error('Not found');
        const related = data.insights.filter((p) => p.slug !== slug).slice(0, 3);
        return { data: { ...post, related } };
      }
      {
        const q = String(params.q ?? '').toLowerCase();
        const category = String(params.category ?? '');
        const pageSize = Number(params.pageSize ?? 9);
        const page = Math.max(1, Number(params.page ?? 1));
        const matches = data.insights.filter(
          (p) =>
            (!category || p.category.slug === category) &&
            (!q || `${p.title} ${p.excerpt}`.toLowerCase().includes(q)),
        );
        return {
          data: matches.slice((page - 1) * pageSize, page * pageSize),
          meta: { page, pageSize, total: matches.length, totalPages: Math.max(1, Math.ceil(matches.length / pageSize)) },
        };
      }
    case 'search':
      return { data: data.search(String(params.q ?? '')) };
    default:
      throw new Error('Not found');
  }
}

// Minimal stand-in for the axios instance (pages only call .get).
export const api = {
  async get<T>(url: string, opts?: { params?: Record<string, unknown> }): Promise<{ data: T }> {
    const r = resolve(url, opts?.params);
    return { data: { success: true, data: r.data, meta: r.meta } as unknown as T };
  },
};

export async function fetchData<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await api.get<ApiResponse<T>>(url, { params });
  if (!res.data.success) throw new Error(res.data.error.message);
  return res.data.data;
}
