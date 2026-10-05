import type { ApiResponse } from '@yukti/types';
import * as data from './staticData.js';

// Static build: content is served from ./staticData.ts instead of the API.
// Keep content reads behind this adapter for a future CMS integration.

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
      if (slug) throw new Error('Not found');
      return { data: data.insights, meta: { page: 1, pageSize: 9, total: 0, totalPages: 1 } };
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
