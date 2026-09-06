import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, FormField } from '@yukti/ui';
import type { ContentStatus, Service } from '@yukti/types';
import { del, get, post, put } from '../lib/api.js';

type Draft = Partial<Service> & { title: string; shortDescription: string; description: string };

const EMPTY: Draft = {
  title: '',
  shortDescription: '',
  description: '',
  icon: '',
  featured: false,
  displayOrder: 0,
  status: 'DRAFT',
};

export function ServicesCms() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['cms-services'], queryFn: () => get<Service[]>('/admin/services') });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState('');

  const invalidate = () => qc.invalidateQueries({ queryKey: ['cms-services'] });

  const saveMutation = useMutation({
    mutationFn: (d: Draft) =>
      d.id ? put<Service>(`/admin/services/${d.id}`, d) : post<Service>('/admin/services', d),
    onSuccess: () => {
      invalidate();
      setDraft(null);
      setError('');
    },
    onError: (e) => setError(e instanceof Error ? e.message : 'Save failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => del(`/admin/services/${id}`),
    onSuccess: invalidate,
  });

  return (
    <div>
      <div className="admin-toolbar admin-toolbar--between">
        <h1>Services</h1>
        <Button onClick={() => setDraft({ ...EMPTY })}>New service</Button>
      </div>

      {draft && (
        <div className="admin-card">
          <h3>{draft.id ? 'Edit service' : 'New service'}</h3>
          <FormField label="Title" htmlFor="s-title" required>
            <input
              id="s-title"
              className="yk-input"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </FormField>
          <FormField label="Short description" htmlFor="s-short" required>
            <input
              id="s-short"
              className="yk-input"
              value={draft.shortDescription}
              onChange={(e) => setDraft({ ...draft, shortDescription: e.target.value })}
            />
          </FormField>
          <FormField label="Description" htmlFor="s-desc" required>
            <textarea
              id="s-desc"
              className="yk-textarea"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </FormField>
          <div className="form-grid form-grid--2">
            <FormField label="Icon (lucide name)" htmlFor="s-icon">
              <input
                id="s-icon"
                className="yk-input"
                value={draft.icon ?? ''}
                onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
              />
            </FormField>
            <FormField label="Display order" htmlFor="s-order">
              <input
                id="s-order"
                type="number"
                className="yk-input"
                value={draft.displayOrder ?? 0}
                onChange={(e) => setDraft({ ...draft, displayOrder: Number(e.target.value) })}
              />
            </FormField>
            <FormField label="Status" htmlFor="s-status">
              <select
                id="s-status"
                className="yk-select"
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value as ContentStatus })}
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </FormField>
            <FormField label="Featured" htmlFor="s-featured">
              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  id="s-featured"
                  type="checkbox"
                  checked={!!draft.featured}
                  onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
                />
                Show on homepage
              </label>
            </FormField>
          </div>
          {error && <p className="yk-field__error">{error}</p>}
          <div style={{ display: 'flex', gap: 12 }}>
            <Button onClick={() => saveMutation.mutate(draft)} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving…' : 'Save'}
            </Button>
            <Button variant="secondary" onClick={() => setDraft(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Featured</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5}>Loading…</td>
              </tr>
            )}
            {data?.map((s) => (
              <tr key={s.id}>
                <td>{s.title}</td>
                <td className="muted">{s.slug}</td>
                <td>
                  <span className={`badge badge--${s.status.toLowerCase()}`}>{s.status}</span>
                </td>
                <td>{s.featured ? 'Yes' : '—'}</td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button className="link-btn" onClick={() => setDraft({ ...s })}>
                    Edit
                  </button>
                  <button
                    className="link-btn link-btn--danger"
                    onClick={() => window.confirm(`Delete "${s.title}"?`) && deleteMutation.mutate(s.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
