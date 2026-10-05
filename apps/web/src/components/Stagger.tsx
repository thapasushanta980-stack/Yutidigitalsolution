import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { gsap, whenMotionOK } from '../lib/motion.js';

// A grid/list whose direct children rise in one after another as the group
// enters the viewport. Use in place of a plain wrapper div.
export function Stagger({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(
    () =>
      whenMotionOK(() => {
        const items = ref.current ? Array.from(ref.current.children) : [];
        if (!items.length) return;
        gsap.from(items, {
          opacity: 0,
          y: 40,
          scale: 0.97,
          duration: 1,
          stagger: 0.1,
          scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
        });
      }),
    [],
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
