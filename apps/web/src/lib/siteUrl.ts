// Set once at build time so aliases/previews cannot change the canonical host.
export const SITE_ORIGIN = (import.meta.env.VITE_SITE_URL || 'https://yuktids.com').replace(/\/$/, '');

export function siteUrl(path: string): string {
  return new URL(path, `${SITE_ORIGIN}/`).href;
}
