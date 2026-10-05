import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { ScrollToTop } from './components/ScrollToTop.js';
import { Spinner } from '@yukti/ui';

// Route-level code splitting.
const Home = lazy(() => import('./pages/Home.js'));
const About = lazy(() => import('./pages/About.js'));
const Services = lazy(() => import('./pages/Services.js'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail.js'));
const Work = lazy(() => import('./pages/Work.js'));
const WorkDetail = lazy(() => import('./pages/WorkDetail.js'));
const CaseStudies = lazy(() => import('./pages/CaseStudies.js'));
const CaseStudyDetail = lazy(() => import('./pages/CaseStudyDetail.js'));
const Insights = lazy(() => import('./pages/Insights.js'));
const InsightDetail = lazy(() => import('./pages/InsightDetail.js'));
const Contact = lazy(() => import('./pages/Contact.js'));
const FreeGrowthAudit = lazy(() => import('./pages/FreeGrowthAudit.js'));
const Legal = lazy(() => import('./pages/Legal.js'));
const NotFound = lazy(() => import('./pages/NotFound.js'));

export default function App() {
  return (
    <>
      <a className="yk-skip-link" href="#main">
        Skip to content
      </a>
      <ScrollToTop />
      <Navbar />
      <main id="main">
        <Suspense
          fallback={
            <div className="state">
              <Spinner label="Loading page" />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />
            <Route path="/work" element={<Work />} />
            <Route path="/work/:slug" element={<WorkDetail />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/case-studies/:slug" element={<CaseStudyDetail />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/insights/:slug" element={<InsightDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/free-growth-audit" element={<FreeGrowthAudit />} />
            <Route path="/privacy" element={<Legal kind="privacy" />} />
            <Route path="/terms" element={<Legal kind="terms" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
