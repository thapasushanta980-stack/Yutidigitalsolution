import { siteSettings } from './staticData.js';

// Static launch: prepare an email; only the visitor's email app can send it.
export function openEnquiryEmail(subject: string, fields: Record<string, unknown>): void {
  const body = Object.entries(fields)
    .filter(([key, value]) => key !== 'company_website' && value != null && value !== '')
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`)
    .join('\n');
  window.location.href = `mailto:${siteSettings.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
