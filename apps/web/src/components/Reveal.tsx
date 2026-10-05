import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { gsap, whenMotionOK } from '../lib/motion.js';

// Restrained reveal-on-scroll, driven by GSAP + ScrollTrigger.
// Skipped entirely when the visitor prefers reduced motion.
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(
    () =>
      whenMotionOK(() => {
        gsap.from(ref.current, {
          opacity: 0,
          y: 28,
          delay,
          scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true },
        });
      }),
    [delay],
  );

  return <div ref={ref}>{children}</div>;
}
