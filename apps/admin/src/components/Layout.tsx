import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  Briefcase,
  FolderKanban,
  BarChart3,
  Quote,
  Building2,
  Users,
  FileText,
  Image,
  Settings,
  LogOut,
} from 'lucide-react';
import { Logo } from '@yukti/ui';
import { useAuth } from '../lib/auth.js';

const NAV = [
  ['', 'Dashboard', LayoutDashboard],
  ['leads', 'Leads', Inbox],
  ['services', 'Services', Briefcase],
  ['projects', 'Projects', FolderKanban],
  ['case-studies', 'Case Studies', BarChart3],
  ['insights', 'Insights', FileText],
  ['testimonials', 'Testimonials', Quote],
  ['clients', 'Clients', Building2],
  ['team', 'Team', Users],
  ['metrics', 'Metrics', BarChart3],
  ['media', 'Media', Image],
  ['settings', 'Settings', Settings],
] as const;

export function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <Logo variant="light" height={22} title="Yukti" />
          <span className="admin-logo__tag">Admin</span>
        </div>
        <nav>
          {NAV.map(([path, label, Icon]) => (
            <NavLink
              key={path}
              to={`/${path}`}
              end={path === ''}
              className={({ isActive }) => `admin-navlink ${isActive ? 'is-active' : ''}`}
            >
              <Icon size={17} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-user">
          <div>
            <strong>{user?.name}</strong>
            <span className="muted">{user?.role}</span>
          </div>
          <button onClick={() => logout()} aria-label="Log out" className="nav__icon">
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
