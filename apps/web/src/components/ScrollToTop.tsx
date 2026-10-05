import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollTrigger } from '../lib/motion.js';

// Scroll to top on route change, and keep GSAP ScrollTrigger positions correct
// as async content (data, images, fonts) changes the page height.
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  useEffect(() => {
    let t: number | undefined;
    const refresh = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    };
    const ro = new ResizeObserver(refresh);
    ro.observe(document.body);
    return () => {
      window.clearTimeout(t);
      ro.disconnect();
    };
  }, []);

  return null;
}
