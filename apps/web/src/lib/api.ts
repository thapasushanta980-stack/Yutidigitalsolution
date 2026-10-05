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

// No backend: inquiries are emailed through FormSubmit (formsubmit.co) to the
// agency inbox. Override the recipient with VITE_INQUIRY_EMAIL at build time.
const INQUIRY_EMAIL = (import.meta.env.VITE_INQUIRY_EMAIL as string | undefined) ?? 'lukeb3968@gmail.com';

const LABELS: Record<string, string> = {
  name: 'Name',
  company: 'Company',
  email: 'Email',
  phone: 'Phone',
  website: 'Website',
  industry: 'Industry',
  budget: 'Monthly budget',
  challenge: 'Primary challenge',
  services: 'Services interested in',
  subject: 'Subject',
  message: 'Message',
};

export async function postData<T>(url: string, body: unknown): Promise<T> {
  const input = (body ?? {}) as Record<string, unknown>;
  const isAudit = url.includes('leads');

  // Human-readable, ordered fields only (the honeypot is never sent).
  const fields: Record<string, string> = {};
  for (const [key, label] of Object.entries(LABELS)) {
    const v = input[key];
    const text = Array.isArray(v) ? v.join(', ') : v == null ? '' : String(v).trim();
    if (text) fields[label] = text;
  }

  const payload = {
    ...fields,
    _subject: isAudit
      ? `New Free Growth Audit request - ${input.name ?? 'website visitor'}`
      : `New website enquiry - ${input.name ?? 'website visitor'}`,
    _replyto: input.email ?? '',
    _template: 'table',
    _captcha: 'false',
  };

  let res: Response;
  try {
    res = await fetch(`https://formsubmit.co/ajax/${INQUIRY_EMAIL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('We could not send your message. Check your connection and try again.');
  }

  const result = (await res.json().catch(() => null)) as { success?: string | boolean; message?: string } | null;
  if (!res.ok || !(result?.success === true || result?.success === 'true')) {
    throw new Error(result?.message || 'We could not send your message. Please email us directly.');
  }
  return result as T;
}
