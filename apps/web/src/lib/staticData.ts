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

// No published projects, case studies, testimonials or insights yet.
export const projects: unknown[] = [];
export const caseStudies: unknown[] = [];
export const testimonials: unknown[] = [];
export const insights: unknown[] = [];
export const insightCategories: unknown[] = [];

export function search(q: string): SearchResults {
  const needle = q.toLowerCase();
  return {
    services: services.filter((s) => `${s.title} ${s.shortDescription}`.toLowerCase().includes(needle)),
    work: [],
    caseStudies: [],
    insights: [],
  };
}
