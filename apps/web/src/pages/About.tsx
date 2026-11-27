import {pageCopies} from '../lib/pageContent.js';
const pageCopy=pageCopies['about'];
import { Section, Container, Button } from '@yukti/ui';
import { Stagger } from '../components/Stagger.js';
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
        title={pageCopy.field1}
        description={pageCopy.field2}
        path="/about"
      />
      <Section className="page-hero" tone="paper">
        <Container>
          <SectionHeader
            as="h1"
            eyebrow={pageCopy.field3}
            title={pageCopy.field4}
            intro={pageCopy.field5}
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
            <SectionHeader eyebrow={pageCopy.field6} title={pageCopy.field7} />
            <div className="prose muted">
              <p className="dropcap">
                {pageCopy.field8}</p>
              <p>
                {pageCopy.field9}</p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Values */}
      <Section tone="alt">
        <Container>
          <SectionHeader eyebrow={pageCopy.field10} title={pageCopy.field11} />
          <QueryState isLoading={values.isLoading} isError={values.isError} isEmpty={!values.data?.length}>
            <Stagger className="grid grid-4">
              {values.data?.map((v) => (
                <div key={v.id} className="card card--service">
                  <h3>{v.title}</h3>
                  <p className="muted">{v.description}</p>
                </div>
              ))}
            </Stagger>
          </QueryState>
        </Container>
      </Section>

      {/* Team */}
      <Section tone="paper">
        <Container>
          <SectionHeader eyebrow={pageCopy.field12} title={pageCopy.field13} />
          <QueryState
            isLoading={team.isLoading}
            isError={team.isError}
            isEmpty={!team.data?.length}
            emptyMessage={pageCopy.field14}
          >
            <Stagger className="grid grid-2 team-grid">
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
            </Stagger>
          </QueryState>
        </Container>
      </Section>

      <Section tone="ink">
        <Container>
          <SectionHeader title={pageCopy.field15} />
          <Button as="a" href="/free-growth-audit" size="lg">
            {pageCopy.field16}</Button>
        </Container>
      </Section>
    </>
  );
}
