import { useEffect, useState } from 'react';
import { Logo } from '@yukti/ui';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Page-wide effects: scroll progress bar, cursor spotlight, card tilt. */
export function Effects() {
  useEffect(() => {
    const bar = document.getElementById('yk-progress');
    const glow = document.getElementById('yk-cursor');
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.transform = `scaleX(${h > 0 ? window.scrollY / h : 0})`;
    };
    const onMove = (e: PointerEvent) => {
      if (glow) {
        glow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        glow.style.opacity = '1';
      }
      // 3D tilt on cards
      const card = (e.target as HTMLElement | null)?.closest?.('.card, .logo-grid__cell') as HTMLElement | null;
      if (card && !reduced()) {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ry', `${x * 8}deg`);
        card.style.setProperty('--rx', `${-y * 8}deg`);
        card.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
        card.style.setProperty('--my', `${(y + 0.5) * 100}%`);
      }
    };
    const onLeave = (e: PointerEvent) => {
      const card = (e.target as HTMLElement | null)?.closest?.('.card, .logo-grid__cell') as HTMLElement | null;
      card?.style.setProperty('--rx', '0deg');
      card?.style.setProperty('--ry', '0deg');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerout', onLeave as EventListener);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerout', onLeave as EventListener);
    };
  }, []);

  return (
    <>
      <div id="yk-progress" className="yk-progress" aria-hidden="true" />
      <div id="yk-cursor" className="yk-cursor" aria-hidden="true" />
    </>
  );
}

/** One-time branded intro on first visit of a session. */
export function IntroSplash() {
  const [show, setShow] = useState(() => {
    try {
      return !sessionStorage.getItem('yk-intro') && !reduced();
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!show) return;
    try {
      sessionStorage.setItem('yk-intro', '1');
    } catch {
      /* ignore */
    }
    document.documentElement.classList.add('is-intro');
    const t = setTimeout(() => {
      setShow(false);
      document.documentElement.classList.remove('is-intro');
    }, 2300);
    return () => {
      clearTimeout(t);
      document.documentElement.classList.remove('is-intro');
    };
  }, [show]);

  if (!show) return null;
  return (
    <div className="intro" aria-hidden="true">
      <div className="intro__orb intro__orb--a" />
      <div className="intro__orb intro__orb--b" />
      <div className="intro__logo">
        <Logo animated height={64} title="" />
      </div>
      <p className="intro__tag">DESIGN&nbsp;&nbsp;|&nbsp;&nbsp;ADVERTISE&nbsp;&nbsp;|&nbsp;&nbsp;VISUALISE</p>
      <div className="intro__bar">
        <span />
      </div>
    </div>
  );
}
