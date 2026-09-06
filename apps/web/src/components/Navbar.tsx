import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, Search as SearchIcon } from 'lucide-react';
import { Container, Button, Logo } from '@yukti/ui';
import { MobileMenu } from './MobileMenu.js';
import { SearchOverlay } from './SearchOverlay.js';

const NAV = [
  { label: 'Services', href: '/services' },
  { label: 'Work', href: '/work' },
  { label: 'Case Studies', href: '/case-studies' },
  { label: 'About', href: '/about' },
  { label: 'Insights', href: '/insights' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
        <Container>
          <div className="nav__inner">
            <Link to="/" className="nav__logo" aria-label="Yukti Digital Solutions — home">
              <Logo animated height={26} />
            </Link>

            <nav className="nav__links" aria-label="Primary">
              {NAV.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="nav__actions">
              <button
                type="button"
                className="nav__icon"
                aria-label="Open search"
                onClick={() => setSearchOpen(true)}
              >
                <SearchIcon size={18} aria-hidden="true" />
              </button>
              <Button as="a" href="/free-growth-audit" size="sm" className="nav__cta">
                Free Growth Audit
              </Button>
              <button
                type="button"
                className="nav__icon nav__burger"
                aria-label="Open menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(true)}
              >
                <Menu size={22} aria-hidden="true" />
              </button>
            </div>
          </div>
        </Container>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} items={NAV} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
