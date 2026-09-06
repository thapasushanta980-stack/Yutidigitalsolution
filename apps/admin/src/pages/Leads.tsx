import { useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ApiResponse, LeadStatus, PaginationMeta } from '@yukti/types';
import { api } from '../lib/api.js';

interface LeadRow {
  id: string;
  name: string;
  email: string;
  company: string | null;
  website: string | null;
  status: LeadStatus;
  createdAt: string;
}

const STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'];

export function Leads() {
  const [status, setStatus] = useState<string>('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-leads', { status, q, page }],
    queryFn: async () => {
      const res = await api.get<ApiResponse<LeadRow[]>>('/admin/leads', {
        params: { status: status || undefined, q: q || undefined, page, pageSize: 20 },
      });
      if (!res.data.success) throw new Error(res.data.error.message);
      return { items: res.data.data, meta: res.data.meta as PaginationMeta };
    },
    placeholderData: keepPreviousData,
  });

  return (
    <div>
      <h1>Leads</h1>
      <div className="admin-toolbar">
        <input
          className="yk-input"
          placeholder="Search name, email, company…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          style={{ maxWidth: 320 }}
        />
        <select
          className="yk-select"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          style={{ maxWidth: 200 }}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Email</th>
              <th>Status</th>
              <th>Received</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5}>Loading…</td>
              </tr>
            )}
            {data?.items.length === 0 && (
              <tr>
                <td colSpan={5}>No leads found.</td>
              </tr>
            )}
            {data?.items.map((l) => (
              <tr key={l.id}>
                <td>
                  <Link to={`/leads/${l.id}`}>{l.name}</Link>
                </td>
                <td>{l.company ?? '—'}</td>
                <td>{l.email}</td>
                <td>
                  <span className={`badge badge--${l.status.toLowerCase()}`}>{l.status}</span>
                </td>
                <td>{new Date(l.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="pagination">
          <button className="yk-btn yk-btn--secondary yk-btn--sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span className="fig-label">
            {data.meta.page} / {data.meta.totalPages}
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
    </div>
  );
}
