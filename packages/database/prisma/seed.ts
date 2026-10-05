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
    ['Social Media Marketing', 'social-media-marketing', 'Audience growth and engagement across the platforms your customers use.', 'share-2'],
    ['Video Production and TVC Ads', 'video-production-tvc-ads', 'Story-driven video and TV commercials that convert.', 'video'],
    ['Meta Ads Services', 'meta-ads-services', 'Facebook and Instagram advertising built for measurable results.', 'target'],
    ['SEO', 'seo', 'Search Engine Optimization that grows visibility and compounds over time.', 'search'],
  ];
  await prisma.service.deleteMany({ where: { slug: { notIn: services.map((x) => x[1]) } } });
  await Promise.all(
    services.map(([title, slug, shortDescription, icon], i) =>
      prisma.service.upsert({
        where: { slug },
        update: { title, shortDescription, description: shortDescription, icon, featured: true, displayOrder: i },
        create: {
          title,
          slug,
          shortDescription,
          description: shortDescription,
          icon,
          featured: true,
          displayOrder: i,
          status: ContentStatus.PUBLISHED,
        },
      }),
    ),
  );
  console.log(`✓ ${services.length} services`);

  // ── Clients (logos live in apps/web/public/clients) ────
  const clientList = [
    ['Greenleaf Builders', 'greenleaf-builders.jpeg'],
    ['Ayu Superspeciality Clinic', 'ayu-superspeciality-clinic.jpeg'],
    ['Birat School of Hospitality Management', 'bshm.jpeg'],
    ['Sazilo Automation', 'sazilo-automation.jpeg'],
    ['Sigma Kitchen & Home Appliances', 'sigma-kitchen.jpeg'],
    ['A&A Builders and Construction', 'aa-builders.jpeg'],
    ['Group Three Multipurpose Pvt. Ltd.', 'group-three-multipurpose.jpeg'],
    ['Inspire Connect College', 'inspire-connect-college.jpeg'],
    ['Kuti Home Decor', 'kuti-home-decor.png'],
    ['Saptakoshi Hospital', 'saptakoshi-hospital.jpeg'],
    ['Sahara Animal Care', 'sahara-animal-care.jpeg'],
    ['Delight Paints', 'delight-paints.jpeg'],
    ['Sumeru Food Production House', 'sumeru-food.jpeg'],
    ['The IELTS Institute', 'ielts-institute.png'],
    ['Chef Fork Brand', 'chef-fork-brand.jpeg'],
    ['Saraswati Brand', 'saraswati-brand.jpeg'],
    ['MS Brand', 'ms-brand.jpeg'],
  ];
  await prisma.client.deleteMany({});
  await prisma.client.createMany({
    data: clientList.map(([name, file], i) => ({
      name,
      logoUrl: `/clients/${file}`,
      displayOrder: i,
      status: ContentStatus.PUBLISHED,
    })),
  });
  console.log(`✓ ${clientList.length} clients`);

  // ── Team (photos live in apps/web/public/team) ─────────
  await prisma.teamMember.deleteMany({});
  await prisma.teamMember.createMany({
    data: [
      { name: 'Sanjay Raut', role: 'Founder', photo: '/team/sanjay-raut.jpg', displayOrder: 0 },
      { name: 'Saugat Tamang', role: 'Co-Founder', photo: '/team/saugat-tamang.jpg', displayOrder: 1 },
    ].map((m) => ({ ...m, status: ContentStatus.PUBLISHED })),
  });
  console.log('✓ 2 team members');

  // ── Metrics (placeholder values — edit in CMS, no fake stats) ──
  const metrics = [
    ['F-01', 'Founded', '2021'],
    ['F-02', 'Specialists', '—'],
    ['F-03', 'Brands Served', '—'],
    ['F-04', 'Markets', '4'],
  ];
  await Promise.all(
    metrics.map(([code, label, value], i) =>
      prisma.metric.upsert({
        where: { code },
        update: { label, value },
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
    tagline: 'We DESIGN | ADVERTISE | VISUALISE.',
    email: 'contact@yuktidigital.com',
    phone: '+977-0000000000',
    address: 'Biratnagar, Nepal',
    coverage: 'South Asia · The Gulf · Australia',
    social_instagram: '',
    social_facebook: '',
    social_linkedin: '',
    social_youtube: 'https://www.youtube.com/@Yuktids',
    social_tiktok: '',
    social_x: '',
    google_maps_url: '',
    seo_title: 'Yukti Digital Solutions | Digital Growth Agency in Biratnagar',
    seo_description:
      'We combine strategy, creativity, technology and performance marketing to help ambitious brands grow.',
    footer_note: '© 2026 Yukti Digital Solutions · Business Intelligence Agency',
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({ where: { key }, update: ['email', 'social_youtube', 'tagline', 'footer_note'].includes(key) ? { value } : {}, create: { key, value } });
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
