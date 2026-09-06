import { useQuery } from '@tanstack/react-query';
import type { Service, SiteSettings } from '@yukti/types';
import { fetchData } from './api.js';

// ── Reusable typed query hooks (server state via TanStack Query) ──

export interface Metric {
  id: string;
  code: string;
  label: string;
  value: string;
}
export interface Client {
  id: string;
  name: string;
  websiteUrl: string | null;
  logoUrl: string | null;
}
export interface Testimonial {
  id: string;
  clientName: string;
  clientRole: string | null;
  company: string | null;
  quote: string;
  rating: number | null;
}
export interface ProjectSummary {
  id: string;
  title: string;
  slug: string;
  industry: string | null;
  service: string | null;
  coverImage: string | null;
  client?: { name: string } | null;
}
export interface CaseStudySummary {
  id: string;
  title: string;
  slug: string;
  client: string | null;
  industry: string | null;
  metrics: { id: string; label: string; value: string }[];
}
export interface InsightSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  coverImage: string | null;
  readingMinutes: number;
  publishedAt: string | null;
  category?: { name: string; slug: string } | null;
}
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  photo: string | null;
  linkedin: string | null;
}
export interface Value {
  id: string;
  title: string;
  description: string;
}

export const useSiteSettings = () =>
  useQuery({ queryKey: ['site-settings'], queryFn: () => fetchData<SiteSettings>('/site-settings'), staleTime: Infinity });

export const useServices = () =>
  useQuery({ queryKey: ['services'], queryFn: () => fetchData<Service[]>('/services') });

export const useService = (slug: string) =>
  useQuery({ queryKey: ['service', slug], queryFn: () => fetchData<Service>(`/services/${slug}`), enabled: !!slug });

export const useMetrics = () =>
  useQuery({ queryKey: ['metrics'], queryFn: () => fetchData<Metric[]>('/metrics') });

export const useClients = () =>
  useQuery({ queryKey: ['clients'], queryFn: () => fetchData<Client[]>('/clients') });

export const useTestimonials = () =>
  useQuery({ queryKey: ['testimonials'], queryFn: () => fetchData<Testimonial[]>('/testimonials') });

export const useProjects = (featured = false) =>
  useQuery({
    queryKey: ['projects', { featured }],
    queryFn: () => fetchData<ProjectSummary[]>('/projects', featured ? { featured: true } : undefined),
  });

export const useCaseStudies = (featured = false) =>
  useQuery({
    queryKey: ['case-studies', { featured }],
    queryFn: () => fetchData<CaseStudySummary[]>('/case-studies', featured ? { featured: true } : undefined),
  });

export const useTeam = () =>
  useQuery({ queryKey: ['team'], queryFn: () => fetchData<TeamMember[]>('/team') });

export const useValues = () =>
  useQuery({ queryKey: ['values'], queryFn: () => fetchData<Value[]>('/team/values') });
