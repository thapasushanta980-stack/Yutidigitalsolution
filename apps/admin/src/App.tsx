import { Navigate, Route, Routes } from 'react-router-dom';
import { Spinner } from '@yukti/ui';
import { useAuth } from './lib/auth.js';
import { Login } from './pages/Login.js';
import { Layout } from './components/Layout.js';
import { Dashboard } from './pages/Dashboard.js';
import { Leads } from './pages/Leads.js';
import { LeadDetail } from './pages/LeadDetail.js';
import { ServicesCms } from './pages/ServicesCms.js';
import { Placeholder } from './pages/Placeholder.js';

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
        <Route path="projects" element={<Placeholder title="Projects" endpoint="projects" />} />
        <Route path="case-studies" element={<Placeholder title="Case Studies" endpoint="case-studies" />} />
        <Route path="insights" element={<Placeholder title="Insights" endpoint="insights" />} />
        <Route path="testimonials" element={<Placeholder title="Testimonials" endpoint="testimonials" />} />
        <Route path="clients" element={<Placeholder title="Clients" endpoint="clients" />} />
        <Route path="team" element={<Placeholder title="Team" endpoint="team" />} />
        <Route path="metrics" element={<Placeholder title="Metrics" endpoint="metrics" />} />
        <Route path="media" element={<Placeholder title="Media" endpoint="media" />} />
        <Route path="settings" element={<Placeholder title="Settings" endpoint="settings" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
