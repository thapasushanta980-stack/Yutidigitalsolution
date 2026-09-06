import { MapPin } from 'lucide-react';
import { Section, Container, Button } from '@yukti/ui';
import { Seo, organizationJsonLd } from '../lib/Seo.js';
import { Reveal } from '../components/Reveal.js';
import { SectionHeader } from '../components/SectionHeader.js';
import { GrowthModel } from '../components/GrowthModel.js';
import { ServiceCard, ProjectCard, CaseStudyCard } from '../components/Cards.js';
import { QueryState } from '../components/QueryState.js';
import { Testimonials } from '../components/Testimonials.js';
import { AnimatedNumber } from '../components/AnimatedNumber.js';
import {
  useServices,
  useMetrics,
  useClients,
  useProjects,
  useCaseStudies,
  useSiteSettings,
} from '../lib/queries.js';

export default function Home() {
  const { data: settings } = useSiteSettings();
  const services = useServices();
  const metrics = useMetrics();
  const clients = useClients();
  const projects = useProjects(true);
  const caseStudies = useCaseStudies(true);

  return (
    <>
      <Seo
        title="Yukti Digital Solutions — Digital Growth Agency in Kathmandu"
        description={settings?.seo_description}
        path="/"
        jsonLd={organizationJsonLd()}
      />

      {/* Hero */}
      <Section className="hero" tone="paper">
        <Container>
          <Reveal>
            <p className="hero__location eyebrow">
              <MapPin size={14} aria-hidden="true" /> Kathmandu, Nepal
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="hero__title">
              Turn Your Digital Presence Into Measurable{' '}
              <span className="accent-underline">Growth.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="lead">
              We combine strategy, creativity, technology and performance marketing to help ambitious
              brands grow.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="hero__actions">
              <Button as="a" href="/free-growth-audit" size="lg">
                Get Your Free Growth Audit
              </Button>
              <Button as="a" href="/services" variant="secondary" size="lg">
                Explore Our Services
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="hero__pillars">
              <span>Strategy</span>
              <span aria-hidden="true">+</span>
              <span>Creative</span>
              <span aria-hidden="true">+</span>
              <span>Technology</span>
              <span aria-hidden="true">+</span>
              <span>Performance</span>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* Growth model */}
      <Section tone="alt">
        <Container>
          <div className="split">
            <div>
              <SectionHeader
                eyebrow="How growth compounds"
                title="Organic and paid, working as one."
                intro="Channels don't grow in isolation. We build organic foundations and amplify them with paid media so results compound over time."
              />
            </div>
            <Reveal>
              <GrowthModel />
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* Trusted brands */}
      <Section tone="paper">
        <Container>
          <SectionHeader eyebrow="Clients" title="Trusted by ambitious brands." />
          <QueryState
            isLoading={clients.isLoading}
            isError={clients.isError}
            isEmpty={!clients.data?.length}
            emptyMessage="Client logos will appear here as they are added."
          >
            <div className="logo-grid">
              {clients.data?.map((c) => (
                <div key={c.id} className="logo-grid__cell">
                  {c.logoUrl ? <img src={c.logoUrl} alt={c.name} loading="lazy" /> : c.name}
                </div>
              ))}
            </div>
          </QueryState>
        </Container>
      </Section>

      {/* Metrics */}
      <Section tone="ink">
        <Container>
          <QueryState
            isLoading={metrics.isLoading}
            isError={metrics.isError}
            isEmpty={!metrics.data?.length}
          >
            <div className="metrics">
              {metrics.data?.map((m) => (
                <div key={m.id} className="metric">
                  <p className="metric__code">{m.code}</p>
                  <p className="metric__value">
                    <AnimatedNumber value={m.value} />
                  </p>
                  <p className="metric__label">{m.label}</p>
                </div>
              ))}
            </div>
          </QueryState>
        </Container>
      </Section>

      {/* Positioning */}
      <Section tone="paper">
        <Container>
          <div className="split">
            <SectionHeader
              eyebrow="Positioning"
              title="Growth You Can Measure."
              intro="Digital marketing should generate business growth, not just attention. Every engagement starts with numbers and ends with numbers."
            />
            <ul className="prose muted" style={{ lineHeight: 2 }}>
              <li>Search</li>
              <li>Creative</li>
              <li>Website conversion</li>
              <li>Paid media</li>
              <li>Measurement</li>
              <li>Reporting</li>
            </ul>
          </div>
        </Container>
      </Section>

      {/* Services */}
      <Section tone="alt">
        <Container>
          <SectionHeader eyebrow="Services" title="Everything You Need to Grow." />
          <QueryState
            isLoading={services.isLoading}
            isError={services.isError}
            isEmpty={!services.data?.length}
          >
            <div className="grid grid-4">
              {services.data?.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
            </div>
          </QueryState>
        </Container>
      </Section>

      {/* Featured work */}
      <Section tone="paper">
        <Container>
          <SectionHeader eyebrow="Selected work" title="Built to create impact." />
          <QueryState
            isLoading={projects.isLoading}
            isError={projects.isError}
            isEmpty={!projects.data?.length}
            emptyMessage="Featured projects will appear here."
          >
            <div className="grid grid-3">
              {projects.data?.map((p) => <ProjectCard key={p.id} project={p} />)}
            </div>
          </QueryState>
          <div style={{ marginTop: 'var(--space-8)' }}>
            <Button as="a" href="/work" variant="text">
              View all work
            </Button>
          </div>
        </Container>
      </Section>

      {/* Case studies */}
      <Section tone="alt">
        <Container>
          <SectionHeader eyebrow="Proof" title="The Proof Is in the Numbers." />
          <QueryState
            isLoading={caseStudies.isLoading}
            isError={caseStudies.isError}
            isEmpty={!caseStudies.data?.length}
            emptyMessage="Case studies will appear here."
          >
            <div className="grid grid-3">
              {caseStudies.data?.map((c) => <CaseStudyCard key={c.id} item={c} />)}
            </div>
          </QueryState>
        </Container>
      </Section>

      {/* Testimonial */}
      <Section tone="paper">
        <Container>
          <Testimonials />
        </Container>
      </Section>
    </>
  );
}
