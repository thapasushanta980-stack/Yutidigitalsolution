import { Navigate, Route, Routes } from 'react-router-dom';
import { Spinner } from '@yukti/ui';
import { useAuth } from './lib/auth.js';
import { Login } from './pages/Login.js';
import { Layout } from './components/Layout.js';
import { Dashboard } from './pages/Dashboard.js';
import { Leads } from './pages/Leads.js';
import { LeadDetail } from './pages/LeadDetail.js';
import { ServicesCms } from './pages/ServicesCms.js';
import { Settings } from './pages/Settings.js';
import { Media } from './pages/Media.js';
import {
  ProjectsCms,
  CaseStudiesCms,
  InsightsCms,
  TestimonialsCms,
  ClientsCms,
  TeamCms,
  MetricsCms,
} from './pages/resources.js';

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="admin-center">
        <Spinner label="Loading" />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="leads" element={<Leads />} />
        <Route path="leads/:id" element={<LeadDetail />} />
        <Route path="services" element={<ServicesCms />} />
        <Route path="projects" element={<ProjectsCms />} />
        <Route path="case-studies" element={<CaseStudiesCms />} />
        <Route path="insights" element={<InsightsCms />} />
        <Route path="testimonials" element={<TestimonialsCms />} />
        <Route path="clients" element={<ClientsCms />} />
        <Route path="team" element={<TeamCms />} />
        <Route path="metrics" element={<MetricsCms />} />
        <Route path="media" element={<Media />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
