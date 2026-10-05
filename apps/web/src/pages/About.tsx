import { Section, Container, Button } from '@yukti/ui';
import { Seo } from '../lib/Seo.js';
import { SectionHeader } from '../components/SectionHeader.js';
import { QueryState } from '../components/QueryState.js';
import { useTeam, useValues } from '../lib/queries.js';
import { Stats } from '../components/Stats.js';

export default function About() {
  const team = useTeam();
  const values = useValues();

  return (
    <>
      <Seo
        title="About"
        description="A digital marketing agency based in Biratnagar, Nepal."
        path="/about"
      />
      <Section className="page-hero" tone="paper">
        <Container>
          <SectionHeader
            as="h1"
            eyebrow="About"
            title="One-Stop Solutions for Digital Marketing."
            intro="End-to-end solutions to bring your company's digital presence into existence. We DESIGN | ADVERTISE | VISUALISE."
          />
        </Container>
      </Section>

      {/* At a glance */}
      <Section tone="ink">
        <Container>
          <Stats />
        </Container>
      </Section>

      {/* Story */}
      <Section tone="paper">
        <Container>
          <div className="split">
            <SectionHeader eyebrow="Our story" title="Founded in 2021. Built on experience." />
            <div className="prose muted">
              <p className="dropcap">
                Yukti Digital Solutions is a Business Intelligence Agency offering one-stop solutions
                for all digital marketing services. We are experienced in SEO (Search Engine
                Optimization), Social Media Marketing, Web Design, Content Marketing and Advertising,
                with core expertise across various languages and platforms.
              </p>
              <p>
                Founded in 2021, Yukti provides a wide spectrum of technology solutions and services
                to a diverse customer base. The promoters of the company have years of experience in
                technology and enterprises.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Values */}
      <Section tone="alt">
        <Container>
          <SectionHeader eyebrow="What we stand for" title="Principles that shape the work." />
          <QueryState isLoading={values.isLoading} isError={values.isError} isEmpty={!values.data?.length}>
            <div className="grid grid-4">
              {values.data?.map((v, i) => (
                <div key={v.id} className="card card--service">
                  <span className="card__index">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{v.title}</h3>
                  <p className="muted">{v.description}</p>
                </div>
              ))}
            </div>
          </QueryState>
        </Container>
      </Section>

      {/* Team */}
      <Section tone="paper">
        <Container>
          <SectionHeader eyebrow="Team" title="The people behind the work." />
          <QueryState
            isLoading={team.isLoading}
            isError={team.isError}
            isEmpty={!team.data?.length}
            emptyMessage="Team profiles will appear here."
          >
            <div className="grid grid-2 team-grid">
              {team.data?.map((m) => (
                <div key={m.id} className="card card--project">
                  <div className="card__media">
                    {m.photo ? (
                      <img src={m.photo} alt={m.name} loading="lazy" />
                    ) : (
                      <div className="card__media-placeholder" aria-hidden="true" />
                    )}
                  </div>
                  <div className="card__body">
                    <h3>{m.name}</h3>
                    <p className="muted">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </QueryState>
        </Container>
      </Section>

      <Section tone="ink">
        <Container>
          <SectionHeader title="Let's build measurable growth together." />
          <Button as="a" href="/free-growth-audit" size="lg">
            Get Your Free Growth Audit
          </Button>
        </Container>
      </Section>
    </>
  );
}
