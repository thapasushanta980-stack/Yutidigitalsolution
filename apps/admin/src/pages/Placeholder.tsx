import { useQuery } from '@tanstack/react-query';
import { get } from '../lib/api.js';

// Read-only listing scaffold for CMS modules that reuse the same admin API
// shape as ServicesCms. Full edit forms follow the ServicesCms pattern.
export function Placeholder({ title, endpoint }: { title: string; endpoint: string }) {
  const listUrl = endpoint === 'settings' ? '/admin/settings' : `/admin/${endpoint}`;
  const { data, isLoading, isError } = useQuery({
    queryKey: ['cms', endpoint],
    queryFn: () => get<unknown>(listUrl),
  });

  const rows = Array.isArray(data) ? (data as Record<string, unknown>[]) : [];

  return (
    <div>
      <h1>{title}</h1>
      <p className="muted">
        Connected to <code>{listUrl}</code>. This module reuses the same admin CRUD API as Services —
        add a full edit form by following <code>ServicesCms.tsx</code>.
      </p>
      {isError && <p className="yk-field__error">Failed to load.</p>}
      {isLoading && <p>Loading…</p>}
      {!isLoading && !isError && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={2}>No records yet.</td>
                </tr>
              )}
              {rows.map((r, i) => (
                <tr key={(r.id as string) ?? i}>
                  <td className="muted">{(r.id as string) ?? '—'}</td>
                  <td>{(r.title as string) || (r.name as string) || (r.label as string) || JSON.stringify(r).slice(0, 80)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
