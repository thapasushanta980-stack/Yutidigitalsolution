import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Single GSAP entry point. House easing: long, soft deceleration.
gsap.defaults({ ease: 'power3.out', duration: 0.9 });

/** Run `setup` only when the visitor has not asked for reduced motion. */
export function whenMotionOK(setup: () => void | (() => void)) {
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', setup);
  return () => mm.revert();
}

export { gsap, ScrollTrigger };
