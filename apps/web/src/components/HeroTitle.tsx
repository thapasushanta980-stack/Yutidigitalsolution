import { Fragment, useLayoutEffect, useRef } from 'react';
import { gsap, whenMotionOK } from '../lib/motion.js';

interface Props {
  /** Plain headline words. */
  words: string[];
  /** Words (exact match) drawn in the highlight style with an underline stroke. */
  highlight?: string[];
}

// Headline that rises word by word out of a mask, then draws a hand-drawn
// underline under the highlighted word. Hovering or tapping that word sends a
// ripple through its letters and redraws the underline. The full sentence is
// exposed once via aria-label.
export function HeroTitle({ words, highlight = [] }: Props) {
  const root = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(
    () =>
      whenMotionOK(() => {
        const q = gsap.utils.selector(root);
        const h1 = root.current!;
        const path = q('.hl-line path');

        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
        tl.from(q('.hw > span'), { yPercent: 115, rotate: 3, duration: 1.1, stagger: 0.09 })
          .from(path, { strokeDashoffset: 1, duration: 0.9, ease: 'power2.inOut' }, '-=0.3')
          // Once settled, let letters move above the mask during the hover ripple.
          .add(() => h1.classList.add('is-ready'));

        const word = q('.hl-word')[0];
        const chars = q('.hl-ch');
        const ripple = () => {
          if (!h1.classList.contains('is-ready')) return;
          gsap.fromTo(
            chars,
            { y: 0 },
            { y: -14, duration: 0.22, ease: 'power2.out', stagger: 0.045, yoyo: true, repeat: 1, overwrite: true },
          );
          gsap.fromTo(path, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut', overwrite: true });
        };
        word?.addEventListener('pointerenter', ripple);
        return () => word?.removeEventListener('pointerenter', ripple);
      }),
    [],
  );

  return (
    <h1 ref={root} className="hero__title" aria-label={words.join(' ')}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="hw" aria-hidden="true">
            {highlight.includes(w) ? (
              <span className="hl-word">
                {Array.from(w).map((c, j) => (
                  <span key={j} className="hl-ch">
                    {c}
                  </span>
                ))}
                <svg className="hl-line" viewBox="0 0 200 14" preserveAspectRatio="none" focusable="false">
                  <path d="M4 9 C 40 3, 90 12, 130 6 S 185 4, 196 8" pathLength="1" />
                </svg>
              </span>
            ) : (
              <span>{w}</span>
            )}
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </Fragment>
      ))}
    </h1>
  );
}
