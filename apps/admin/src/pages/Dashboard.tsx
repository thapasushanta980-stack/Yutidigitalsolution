import { useQuery } from '@tanstack/react-query';
import { get } from '../lib/api.js';

interface Stats {
  totalLeads: number;
  newLeads: number;
  publishedProjects: number;
  publishedInsights: number;
  services: number;
  clients: number;
}

export function Dashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => get<Stats>('/admin/leads/stats'),
  });

  const cards: [string, number | undefined][] = [
    ['Total leads', data?.totalLeads],
    ['New leads', data?.newLeads],
    ['Published projects', data?.publishedProjects],
    ['Published insights', data?.publishedInsights],
    ['Services', data?.services],
    ['Clients', data?.clients],
  ];

  return (
    <div>
      <h1>Dashboard</h1>
      {isError && <p className="yk-field__error">Failed to load stats.</p>}
      <div className="admin-stats">
        {cards.map(([label, value]) => (
          <div key={label} className="admin-stat">
            <p className="admin-stat__value">{isLoading ? '—' : (value ?? 0)}</p>
            <p className="muted">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
