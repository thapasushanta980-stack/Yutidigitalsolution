import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { SearchResults } from '@yukti/types';
import { fetchData } from '../lib/api.js';

interface Props {
  open: boolean;
  onClose: () => void;
}

const EMPTY: SearchResults = { services: [], work: [], caseStudies: [], insights: [] };

export function SearchOverlay({ open, onClose }: Props) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    inputRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Debounced search.
  useEffect(() => {
    if (!q.trim()) {
      setResults(EMPTY);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        setResults(await fetchData<SearchResults>('/search', { q }));
      } catch {
        setResults(EMPTY);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const groups: [string, string, { title: string; slug: string }[]][] = [
    ['Services', '/services', results.services],
    ['Work', '/work', results.work],
    ['Case Studies', '/case-studies', results.caseStudies],
    ['Insights', '/insights', results.insights],
  ];
  const hasResults = groups.some(([, , items]) => items.length > 0);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="search"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <div className="search__panel">
            <div className="search__bar">
              <input
                ref={inputRef}
                type="search"
                className="yk-input"
                placeholder="Search services, work, case studies, insights…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Search query"
              />
              <button className="nav__icon" aria-label="Close search" onClick={onClose}>
                <X size={22} aria-hidden="true" />
              </button>
            </div>
            <div className="search__results">
              {loading && <p className="muted">Searching…</p>}
              {!loading && q && !hasResults && <p className="muted">No results for “{q}”.</p>}
              {groups.map(([label, base, items]) =>
                items.length ? (
                  <div key={label} className="search__group">
                    <h4 className="fig-label">{label}</h4>
                    <ul>
                      {items.map((item) => (
                        <li key={item.slug}>
                          <Link to={`${base}/${item.slug}`} onClick={onClose}>
                            {item.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null,
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
