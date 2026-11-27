import {pageCopies} from '../lib/pageContent.js';
const pageCopy=pageCopies['home'];
import { Clapperboard, Smartphone, Tv } from 'lucide-react';
import { useLayoutEffect, useState } from 'react';
import { Section, Container, Button } from '@yukti/ui';
import { ChannelPlayer } from '../components/ChannelPlayer.js';
import { heroVideos, team } from '../lib/siteContent.js';
import { HeroVideo } from '../components/HeroVideo.js';
import { Seo, organizationJsonLd } from '../lib/Seo.js';
import { Marquee } from '../components/Marquee.js';
import { Reveal } from '../components/Reveal.js';
import { SectionHeader } from '../components/SectionHeader.js';
import { ServiceStack } from '../components/ServiceStack.js';
import { HeroArt } from '../components/HeroArt.js';
import { HeroTitle } from '../components/HeroTitle.js';
import { Stagger } from '../components/Stagger.js';
import { gsap, whenMotionOK } from '../lib/motion.js';
import { QueryState } from '../components/QueryState.js';
import { Stats } from '../components/Stats.js';
import { Testimonials } from '../components/Testimonials.js';
import { Faq, faqJsonLd } from '../components/Faq.js';
import { InsightCard } from '../components/Cards.js';
import {
  useServices,
  useClients,
  useInsights,
  useSiteSettings,
} from '../lib/queries.js';

const HEADLINE = pageCopy.heroHeadline.split(' ');

export default function Home() {
  const { data: settings } = useSiteSettings();
  const services = useServices();
  const clients = useClients();
  const posts = useInsights(3);
  const [videoFailed, setVideoFailed] = useState(false);
  const showVideo = heroVideos.length > 0 && !videoFailed;

  // Hero recedes as the page scrolls: drifts up and softly fades.
  useLayoutEffect(
    () =>
      whenMotionOK(() => {
        gsap.to('.hero__inner', {
          yPercent: -12,
          opacity: 0.1,
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'center top', end: 'bottom top', scrub: true },
        });
      }),
    [],
  );

  return (
    <>
      <Seo
        title={pageCopy.field1}
        description={pageCopy.field2}
        path="/"
        jsonLd={[...organizationJsonLd(), faqJsonLd()]}
      />

      {/* Hero */}
      <Section className={showVideo ? 'hero hero--video' : 'hero'} tone="paper">
        {showVideo && <HeroVideo clips={heroVideos} onError={() => setVideoFailed(true)} />}
        <Container>
          <div className="hero__inner">
          <div className="hero__layout">
          <div className="hero__copy">
          <HeroTitle kicker={pageCopy.heroKicker} words={HEADLINE} highlight={['Growth.']} />
          <Reveal delay={0.1}>
            <p className="lead">
              {pageCopy.field3}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="hero__actions">
              <Button as="a" href="/free-growth-audit" size="lg">
                {pageCopy.field4}</Button>
              <Button as="a" href="/services" variant="secondary" size="lg">
                {pageCopy.field5}</Button>
            </div>
          </Reveal>
          </div>
          {!showVideo && <div className="hero__visual"><HeroArt /></div>}
          </div>
        </div>
        </Container>
      </Section>

      {/* Metrics */}
      <Section tone="ink">
        <Container>
          <Stats />
        </Container>
      </Section>


      {/* Services: stacking deck */}
      <Section tone="paper">
        <Container>
          <SectionHeader eyebrow={pageCopy.field6} title={pageCopy.field7} />
          <QueryState
            isLoading={services.isLoading}
            isError={services.isError}
            isEmpty={!services.data?.length}
          >
            <ServiceStack services={services.data ?? []} />
          </QueryState>
        </Container>
      </Section>

      {/* Trusted brands */}
      <Section tone="paper">
        <Container>
          <SectionHeader eyebrow={pageCopy.field8} title={pageCopy.field9} />
          <QueryState
            isLoading={clients.isLoading}
            isError={clients.isError}
            isEmpty={!clients.data?.length}
            emptyMessage={pageCopy.field10}
          >
            <div className="logo-panel">
              <div className="logo-marquee">
                {[0, 1].map((row) => (
                  <Marquee key={row} speed={row ? 55 : 48} reverse={row === 1}>
                    {(clients.data ?? [])
                      .filter((_, i) => i % 2 === row)
                      .map((c) => (
                        <div key={c.id} className="logo-tile">
                          {c.logoUrl ? <img src={c.logoUrl} alt={c.name} loading="lazy" /> : c.name}
                        </div>
                      ))}
                  </Marquee>
                ))}
              </div>
            </div>
          </QueryState>
        </Container>
      </Section>

      {/* Showreel */}
      <Section tone="paper" className="cinema">
        <Container>
          <div className="cinema__head">
            <SectionHeader
              eyebrow={pageCopy.field11}
              title={pageCopy.field12}
              intro={pageCopy.field13}
            />
            <ul className="cinema__chips">
              <li><Clapperboard size={16} aria-hidden="true" /> {pageCopy.field14}</li>
              <li><Tv size={16} aria-hidden="true" /> {pageCopy.field15}</li>
              <li><Smartphone size={16} aria-hidden="true" /> {pageCopy.field16}</li>
            </ul>
          </div>
          <Reveal>
            <ChannelPlayer channelUrl={settings?.social_youtube} />
          </Reveal>
        </Container>
      </Section>

      <Testimonials />

      <Faq />

      {/* Blog */}
      {!!posts.data?.length && (
        <Section tone="paper">
          <Container>
            <div className="section-split">
              <SectionHeader eyebrow={pageCopy.field17} title={pageCopy.field18} />
              <Button as="a" href="/blog" variant="secondary">
                {pageCopy.field19}</Button>
            </div>
            <Stagger className="grid grid-3 rail">
              {posts.data.map((p) => (
                <InsightCard key={p.id} item={p} />
              ))}
            </Stagger>
          </Container>
        </Section>
      )}

      {/* Founders */}
      <Section tone="paper">
        <Container>
          <SectionHeader eyebrow={pageCopy.field20} title={pageCopy.field21} />
          <Stagger className="grid grid-2 team-grid">
            {team.map((m) => (
              <div key={m.id} className="card card--project">
                <div className="card__media">
                  <img src={m.photo ?? ''} alt={m.name} loading="lazy" />
                </div>
                <div className="card__body">
                  <h3>{m.name}</h3>
                  <p className="muted">{m.role}</p>
                </div>
              </div>
            ))}
          </Stagger>
        </Container>
      </Section>
    </>
  );
}
