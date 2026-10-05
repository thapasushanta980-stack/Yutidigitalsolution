import { Clapperboard, Smartphone, Tv } from 'lucide-react';
import { useLayoutEffect } from 'react';
import { Section, Container, Button } from '@yukti/ui';
import { ChannelPlayer } from '../components/ChannelPlayer.js';
import { Marquee } from '../components/Marquee.js';
import { team } from '../lib/staticData.js';
import { Seo, organizationJsonLd } from '../lib/Seo.js';
import { Reveal } from '../components/Reveal.js';
import { SectionHeader } from '../components/SectionHeader.js';
import { GrowthModel } from '../components/GrowthModel.js';
import { ServiceStack } from '../components/ServiceStack.js';
import { Capabilities } from '../components/Capabilities.js';
import { ServiceMarquee } from '../components/ServiceMarquee.js';
import { HeroArt } from '../components/HeroArt.js';
import { HeroTitle } from '../components/HeroTitle.js';
import { Stagger } from '../components/Stagger.js';
import { gsap, whenMotionOK } from '../lib/motion.js';
import { QueryState } from '../components/QueryState.js';
import { Stats } from '../components/Stats.js';
import {
  useServices,
  useClients,
  useSiteSettings,
} from '../lib/queries.js';

const HEADLINE = 'Turn Your Digital Presence Into Measurable Growth.'.split(' ');
const TICKER = ['Social Media Marketing', 'Video Production', 'TVC Ads', 'Meta Ads', 'SEO', 'Web Design', 'Content Marketing', 'Branding'];

const PILLARS = [
  { title: 'Search', text: 'Be found by customers already looking for you.' },
  { title: 'Creative', text: 'Design and video that make your brand stand out.' },
  { title: 'Website conversion', text: 'Turn visitors into enquiries and sales.' },
  { title: 'Paid media', text: 'Meta ads that reach the right people at the right cost.' },
  { title: 'Measurement', text: 'Track every result so you know what works.' },
  { title: 'Reporting', text: 'Clear, simple reports with no jargon.' },
];

export default function Home() {
  const { data: settings } = useSiteSettings();
  const services = useServices();
  const clients = useClients();

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
      <Section className="hero" tone="paper">
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
          <div className="hero__visual"><HeroArt /></div>
          </div>
        </div>
        </Container>
      </Section>

      <Capabilities />
      <ServiceMarquee items={TICKER} />

      {/* Services: stacking deck */}
      <Section tone="paper">
        <Container>
          <SectionHeader index="01" eyebrow="Services" title="Everything You Need to Grow." />
          <QueryState
            isLoading={services.isLoading}
            isError={services.isError}
            isEmpty={!services.data?.length}
          >
            <ServiceStack services={services.data ?? []} />
          </QueryState>
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

      {/* Metrics */}
      <Section tone="ink">
        <Container>
          <Stats />
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
            <div className="pillars">
              {PILLARS.map((p, i) => (
                <Reveal key={p.title} delay={i * 0.07}>
                  <div className="pillar">
                    <span className="pillar__no">0{i + 1}</span>
                    <h3>{p.title}</h3>
                    <p>{p.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Showreel */}
      <Section tone="paper">
        <Container>
          <div className="showcase">
            <div className="showcase__text">
              <SectionHeader
                index="02"
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

      {/* Founders */}
      <Section tone="paper">
        <Container>
          <SectionHeader index="03" eyebrow="Leadership" title="The people behind Yukti." />
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
