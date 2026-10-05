import { Building2, CalendarClock, Layers } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber.js';
import { Reveal } from './Reveal.js';

const FOUNDED = 2021;

const STATS = [
  {
    icon: Building2,
    value: '17+',
    label: 'Brands we work with',
    note: 'Healthcare, education, construction, hospitality, retail and more.',
  },
  {
    icon: CalendarClock,
    value: `${Math.max(1, new Date().getFullYear() - FOUNDED)}+`,
    label: 'Years of experience',
    note: `Growing businesses online since ${FOUNDED}.`,
  },
  {
    icon: Layers,
    value: '8+',
    label: 'Industries served',
    note: 'One team handling design, advertising and video end to end.',
  },
];

/** Plain-language numbers about Yukti: clients, experience, reach. */
export function Stats() {
  return (
    <div className="stats">
      {STATS.map((s, i) => (
        <Reveal key={s.label} delay={i * 0.1}>
          <div className="stat">
            <span className="stat__icon" aria-hidden="true">
              <s.icon size={22} />
            </span>
            <p className="stat__value">
              <AnimatedNumber value={s.value} />
            </p>
            <p className="stat__label">{s.label}</p>
            <p className="stat__note">{s.note}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
