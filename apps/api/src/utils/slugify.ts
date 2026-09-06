import { prisma } from '@yukti/database';

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

type SlugModel = 'service' | 'project' | 'caseStudy' | 'insight' | 'category' | 'tag';

// Generate a unique slug for the given model, appending -2, -3, … on collision.
export async function uniqueSlug(
  model: SlugModel,
  base: string,
  excludeId?: string,
): Promise<string> {
  const root = slugify(base) || 'item';
  let candidate = root;
  let n = 1;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const delegate = (prisma as any)[model];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await delegate.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    n += 1;
    candidate = `${root}-${n}`;
  }
}
