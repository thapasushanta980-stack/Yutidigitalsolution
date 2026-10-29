import type { Service, SiteSettings, SearchResults } from '@yukti/types';

// All public-site content lives here for the static build (no API / CMS).
// Edit this file to change what the website shows.

export const siteSettings: SiteSettings = {
  company_name: 'Yukti Digital Solutions',
  tagline: 'We DESIGN | ADVERTISE | VISUALISE.',
  email: 'contact@yuktidigital.com',
  phone: '',
  address: 'Biratnagar, Nepal',
  coverage: '',
  social_youtube: 'https://www.youtube.com/@Yuktids',
  social_instagram: '',
  social_facebook: '',
  social_linkedin: '',
  social_tiktok: '',
  social_x: '',
  google_maps_url: '',
  seo_title: 'Yukti Digital Solutions | Business Intelligence Agency',
  seo_description:
    'One-stop solutions for all digital marketing services: SEO, social media marketing, Meta ads, video production and TVC ads.',
  footer_note: '© 2026 Yukti Digital Solutions · Business Intelligence Agency',
};

const svc = (
  i: number,
  title: string,
  slug: string,
  shortDescription: string,
  description: string,
  icon: string,
): Service => ({
  id: slug,
  title,
  slug,
  shortDescription,
  description,
  icon,
  featured: true,
  displayOrder: i,
  status: 'PUBLISHED' as Service['status'],
});

// Home hero background videos, played one after another in a loop. Files live
// in apps/web/public/hero/ as 720p MP4s with a poster frame each. They start
// muted; visitors can turn the sound on. To add one, compress the original first:
//   ffmpeg -i input.mp4 -vf "scale=1280:-2,fps=25,format=yuv420p" -c:v libx264 -preset slow \
//     -crf 28 -maxrate 1600k -bufsize 3200k -c:a aac -b:a 96k -ac 2 -movflags +faststart out.mp4
// An empty list shows the illustrated hero instead.
export const heroVideos: { src: string; poster: string }[] = [
  { src: '/hero/car-ad.mp4', poster: '/hero/car-ad.jpg' },
  { src: '/hero/hotel-ratna.mp4', poster: '/hero/hotel-ratna.jpg' },
];

export const services: Service[] = [
  svc(
    0,
    'Social Media Marketing',
    'social-media-marketing',
    'Audience growth and engagement across the platforms your customers use.',
    'We plan, design and publish social content that builds your brand and keeps your audience engaged.\n\nFrom content calendars and creatives to community management and reporting, we run your social presence end to end.',
    'share-2',
  ),
  svc(
    1,
    'Video Production and TVC Ads',
    'video-production-tvc-ads',
    'Story-driven video and TV commercials that convert.',
    'From concept and scripting to shooting and editing, we produce brand films, social videos and TV commercials that tell your story clearly.\n\nOur team handles the full production so you get broadcast-ready, platform-ready video.',
    'video',
  ),
  svc(
    2,
    'Meta Ads Services',
    'meta-ads-services',
    'Facebook and Instagram advertising built for measurable results.',
    'We set up, run and optimise paid campaigns across Facebook and Instagram, reaching the right audience with the right creative.\n\nEvery campaign is tracked so you can see what is working and where your budget goes.',
    'target',
  ),
  svc(
    3,
    'SEO',
    'seo',
    'Search Engine Optimization that grows visibility and compounds over time.',
    'We improve how your website ranks on search engines through technical fixes, on-page optimisation, content and link building.\n\nSEO is an asset that keeps returning traffic and enquiries long after the work is done.',
    'search',
  ),
];

export const metrics = [
  { id: 'm1', code: 'F-01', label: 'Founded', value: '2021' },
  { id: 'm2', code: 'F-02', label: 'Core Services', value: '4' },
  { id: 'm3', code: 'F-03', label: 'Brands Served', value: '17' },
  { id: 'm4', code: 'F-04', label: 'Markets', value: '4' },
];

