import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button, Logo } from '@yukti/ui';

interface Props {
  open: boolean;
  onClose: () => void;
  items: { label: string; href: string }[];
}

export function MobileMenu({ open, onClose, items }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Escape to close + lock body scroll + focus management.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="mobile-menu__head">
            <Logo height={26} />
            <button ref={closeRef} className="nav__icon" aria-label="Close menu" onClick={onClose}>
              <X size={22} aria-hidden="true" />
            </button>
          </div>
          <nav className="mobile-menu__links" aria-label="Mobile">
            {items.map((item, i) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i + 0.1 }}
              >
                <Link to={item.href} onClick={onClose}>
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </nav>
          <div className="mobile-menu__foot">
            <Button as="a" href="/free-growth-audit" onClick={onClose}>
              Get Your Free Growth Audit
            </Button>
            <p className="muted">Kathmandu, Nepal</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
