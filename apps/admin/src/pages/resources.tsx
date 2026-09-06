import { ResourceCrud, type ColumnDef, type FieldDef } from '../components/ResourceCrud.js';

const statusCol: ColumnDef = { key: 'status', label: 'Status', badge: true };
const statusField: FieldDef = { name: 'status', label: 'Status', type: 'select' };

export function ProjectsCms() {
  const fields: FieldDef[] = [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'clientId', label: 'Client ID', type: 'text', hint: 'Optional — id of an existing client' },
    { name: 'industry', label: 'Industry', type: 'text' },
    { name: 'service', label: 'Service', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea', required: true, full: true },
    { name: 'challenge', label: 'Challenge', type: 'textarea', full: true },
    { name: 'solution', label: 'Approach', type: 'textarea', full: true },
    { name: 'result', label: 'Results', type: 'textarea', full: true },
    { name: 'coverImage', label: 'Cover image URL', type: 'url' },
    { name: 'featured', label: 'Featured', type: 'checkbox' },
    statusField,
  ];
  return (
    <ResourceCrud
      title="Project"
      endpoint="projects"
      columns={[{ key: 'title', label: 'Title' }, { key: 'slug', label: 'Slug' }, statusCol, { key: 'featured', label: 'Featured' }]}
      fields={fields}
      emptyDraft={{ title: '', description: '', featured: false, status: 'DRAFT' }}
    />
  );
}

export function CaseStudiesCms() {
  const fields: FieldDef[] = [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'client', label: 'Client', type: 'text' },
    { name: 'industry', label: 'Industry', type: 'text' },
    { name: 'service', label: 'Service', type: 'text' },
    { name: 'challenge', label: 'Challenge', type: 'textarea', required: true, full: true },
    { name: 'strategy', label: 'Strategy', type: 'textarea', full: true },
    { name: 'implementation', label: 'Implementation', type: 'textarea', full: true },
    { name: 'results', label: 'Results', type: 'textarea', full: true },
    { name: 'metrics', label: 'Metrics', type: 'metrics', full: true },
    { name: 'coverImage', label: 'Cover image URL', type: 'url' },
    { name: 'featured', label: 'Featured', type: 'checkbox' },
    statusField,
  ];
  return (
    <ResourceCrud
      title="Case Study"
      endpoint="case-studies"
      columns={[{ key: 'title', label: 'Title' }, { key: 'slug', label: 'Slug' }, statusCol, { key: 'featured', label: 'Featured' }]}
      fields={fields}
      emptyDraft={{ title: '', challenge: '', metrics: [], featured: false, status: 'DRAFT' }}
    />
  );
}

export function InsightsCms() {
  const fields: FieldDef[] = [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'author', label: 'Author', type: 'text', required: true },
    { name: 'categoryId', label: 'Category ID', type: 'text', hint: 'Optional' },
    { name: 'excerpt', label: 'Excerpt', type: 'textarea', required: true, full: true },
    { name: 'content', label: 'Content', type: 'textarea', required: true, full: true },
    { name: 'tags', label: 'Tags', type: 'tags', full: true },
    { name: 'coverImage', label: 'Cover image URL', type: 'url' },
    { name: 'seoTitle', label: 'SEO title', type: 'text' },
    { name: 'seoDescription', label: 'SEO description', type: 'text' },
    statusField,
  ];
  return (
    <ResourceCrud
      title="Insight"
      endpoint="insights"
      columns={[{ key: 'title', label: 'Title' }, { key: 'slug', label: 'Slug' }, statusCol, { key: 'author', label: 'Author' }]}
      fields={fields}
      emptyDraft={{ title: '', author: '', excerpt: '', content: '', tags: '', status: 'DRAFT' }}
    />
  );
}

export function TestimonialsCms() {
  const fields: FieldDef[] = [
    { name: 'clientName', label: 'Client name', type: 'text', required: true },
    { name: 'clientRole', label: 'Role', type: 'text' },
    { name: 'company', label: 'Company', type: 'text' },
    { name: 'quote', label: 'Quote', type: 'textarea', required: true, full: true },
    { name: 'avatar', label: 'Avatar URL', type: 'url' },
    { name: 'rating', label: 'Rating (1–5)', type: 'number' },
    { name: 'displayOrder', label: 'Display order', type: 'number' },
    { name: 'featured', label: 'Featured', type: 'checkbox' },
    statusField,
  ];
  return (
    <ResourceCrud
      title="Testimonial"
      endpoint="testimonials"
      columns={[{ key: 'clientName', label: 'Client' }, { key: 'company', label: 'Company' }, statusCol, { key: 'featured', label: 'Featured' }]}
      fields={fields}
      emptyDraft={{ clientName: '', quote: '', featured: false, displayOrder: 0, status: 'PUBLISHED' }}
    />
  );
}

export function ClientsCms() {
  const fields: FieldDef[] = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'websiteUrl', label: 'Website URL', type: 'url' },
    { name: 'logoUrl', label: 'Logo URL', type: 'url', hint: 'Upload in Media, then paste the URL' },
    { name: 'displayOrder', label: 'Display order', type: 'number' },
    statusField,
  ];
  return (
    <ResourceCrud
      title="Client"
      endpoint="clients"
      columns={[{ key: 'name', label: 'Name' }, statusCol, { key: 'displayOrder', label: 'Order' }]}
      fields={fields}
      emptyDraft={{ name: '', displayOrder: 0, status: 'PUBLISHED' }}
    />
  );
}

export function TeamCms() {
  const fields: FieldDef[] = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'role', label: 'Role', type: 'text', required: true },
    { name: 'bio', label: 'Bio', type: 'textarea', full: true },
    { name: 'photo', label: 'Photo URL', type: 'url' },
    { name: 'linkedin', label: 'LinkedIn URL', type: 'url' },
    { name: 'displayOrder', label: 'Display order', type: 'number' },
    statusField,
  ];
  return (
    <ResourceCrud
      title="Team Member"
      endpoint="team"
      columns={[{ key: 'name', label: 'Name' }, { key: 'role', label: 'Role' }, statusCol]}
      fields={fields}
      emptyDraft={{ name: '', role: '', displayOrder: 0, status: 'PUBLISHED' }}
    />
  );
}

export function MetricsCms() {
  const fields: FieldDef[] = [
    { name: 'code', label: 'Code (e.g. F-01)', type: 'text', required: true },
    { name: 'label', label: 'Label', type: 'text', required: true },
    { name: 'value', label: 'Value', type: 'text', required: true, hint: 'Editable — no fake stats' },
    { name: 'displayOrder', label: 'Display order', type: 'number' },
    statusField,
  ];
  return (
    <ResourceCrud
      title="Metric"
      endpoint="metrics"
      columns={[{ key: 'code', label: 'Code' }, { key: 'label', label: 'Label' }, { key: 'value', label: 'Value' }, statusCol]}
      fields={fields}
      emptyDraft={{ code: '', label: '', value: '', displayOrder: 0, status: 'PUBLISHED' }}
    />
  );
}
