import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { gsap, whenMotionOK } from '../lib/motion.js';

interface Props {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  as?: 'h1' | 'h2';
  /** Optional editorial "plate" number, e.g. "01". */
  index?: string;
}

// Editorial section header: a hairline rule that draws across on scroll-in,
// an optional plate number, then the eyebrow / title / intro.
export function SectionHeader({ eyebrow, title, intro, as = 'h2', index }: Props) {
  const Heading = as;
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(
    () =>
      whenMotionOK(() => {
        const q = gsap.utils.selector(root);
        const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 85%', once: true } });
        tl.from(q('.section-header__rule'), { scaleX: 0, transformOrigin: 'left center', duration: 1.1, ease: 'power3.inOut' })
          .from(q('.section-header__index, .eyebrow'), { opacity: 0, y: 12, stagger: 0.08, duration: 0.6 }, '-=0.7')
          .from(q('h1, h2'), { opacity: 0, y: 36, duration: 1 }, '-=0.5')
          .from(q('.lead'), { opacity: 0, y: 20, duration: 0.8 }, '-=0.7');
      }),
    [],
  );

  return (
    <div className="section-header" ref={root}>
      <div className="section-header__top">
        <span className="section-header__rule" />
        {index && <span className="section-header__index">{index}</span>}
      </div>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Heading>{title}</Heading>
      {intro && <p className="lead">{intro}</p>}
    </div>
  );
}
