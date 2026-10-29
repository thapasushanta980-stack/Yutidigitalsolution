import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { gsap, whenMotionOK } from '../lib/motion.js';

interface Props {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  as?: 'h1' | 'h2';
}

// Editorial section header: eyebrow / title / intro, revealed on scroll-in.
export function SectionHeader({ eyebrow, title, intro, as = 'h2' }: Props) {
  const Heading = as;
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(
    () =>
      whenMotionOK(() => {
        const q = gsap.utils.selector(root);
        const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 85%', once: true } });
        tl.from(q('.eyebrow'), { opacity: 0, y: 12, duration: 0.6 })
          .from(q('h1, h2'), { opacity: 0, y: 36, duration: 1 }, '-=0.5')
          .from(q('.lead'), { opacity: 0, y: 20, duration: 0.8 }, '-=0.7');
      }),
    [],
  );

  return (
    <div className="section-header" ref={root}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Heading>{title}</Heading>
      {intro && <p className="lead">{intro}</p>}
    </div>
  );
}
