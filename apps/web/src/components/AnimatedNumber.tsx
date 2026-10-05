import { useLayoutEffect, useRef } from 'react';
import { gsap, whenMotionOK } from '../lib/motion.js';

// Counts the first integer in a value up when it scrolls into view, keeping any
// prefix/suffix (e.g. "17+", "+42%"). Values with no digits render unchanged.
export function AnimatedNumber({ value, duration = 1.6 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const match = value.match(/(\d[\d,]*)/);
    const el = ref.current;
    if (!match || !el) return;
    const target = Number(match[1].replace(/,/g, ''));
    const withCommas = match[1].includes(',');
    const counter = { n: 0 };
    return whenMotionOK(() => {
      const render = () => {
        const v = Math.round(counter.n);
        el.textContent = value.replace(match[1], withCommas ? v.toLocaleString() : String(v));
      };
      render();
      gsap.to(counter, {
        n: target,
        duration,
        ease: 'power2.out',
        onUpdate: render,
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      });
    });
  }, [value, duration]);

  return (
    <span ref={ref} aria-label={value}>
      {value}
    </span>
  );
}
