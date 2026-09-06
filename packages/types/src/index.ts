// Shared API contract types used by web, admin, and api.

export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type RoleName = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR';
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
export type LeadSource = 'GROWTH_AUDIT' | 'CONTACT' | 'OTHER';

// Standard success/error envelope (see docs/API.md §37).
export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorBody;

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: RoleName;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  icon: string | null;
  featured: boolean;
  displayOrder: number;
  status: ContentStatus;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface SiteSettings {
  [key: string]: string;
}

export interface SearchResults {
  services: { title: string; slug: string }[];
  work: { title: string; slug: string }[];
  caseStudies: { title: string; slug: string }[];
  insights: { title: string; slug: string }[];
}
