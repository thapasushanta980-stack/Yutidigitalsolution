import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface Props {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  as?: 'h1' | 'h2';
  /** Optional editorial "plate" number, e.g. "01". */
  index?: string;
}

// Editorial section header: a hairline "plate divider" that draws across on
// scroll-in (the signature page-turn cue), an optional plate number, then the
// eyebrow / title / intro.
export function SectionHeader({ eyebrow, title, intro, as = 'h2', index }: Props) {
  const reduced = useReducedMotion();
  const Heading = as;
  return (
    <div className="section-header">
      <div className="section-header__top">
        {reduced ? (
          <span className="section-header__rule" />
        ) : (
          <motion.span
            className="section-header__rule"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
        {index && <span className="section-header__index">{index}</span>}
      </div>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Heading>{title}</Heading>
      {intro && <p className="lead">{intro}</p>}
    </div>
  );
}
