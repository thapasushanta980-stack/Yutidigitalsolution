import { useLayoutEffect, useRef } from 'react';
import { gsap, whenMotionOK } from '../lib/motion.js';

// One-line services ticker driven by GSAP. Slows to a stop on hover/focus so
// it stays readable. With reduced motion it falls back to a static wrapped
// list (same markup, no movement).
export function ServiceMarquee({ items }: { items: string[] }) {
  const track = useRef<HTMLDivElement>(null);

  useLayoutEffect(
    () =>
      whenMotionOK(() => {
        const el = track.current;
        if (!el) return;
        const loop = gsap.to(el, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
        const slow = () => gsap.to(loop, { timeScale: 0, duration: 0.6, overwrite: true });
        const resume = () => gsap.to(loop, { timeScale: 1, duration: 0.6, overwrite: true });
        const root = el.parentElement!;
        root.addEventListener('mouseenter', slow);
        root.addEventListener('mouseleave', resume);
        root.addEventListener('focusin', slow);
        root.addEventListener('focusout', resume);
        return () => {
          root.removeEventListener('mouseenter', slow);
          root.removeEventListener('mouseleave', resume);
          root.removeEventListener('focusin', slow);
          root.removeEventListener('focusout', resume);
        };
      }),
    [],
  );

  const group = (hidden?: boolean) => (
    <ul className="svc-marquee__group" aria-hidden={hidden || undefined}>
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );

  return (
    <div className="svc-marquee" aria-label="Services we offer" role="region">
      <div className="svc-marquee__track" ref={track}>
        {group()}
        {group(true)}
      </div>
    </div>
  );
}
