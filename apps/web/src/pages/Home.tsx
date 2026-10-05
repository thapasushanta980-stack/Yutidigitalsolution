import { BarChart3, Clapperboard, FileText, Smartphone, Tv, MousePointerClick, Palette, Search, Target } from 'lucide-react';
import { Section, Container, Button } from '@yukti/ui';
import { ChannelPlayer } from '../components/ChannelPlayer.js';
import { CameraHUD } from '../components/CameraHUD.js';
import { Marquee } from '../components/Marquee.js';
import { team } from '../lib/staticData.js';
import { Seo, organizationJsonLd } from '../lib/Seo.js';
import { Reveal } from '../components/Reveal.js';
import { SectionHeader } from '../components/SectionHeader.js';
import { GrowthModel } from '../components/GrowthModel.js';
import { ServiceCard } from '../components/Cards.js';
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
  { icon: Search, title: 'Search', text: 'Be found by customers already looking for you.' },
  { icon: Palette, title: 'Creative', text: 'Design and video that make your brand stand out.' },
  { icon: MousePointerClick, title: 'Website conversion', text: 'Turn visitors into enquiries and sales.' },
  { icon: Target, title: 'Paid media', text: 'Meta ads that reach the right people at the right cost.' },
  { icon: BarChart3, title: 'Measurement', text: 'Track every result so you know what works.' },
  { icon: FileText, title: 'Reporting', text: 'Clear, simple reports with no jargon.' },
];

export default function Home() {
  const { data: settings } = useSiteSettings();
  const services = useServices();
  const clients = useClients();

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
        <CameraHUD />
        <span className="hero__orb hero__orb--a" aria-hidden="true" />
        <span className="hero__orb hero__orb--b" aria-hidden="true" />
        <span className="hero__orb hero__orb--c" aria-hidden="true" />
        <span className="hero__shape hero__shape--ring" aria-hidden="true" />
        <span className="hero__shape hero__shape--square" aria-hidden="true" />
        <span className="hero__shape hero__shape--dot" aria-hidden="true" />
        <span className="hero__shape hero__shape--cross" aria-hidden="true" />
        <Container>
          <Reveal delay={0.05}>
            <h1 className="hero__title" aria-label="Turn Your Digital Presence Into Measurable Growth.">
              {HEADLINE.map((w, i) => (
                <span key={i} className="word" aria-hidden="true">
                  <span style={{ ['--i' as string]: i }} className={w === 'Growth.' ? 'accent-underline' : undefined}>
                    {w}&nbsp;
                  </span>
                </span>
              ))}
            </h1>
          </Reveal>
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

      <div className="ribbons" aria-hidden="true">
        <div className="ribbon ribbon--gold">
          <Marquee speed={34}>
            {TICKER.map((t) => (
              <span key={t} className="ribbon__item">
                {t}
                <i />
              </span>
            ))}
          </Marquee>
        </div>
        <div className="ribbon ribbon--blue">
          <Marquee speed={40} reverse>
            {[...TICKER].reverse().map((t) => (
              <span key={t} className="ribbon__item">
                {t}
                <i />
              </span>
            ))}
          </Marquee>
        </div>
      </div>

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
                    <span className="pillar__icon" aria-hidden="true">
                      <p.icon size={22} />
                    </span>
                    <h3>{p.title}</h3>
                    <p>{p.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Services */}
      <Section tone="alt">
        <Container>
          <SectionHeader index="01" eyebrow="Services" title="Everything You Need to Grow." />
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
          <div className="grid grid-2 team-grid">
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
          </div>
        </Container>
      </Section>
    </>
  );
}
