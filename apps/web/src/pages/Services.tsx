import { Section, Container } from '@yukti/ui';
import { Stagger } from '../components/Stagger.js';
import { Seo } from '../lib/Seo.js';
import { SectionHeader } from '../components/SectionHeader.js';
import { ServiceCard } from '../components/Cards.js';
import { QueryState } from '../components/QueryState.js';
import { useServices } from '../lib/queries.js';

export default function Services() {
  const { data, isLoading, isError } = useServices();
  return (
    <>
      <Seo
        title="Services"
        description="Explore Yukti's SEO, social media marketing, Meta ads, video production and TVC services from our team in Biratnagar, Nepal."
        path="/services"
      />
      <Section className="page-hero" tone="paper">
        <Container>
          <SectionHeader
            as="h1"
            eyebrow="Services"
            title="Everything You Need to Grow."
            intro="Strategy, creative, technology and performance marketing, integrated to compound results."
          />
        </Container>
      </Section>
      <Section tone="alt">
        <Container>
          <QueryState isLoading={isLoading} isError={isError} isEmpty={!data?.length}>
            <Stagger className="grid grid-3">
              {data?.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
            </Stagger>
          </QueryState>
        </Container>
      </Section>
    </>
  );
}
