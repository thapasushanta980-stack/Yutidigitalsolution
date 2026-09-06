import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, FormField } from '@yukti/ui';
import { del, get, post, put } from '../lib/api.js';

// ── Field + column definitions ────────────────────────────
export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'checkbox'
  | 'url'
  | 'select'
  | 'tags'
  | 'metrics';

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[]; // for select
  hint?: string;
  full?: boolean; // span full width in the 2-col grid
}

export interface ColumnDef {
  key: string;
  label: string;
  badge?: boolean;
}

interface Props {
  title: string;
  endpoint: string; // e.g. "projects" → /admin/projects
  columns: ColumnDef[];
  fields: FieldDef[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emptyDraft: Record<string, any>;
}

const STATUS_OPTS = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

// Config-driven CRUD screen shared by every collection admin page.
export function ResourceCrud({ title, endpoint, columns, fields, emptyDraft }: Props) {
  const qc = useQueryClient();
  const key = ['cms', endpoint];
  const { data, isLoading, isError } = useQuery({
    queryKey: key,
    queryFn: () => get<Row[]>(`/admin/${endpoint}`),
  });

  const [draft, setDraft] = useState<Row | null>(null);
  const [error, setError] = useState('');
  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  // Convert form-friendly values back into API shapes on save.
  const serialize = (d: Row): Row => {
    const out: Row = { ...d };
    for (const f of fields) {
      if (f.type === 'tags' && typeof out[f.name] === 'string') {
        out[f.name] = (out[f.name] as string)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (f.type === 'number' && out[f.name] !== undefined && out[f.name] !== '') {
        out[f.name] = Number(out[f.name]);
      }
    }
    return out;
  };

  const saveMutation = useMutation({
    mutationFn: (d: Row) =>
      d.id ? put(`/admin/${endpoint}/${d.id}`, serialize(d)) : post(`/admin/${endpoint}`, serialize(d)),
    onSuccess: () => {
      invalidate();
      setDraft(null);
      setError('');
    },
    onError: (e) => setError(e instanceof Error ? e.message : 'Save failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => del(`/admin/${endpoint}/${id}`),
    onSuccess: invalidate,
  });

  // Prepare a row for editing (arrays → editable representations).
  const editRow = (row: Row) => {
    const d: Row = { ...row };
    for (const f of fields) {
      if (f.type === 'tags' && Array.isArray(d[f.name])) {
        // tags may arrive as [{tag:{name}}] or string[]
        d[f.name] = d[f.name]
          .map((t: unknown) =>
            typeof t === 'string' ? t : ((t as { tag?: { name?: string } })?.tag?.name ?? ''),
          )
          .filter(Boolean)
          .join(', ');
      }
      if (f.type === 'metrics' && !Array.isArray(d[f.name])) d[f.name] = [];
    }
    setDraft(d);
  };

  const setField = (name: string, value: unknown) => setDraft((prev) => ({ ...prev!, [name]: value }));

  return (
    <div>
      <div className="admin-toolbar admin-toolbar--between">
        <h1>{title}</h1>
        <Button onClick={() => setDraft({ ...emptyDraft })}>New</Button>
      </div>

      {draft && (
        <div className="admin-card">
          <h3>{draft.id ? `Edit ${title}` : `New ${title}`}</h3>
          <div className="form-grid form-grid--2">
            {fields.map((f) => (
              <div key={f.name} style={f.full || f.type === 'metrics' ? { gridColumn: '1 / -1' } : undefined}>
                <FieldInput field={f} value={draft[f.name]} onChange={(v) => setField(f.name, v)} />
              </div>
            ))}
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

      {isError && <p className="yk-field__error">Failed to load.</p>}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={columns.length + 1}>Loading…</td>
              </tr>
            )}
            {data?.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1}>No records yet.</td>
              </tr>
            )}
            {data?.map((row) => (
              <tr key={row.id}>
                {columns.map((c) => (
                  <td key={c.key}>
                    {c.badge ? (
                      <span className={`badge badge--${String(row[c.key]).toLowerCase()}`}>{row[c.key]}</span>
                    ) : typeof row[c.key] === 'boolean' ? (
                      row[c.key] ? 'Yes' : '—'
                    ) : (
                      (row[c.key] ?? '—')
                    )}
                  </td>
                ))}
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button className="link-btn" onClick={() => editRow(row)}>
                    Edit
                  </button>
                  <button
                    className="link-btn link-btn--danger"
                    onClick={() => window.confirm('Delete this record?') && deleteMutation.mutate(row.id)}
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

// ── Single field renderer ─────────────────────────────────
function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const id = `f-${field.name}`;
  if (field.type === 'checkbox') {
    return (
      <FormField label={field.label} htmlFor={id} hint={field.hint}>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input id={id} type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
          Enabled
        </label>
      </FormField>
    );
  }
  if (field.type === 'select') {
    const opts = field.options ?? STATUS_OPTS;
    return (
      <FormField label={field.label} htmlFor={id} required={field.required} hint={field.hint}>
        <select id={id} className="yk-select" value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">—</option>
          {opts.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </FormField>
    );
  }
  if (field.type === 'textarea') {
    return (
      <FormField label={field.label} htmlFor={id} required={field.required} hint={field.hint}>
        <textarea id={id} className="yk-textarea" value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} />
      </FormField>
    );
  }
  if (field.type === 'metrics') {
    const rows = (Array.isArray(value) ? value : []) as { label: string; value: string }[];
    const update = (i: number, patch: Partial<{ label: string; value: string }>) => {
      const next = rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
      onChange(next);
    };
    return (
      <FormField label={field.label} htmlFor={id} hint="Editable — never hardcoded.">
        <div style={{ display: 'grid', gap: 8 }}>
          {rows.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 8 }}>
              <input
                className="yk-input"
                placeholder="Label (e.g. Organic Traffic)"
                value={r.label}
                onChange={(e) => update(i, { label: e.target.value })}
              />
              <input
                className="yk-input"
                placeholder="Value (e.g. +42%)"
                value={r.value}
                onChange={(e) => update(i, { value: e.target.value })}
                style={{ maxWidth: 140 }}
              />
              <button type="button" className="link-btn link-btn--danger" onClick={() => onChange(rows.filter((_, idx) => idx !== i))}>
                ✕
              </button>
            </div>
          ))}
          <button type="button" className="link-btn" onClick={() => onChange([...rows, { label: '', value: '' }])}>
            + Add metric
          </button>
        </div>
      </FormField>
    );
  }
  // text | url | number | tags
  return (
    <FormField label={field.label} htmlFor={id} required={field.required} hint={field.hint ?? (field.type === 'tags' ? 'Comma-separated' : undefined)}>
      <input
        id={id}
        type={field.type === 'number' ? 'number' : field.type === 'url' ? 'url' : 'text'}
        className="yk-input"
        value={(value as string | number) ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </FormField>
  );
}