const clientList: [string, string][] = [
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

export const clients = clientList.map(([name, file], i) => ({
  id: `c${i}`,
  name,
  websiteUrl: null,
  logoUrl: `/clients/${file}`,
}));

export const team = [
  { id: 't1', name: 'Sanjay Raut', role: 'Founder', bio: null, photo: '/team/sanjay-raut.jpg', linkedin: null },
  { id: 't2', name: 'Saugat Tamang', role: 'Co-Founder', bio: null, photo: '/team/saugat-tamang.jpg', linkedin: null },
];

export const values = [
  { id: 'v1', title: 'Design', description: 'Clear, high-end visual identities and websites that make brands memorable.' },
  { id: 'v2', title: 'Advertise', description: 'Paid and organic campaigns built around measurable business results.' },
  { id: 'v3', title: 'Visualise', description: 'Video, motion and storytelling that bring your brand to life.' },
  { id: 'v4', title: 'Experience', description: 'Promoters with years of experience in technology and enterprises.' },
];

// No published projects or case studies yet.
export const projects: unknown[] = [];
export const caseStudies: unknown[] = [];

// Client reviews. Add only genuine reviews, with the client's permission:
// { id, clientName, clientRole, company, quote, rating (1-5 or null), photo (path or null) }
export const testimonials: unknown[] = [];

// ── Blog ──
// Posts are newest first. In `content`, a blank line starts a new paragraph and
// a line starting with "## " is a subheading ("- " lines form a list). `art`
// picks the cover illustration when there is no coverImage. Add each new slug
// to the /blog/ location in deploy/nginx.conf so the post is served.
export const insightCategories = [
  { id: 'cat-seo', name: 'SEO', slug: 'seo' },
  { id: 'cat-ads', name: 'Meta Ads', slug: 'meta-ads' },
  { id: 'cat-social', name: 'Social Media', slug: 'social-media' },
];

const post = (
  slug: string,
  title: string,
  excerpt: string,
  categorySlug: string,
  art: 'social' | 'video' | 'ads' | 'seo',
  publishedAt: string,
  content: string,
) => {
  const category = insightCategories.find((c) => c.slug === categorySlug)!;
  return {
    id: slug,
    slug,
    title,
    excerpt,
    author: 'Yukti Digital Solutions',
    coverImage: null,
    art,
    readingMinutes: Math.max(1, Math.round(content.split(/\s+/).length / 200)),
    publishedAt,
    updatedAt: publishedAt,
    category: { name: category.name, slug: category.slug },
    content: content.trim(),
    canonicalUrl: null,
    seoTitle: null,
    seoDescription: null,
  };
};

export const insights = [
  post(
    'get-found-on-google-maps',
    'How local businesses get found on Google Maps',
    'A complete, active Google Business Profile is one of the simplest ways to show up when nearby customers search for what you sell.',
    'seo',
    'seo',
    '2026-10-29',
    `
When someone nearby searches for "clinic near me" or "paint shop in Biratnagar", Google usually shows a map with three businesses before any website. Those businesses are chosen from Google Business Profiles. If your profile is missing, incomplete or out of date, you are invisible in the place many local customers look first.

## Claim and verify your profile

Search for your business name on Google Maps. If a listing exists, claim it; if not, create one at business.google.com. Google will ask you to verify that you run the business, usually by phone, email or a short video. Nothing else on this list works until verification is done.

## Fill in every field

Choose the most specific primary category you can, for example "Hospital" rather than "Health". Add your exact address, a map pin in the right place, opening hours, phone number and website. Write a plain description of what you offer and who you serve. Google favours profiles that are complete and consistent with the rest of the web, so use the same name, address and phone number everywhere.

## Add real photos

Upload clear photos of your storefront, signage, interior, team and products. Customers use them to recognise you when they arrive, and fresh photos signal that the business is active.

## Ask for reviews and reply to them

Reviews influence both ranking and choice. Ask happy customers to leave one, and make it easy with a direct review link. Reply to every review, positive or negative, politely and briefly. A calm reply to a complaint often reassures future customers more than a perfect score.

## Keep it current

Update holiday hours, post offers or news, and answer questions in the Q&A section. A profile that is looked after tends to perform better than one that was set up once and forgotten.
`,
  ),
  post(
    'boost-post-vs-meta-ads-campaign',
    'Boosting a post or running a Meta Ads campaign?',
    'The Boost button is quick, but Ads Manager gives you control over the goal, the audience and how results are measured. Here is when to use each.',
    'meta-ads',
    'ads',
    '2026-10-29',
    `
Facebook and Instagram give you two ways to pay for reach: the "Boost post" button on a post you have already published, and a full campaign built in Meta Ads Manager. Both put your content in front of more people, but they are built for different jobs.

## What boosting is good for

Boosting is fast. Pick a post, choose an audience and a budget, and it starts running. It works well when you simply want more people to see a post that is already doing well, such as an event announcement or a popular video. Because it starts from a published post, it is mostly optimised for engagement: likes, comments and shares.

## What a campaign adds

Ads Manager starts with an objective. You tell Meta whether you want messages, website visits, leads, calls or sales, and the system shows your ad to the people most likely to take that action. You can also:

- test several images, videos or headlines at once and let the best one win;
- build audiences from your website visitors, customer lists or people who engaged with your page;
- control placements, schedules and budgets in more detail;
- track results with the Meta Pixel or Conversions API, so you can see the cost of each enquiry or sale.

## Which one to choose

If the goal is visibility for a single post, a boost is fine. If the goal is enquiries, bookings or sales, use a campaign with a matching objective and proper tracking. Engagement is pleasant to watch, but it is not the same as customers, and a campaign built around the action you actually want is usually the better use of budget.

## Before you spend

Make sure the page or form people land on loads quickly on a phone and makes the next step obvious. The best ad cannot fix a confusing landing page.
`,
  ),
  post(
    'plan-a-month-of-social-media-content',
    'Plan a month of social media content in one afternoon',
    'A simple content calendar keeps your pages active without a daily scramble for ideas. This is the process we use to plan a month at a time.',
    'social-media',
    'social',
    '2026-10-29',
    `
Posting regularly matters more than posting a lot. The businesses that struggle on social media are often not short of ideas; they are deciding what to post on the same day they post it. A monthly plan fixes that.

## Start with three to four content pillars

Pillars are the recurring themes your page is known for. A clinic might use health tips, meet the doctors, patient stories and service updates. A restaurant might use new dishes, behind the scenes, offers and customer moments. Every post should fit one pillar, which keeps the page focused and makes ideas easier to find.

## Choose a realistic rhythm

Three good posts a week, every week, beat seven posts one week and nothing the next. Pick a frequency your team can keep up, then decide which days each pillar appears on.

## Mark the dates that matter

Add festivals, public holidays, seasonal moments and your own launches or offers to the calendar first. Then fill the remaining slots from your pillars.

## Batch the work

Write all captions in one sitting, then shoot or design the visuals in another. Batching is much faster than switching between tasks every day, and it gives you time to review everything before it goes live.

## Schedule, then stay present

Use Meta Business Suite or another scheduler to queue the month's posts. Scheduling frees you to spend a few minutes each day replying to comments and messages, which is where real conversations with customers happen.

## Review at the end of the month

Look at which posts led to messages, calls or visits, not just likes. Do more of what worked next month and drop what did not.
`,
  ),
];
export function search(q: string): SearchResults {
  const needle = q.toLowerCase();
  return {
    services: services.filter((s) => `${s.title} ${s.shortDescription}`.toLowerCase().includes(needle)),
    work: [],
    caseStudies: [],
    insights: insights.filter((p) => `${p.title} ${p.excerpt}`.toLowerCase().includes(needle)),
  };
}
