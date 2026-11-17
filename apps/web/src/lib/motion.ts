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

// True while a ready-made page (prerender.mjs) is being taken over by the
// scripts on first load; Seo turns it off once the page is set up.
let readyMadeLoad = false;
export const setReadyMadeLoad = (value: boolean) => {
  readyMadeLoad = value;
};

/**
 * Whether `el` should play its entrance animation. On a ready-made page's first
 * load on phones, content already on screen is left as it is instead of being
 * hidden and animated in again, so it counts as shown straight away. Laptops
 * hide it until the animation starts (.motion-boot in index.html).
 */
export function entranceOK(el: Element | null) {
  if (!el || !readyMadeLoad || document.documentElement.classList.contains('motion-boot')) return true;
  return el.getBoundingClientRect().top >= window.innerHeight;
}

export { gsap, ScrollTrigger };
