import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { Service } from '@yukti/types';
import type { CaseStudySummary, InsightSummary, ProjectSummary } from '../lib/queries.js';

export function ServiceCard({ service, index }: { service: Service; index: number }) {
  return (
    <Link to={`/services/${service.slug}`} className="card card--service">
      <span className="card__index">{String(index + 1).padStart(2, '0')}</span>
      <h3>{service.title}</h3>
      <p className="muted">{service.shortDescription}</p>
      <span className="card__more">
        Explore <ArrowUpRight size={16} aria-hidden="true" />
      </span>
    </Link>
  );
}

export function ProjectCard({ project }: { project: ProjectSummary }) {
  return (
    <Link to={`/work/${project.slug}`} className="card card--project">
      <div className="card__media">
        {project.coverImage ? (
          <img src={project.coverImage} alt={project.title} loading="lazy" />
        ) : (
          <div className="card__media-placeholder" aria-hidden="true" />
        )}
      </div>
      <div className="card__body">
        <h3>{project.title}</h3>
        <p className="muted">
          {[project.client?.name, project.industry].filter(Boolean).join(' · ') || 'Project'}
        </p>
      </div>
    </Link>
  );
}

export function CaseStudyCard({ item }: { item: CaseStudySummary }) {
  return (
    <Link to={`/case-studies/${item.slug}`} className="card card--case">
      <div className="card__body">
        <p className="muted">{[item.client, item.industry].filter(Boolean).join(' · ')}</p>
        <h3>{item.title}</h3>
        {item.metrics?.length > 0 && (
          <ul className="case-metrics">
            {item.metrics.slice(0, 2).map((m) => (
              <li key={m.id}>
                <strong>{m.value}</strong>
                <span className="muted">{m.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}

export function InsightCard({ item }: { item: InsightSummary }) {
  return (
    <Link to={`/insights/${item.slug}`} className="card card--insight">
      {item.coverImage && (
        <div className="card__media">
          <img src={item.coverImage} alt={item.title} loading="lazy" />
        </div>
      )}
      <div className="card__body">
        {item.category && <p className="fig-label">{item.category.name}</p>}
        <h3>{item.title}</h3>
        <p className="muted">{item.excerpt}</p>
        <p className="fig-label">
          {item.author} · {item.readingMinutes} min read
        </p>
      </div>
    </Link>
  );
}
