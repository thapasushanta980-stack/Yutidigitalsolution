import { Section, Container, Button } from '@yukti/ui';
import { Seo } from '../lib/Seo.js';
import { SectionHeader } from '../components/SectionHeader.js';
import { QueryState } from '../components/QueryState.js';
import { useTeam, useValues, useMetrics, useSiteSettings } from '../lib/queries.js';

export default function About() {
  const team = useTeam();
  const values = useValues();
  const metrics = useMetrics();
  const { data: settings } = useSiteSettings();

  return (
    <>
      <Seo
        title="About"
        description="A growth agency built in Kathmandu, working with brands across South Asia, the Gulf and Australia."
        path="/about"
      />
      <Section className="page-hero" tone="paper">
        <Container>
          <SectionHeader
            as="h1"
            eyebrow="About"
            title="A Growth Agency Built in Kathmandu."
            intro="We help ambitious brands turn digital presence into measurable growth — combining strategy, creativity, technology and performance marketing."
          />
        </Container>
      </Section>

      {/* At a glance */}
      <Section tone="ink">
        <Container>
          <QueryState isLoading={metrics.isLoading} isError={metrics.isError} isEmpty={!metrics.data?.length}>
            <div className="metrics">
              {metrics.data?.map((m) => (
                <div key={m.id} className="metric">
                  <p className="metric__code">{m.code}</p>
                  <p className="metric__value">{m.value}</p>
                  <p className="metric__label">{m.label}</p>
                </div>
              ))}
            </div>
          </QueryState>
        </Container>
      </Section>

      {/* Story */}
      <Section tone="paper">
        <Container>
          <div className="split">
            <SectionHeader eyebrow="Our story" title="Senior hands, plain reporting, real outcomes." />
            <div className="prose muted">
              <p>
                Yukti was built on a simple belief: digital marketing should generate business growth,
                not just attention. We pair senior specialists with clear measurement so you always
                know what worked and why.
              </p>
              <p>
                From our base in Kathmandu, we work with brands across {settings?.coverage ?? 'South Asia, the Gulf and Australia'}.
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
            <div className="grid grid-4">
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
