import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, FormField } from '@yukti/ui';
import type { LeadStatus } from '@yukti/types';
import { get, put } from '../lib/api.js';

interface Lead {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  industry: string | null;
  budget: string | null;
  challenge: string;
  services: string | null;
  message: string | null;
  status: LeadStatus;
  internalNote: string | null;
  createdAt: string;
}

const STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'];

export function LeadDetail() {
  const { id = '' } = useParams();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['admin-lead', id], queryFn: () => get<Lead>(`/admin/leads/${id}`) });

  const [status, setStatus] = useState<LeadStatus>('NEW');
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) {
      setStatus(data.status);
      setNote(data.internalNote ?? '');
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: () => put<Lead>(`/admin/leads/${id}`, { status, internalNote: note }),
    onSuccess: () => {
      setSaved(true);
      qc.invalidateQueries({ queryKey: ['admin-lead', id] });
      qc.invalidateQueries({ queryKey: ['admin-leads'] });
      setTimeout(() => setSaved(false), 2000);
    },
  });

  if (!data) return <p>Loading…</p>;
  const services = data.services ? (JSON.parse(data.services) as string[]) : [];

  return (
    <div>
      <Link to="/leads" className="muted">
        ← Back to leads
      </Link>
      <h1>{data.name}</h1>

      <div className="split">
        <div className="admin-card">
          <h3>Enquiry</h3>
          <dl className="admin-dl">
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${data.email}`}>{data.email}</a>
            </dd>
            <dt>Company</dt>
            <dd>{data.company ?? '—'}</dd>
            <dt>Phone</dt>
            <dd>{data.phone ?? '—'}</dd>
            <dt>Website</dt>
            <dd>
              {data.website ? (
                <a href={data.website} target="_blank" rel="noreferrer noopener">
                  {data.website}
                </a>
              ) : (
                '—'
              )}
            </dd>
            <dt>Industry</dt>
            <dd>{data.industry ?? '—'}</dd>
            <dt>Budget</dt>
            <dd>{data.budget ?? '—'}</dd>
            <dt>Services</dt>
            <dd>{services.length ? services.join(', ') : '—'}</dd>
            <dt>Challenge</dt>
            <dd>{data.challenge}</dd>
            {data.message && (
              <>
                <dt>Message</dt>
                <dd>{data.message}</dd>
              </>
            )}
            <dt>Received</dt>
            <dd>{new Date(data.createdAt).toLocaleString()}</dd>
          </dl>
        </div>

        <div className="admin-card">
          <h3>Manage</h3>
          <FormField label="Status" htmlFor="status">
            <select
              id="status"
              className="yk-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatus)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Internal note (private)" htmlFor="note" hint="Never shown to the public.">
            <textarea id="note" className="yk-textarea" value={note} onChange={(e) => setNote(e.target.value)} />
          </FormField>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
