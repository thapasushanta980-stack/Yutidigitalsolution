/**
 * Development seed for Yukti Digital Solutions.
 *
 * IMPORTANT: This seeds STRUCTURE and clearly-marked development placeholder
 * content only. It does NOT invent client statistics, testimonials, or
 * business metrics. Real values are entered via the admin CMS.
 */
import { PrismaClient, RoleName, ContentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  // ── Roles ──────────────────────────────────────────────
  for (const name of Object.values(RoleName)) {
    await prisma.role.upsert({ where: { name }, update: {}, create: { name } });
  }
  const superAdminRole = await prisma.role.findUniqueOrThrow({
    where: { name: RoleName.SUPER_ADMIN },
  });

  // ── Seed admin user ────────────────────────────────────
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@yukti.example';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe!2026';
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: process.env.SEED_ADMIN_NAME ?? 'Yukti Admin',
      email,
      passwordHash,
      roleId: superAdminRole.id,
    },
  });
  console.log(`✓ Seed admin: ${email} (change the password after first login)`);

  // ── Services (real service catalogue, DRAFT-free = PUBLISHED) ──
  const services = [
    ['SEO', 'seo', 'Search visibility that compounds.', 'search'],
    ['Performance Marketing', 'performance-marketing', 'Paid media engineered for ROAS.', 'target'],
    ['Social Media Marketing', 'social-media-marketing', 'Audience growth and engagement.', 'share-2'],
    ['Video Production', 'video-production', 'Story-driven video that converts.', 'video'],
    ['Web Development', 'web-development', 'Fast, accessible, conversion-first sites.', 'code'],
    ['Brand Strategy', 'brand-strategy', 'Positioning that earns preference.', 'compass'],
    ['Content Marketing', 'content-marketing', 'Content that ranks and resonates.', 'file-text'],
    ['Creative & Design', 'creative-and-design', 'Editorial, high-end visual systems.', 'palette'],
  ];
  await Promise.all(
    services.map(([title, slug, shortDescription, icon], i) =>
      prisma.service.upsert({
        where: { slug },
        update: {},
        create: {
          title,
          slug,
          shortDescription,
          description: `${shortDescription} [Placeholder body — edit in admin CMS.]`,
          icon,
          featured: i < 4,
          displayOrder: i,
          status: ContentStatus.PUBLISHED,
        },
      }),
    ),
  );
  console.log(`✓ ${services.length} services`);

  // ── Metrics (placeholder values — edit in CMS, no fake stats) ──
  const metrics = [
    ['F-01', 'Founded', '2026'],
    ['F-02', 'Specialists', '—'],
    ['F-03', 'Brands Served', '—'],
    ['F-04', 'Markets', '4'],
  ];
  await Promise.all(
    metrics.map(([code, label, value], i) =>
      prisma.metric.upsert({
        where: { code },
        update: {},
        create: { code, label, value, displayOrder: i, status: ContentStatus.PUBLISHED },
      }),
    ),
  );
  console.log(`✓ ${metrics.length} metrics (placeholder values)`);

  // ── Values (About page) ────────────────────────────────
  const values = [
    ['Outcomes First', 'We optimise for business results, not vanity metrics.'],
    ['Plain Reporting', 'Clear numbers, no jargon. You always know what worked.'],
    ['Senior Hands', 'Senior specialists on the work, not just the pitch.'],
    ['Compounding Work', 'We build assets that keep returning over time.'],
  ];
  // Values has no unique business key; only seed if empty.
  if ((await prisma.value.count()) === 0) {
    await prisma.value.createMany({
      data: values.map(([title, description], i) => ({
        title,
        description,
        displayOrder: i,
        status: ContentStatus.PUBLISHED,
      })),
    });
  }
  console.log(`✓ ${values.length} values`);

  // ── Site settings ──────────────────────────────────────
  const settings: Record<string, string> = {
    company_name: 'Yukti Digital Solutions',
    tagline: 'Turn Your Digital Presence Into Measurable Growth.',
    email: 'hello@yukti.example',
    phone: '+977-0000000000',
    address: 'Kathmandu, Nepal',
    coverage: 'South Asia · The Gulf · Australia',
    social_instagram: '',
    social_facebook: '',
    social_linkedin: '',
    social_youtube: '',
    social_tiktok: '',
    social_x: '',
    google_maps_url: '',
    seo_title: 'Yukti Digital Solutions — Digital Growth Agency in Kathmandu',
    seo_description:
      'We combine strategy, creativity, technology and performance marketing to help ambitious brands grow.',
    footer_note: '© 2026 Yukti Digital Solutions',
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({ where: { key }, update: {}, create: { key, value } });
  }
  console.log(`✓ ${Object.keys(settings).length} site settings`);

  // ── Navigation ─────────────────────────────────────────
  const nav = [
    ['Services', '/services'],
    ['Work', '/work'],
    ['Case Studies', '/case-studies'],
    ['About', '/about'],
    ['Insights', '/insights'],
  ];
  if ((await prisma.navigationItem.count({ where: { location: 'header' } })) === 0) {
    await prisma.navigationItem.createMany({
      data: nav.map(([label, href], i) => ({ label, href, location: 'header', displayOrder: i })),
    });
  }
  console.log(`✓ navigation`);

  console.log('\nSeed complete. Placeholder content is marked; enter real data via /admin.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
