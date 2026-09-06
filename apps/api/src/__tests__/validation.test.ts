import { describe, it, expect } from 'vitest';
import { createLeadSchema } from '../modules/leads/lead.schema.js';
import { loginSchema } from '../modules/auth/auth.schema.js';
import { slugify } from '../utils/slugify.js';

describe('slugify', () => {
  it('normalises titles', () => {
    expect(slugify('Performance Marketing')).toBe('performance-marketing');
    expect(slugify('SEO')).toBe('seo');
    expect(slugify('  Hello, World! ')).toBe('hello-world');
  });
});

describe('lead schema', () => {
  it('requires name, email, website, challenge', () => {
    const bad = createLeadSchema.safeParse({ name: 'A' });
    expect(bad.success).toBe(false);
  });
  it('rejects an invalid website URL', () => {
    const res = createLeadSchema.safeParse({
      name: 'Jane Doe',
      email: 'jane@example.com',
      website: 'not-a-url',
      challenge: 'Need more organic traffic',
    });
    expect(res.success).toBe(false);
  });
  it('accepts a valid submission', () => {
    const res = createLeadSchema.safeParse({
      name: 'Jane Doe',
      email: 'jane@example.com',
      website: 'https://example.com',
      challenge: 'Need more organic traffic',
    });
    expect(res.success).toBe(true);
  });
  it('flags honeypot as present (caught downstream)', () => {
    const res = createLeadSchema.safeParse({
      name: 'Jane Doe',
      email: 'jane@example.com',
      website: 'https://example.com',
      challenge: 'Need more organic traffic',
      company_website: 'spam',
    });
    // honeypot must be empty
    expect(res.success).toBe(false);
  });
});

describe('login schema', () => {
  it('requires a valid email and min-length password', () => {
    expect(loginSchema.safeParse({ email: 'x', password: '123' }).success).toBe(false);
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'longenough' }).success).toBe(true);
  });
});
