import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Pages that already are the booking flow; the bar would only repeat them.
const HIDDEN_ON = ['/free-growth-audit', '/contact'];

/**
 * Phones only (hidden by CSS above 767px): a slim bar pinned to the bottom of
 * the screen with the main call to action. It appears once the visitor
 * scrolls past the first screen and steps aside while the footer, which has
 * its own call to action, is in view.
 */
export function MobileCta() {
  const { pathname } = useLocation();
  const [pastHero, setPastHero] = useState(false);
  const [footerInView, setFooterInView] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  useEffect(() => {
    const footer = document.querySelector('.footer');
    if (!footer) return;
    const io = new IntersectionObserver(([entry]) => setFooterInView(entry.isIntersecting));
    io.observe(footer);
    return () => io.disconnect();
  }, [pathname]);

  if (HIDDEN_ON.includes(pathname)) return null;
  const visible = pastHero && !footerInView;

  return (
    <div className={`mobile-cta${visible ? ' is-visible' : ''}`} aria-hidden={!visible}>
      <Link to="/free-growth-audit" className="mobile-cta__btn" tabIndex={visible ? 0 : -1}>
        <span>
          <strong>Free Growth Audit</strong>
          <small>Book a free 30-minute call</small>
        </span>
        <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </div>
  );
}
