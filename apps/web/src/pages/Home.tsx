import { Clapperboard, Smartphone, Tv } from 'lucide-react';
import { useLayoutEffect, useState } from 'react';
import { Section, Container, Button } from '@yukti/ui';
import { ChannelPlayer } from '../components/ChannelPlayer.js';
import { Marquee } from '../components/Marquee.js';
import { heroVideos, team } from '../lib/staticData.js';
import { HeroVideo } from '../components/HeroVideo.js';
import { Seo, organizationJsonLd } from '../lib/Seo.js';
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
import { InsightCard } from '../components/Cards.js';
import {
  useServices,
  useClients,
  useInsights,
  useSiteSettings,
} from '../lib/queries.js';

const HEADLINE = 'Turn Your Digital Presence Into Measurable Growth.'.split(' ');

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
        title="Yukti Digital Solutions | Digital Growth Agency in Biratnagar"
        description="Yukti Digital Solutions is a digital marketing agency in Biratnagar, Nepal, offering SEO, social media management, Meta ads and video production."
        path="/"
        jsonLd={organizationJsonLd()}
      />

      {/* Hero */}
      <Section className={showVideo ? 'hero hero--video' : 'hero'} tone="paper">
        {showVideo && <HeroVideo clips={heroVideos} onError={() => setVideoFailed(true)} />}
        <Container>
          <div className="hero__inner">
          <div className="hero__layout">
          <div className="hero__copy">
          <HeroTitle words={HEADLINE} highlight={['Growth.']} />
          <Reveal delay={0.1}>
            <p className="lead">
              Digital marketing from Biratnagar, Nepal: SEO, social media management, Meta ads and video production to help customers find and choose your business.
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
          <SectionHeader eyebrow="Services" title="Everything You Need to Grow." />
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
          <SectionHeader eyebrow="Clients" title="Trusted by ambitious brands." />
          <QueryState
            isLoading={clients.isLoading}
            isError={clients.isError}
            isEmpty={!clients.data?.length}
            emptyMessage="Client logos will appear here as they are added."
          >
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
          </QueryState>
        </Container>
      </Section>

      {/* Showreel */}
      <Section tone="paper">
        <Container>
          <div className="showcase">
            <div className="showcase__text">
              <SectionHeader
                eyebrow="Watch"
                title="Our work, on screen."
                intro="Motion graphics, brand films and ads, straight from the Yukti studio. Press play and scroll through our latest videos."
              />
              <ul className="showcase__list">
                <li><Clapperboard size={18} aria-hidden="true" /> Motion graphics and brand films</li>
                <li><Tv size={18} aria-hidden="true" /> TVC ads built for screens big and small</li>
                <li><Smartphone size={18} aria-hidden="true" /> Reels and social videos that get watched</li>
              </ul>
              {settings?.social_youtube && (
                <Button as="a" href={settings.social_youtube} target="_blank" rel="noopener noreferrer">
                  Visit our YouTube channel
                </Button>
              )}
            </div>

            <Reveal>
              <ChannelPlayer />
            </Reveal>
          </div>
        </Container>
      </Section>

      <Testimonials />

      {/* Blog */}
      {!!posts.data?.length && (
        <Section tone="paper">
          <Container>
            <div className="section-split">
              <SectionHeader eyebrow="Blog" title="Latest from the blog." />
              <Button as="a" href="/blog" variant="secondary">
                View all articles
              </Button>
            </div>
            <Stagger className="grid grid-3">
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
          <SectionHeader eyebrow="Leadership" title="The people behind Yukti." />
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
