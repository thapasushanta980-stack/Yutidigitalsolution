import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

// Counts the trailing integer of a value up when it scrolls into view,
// preserving any prefix/suffix (e.g. "+42%", "4", "XX+", "—"). Values with no
// digits (like "—") render unchanged. Respects prefers-reduced-motion.
export function AnimatedNumber({ value, duration = 1200 }: { value: string; duration?: number }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const match = value.match(/(\d[\d,]*)/);
  const target = match ? Number(match[1].replace(/,/g, '')) : null;
  const [display, setDisplay] = useState(() => (target !== null && !reduced ? value.replace(match![1], '0') : value));

  useEffect(() => {
    if (target === null || reduced) {
      setDisplay(value);
      return;
    }
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let started = false;
    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
        const current = Math.round(target * eased).toLocaleString();
        setDisplay(value.replace(match![1], current));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          started = true;
          run();
          obs.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, target, reduced, duration]);

  return (
    <span ref={ref} aria-label={value}>
      {display}
    </span>
  );
}
