import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider, hydrate, type DehydratedState } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.js';
import { setReadyMadeLoad } from './lib/motion.js';
import '@yukti/config/tokens.css';
import '@yukti/ui/styles.css';
import './index.css';
import './components/components.css';
import './editorial.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
  },
});

declare global {
  interface Window {
    /** Page data written into ready-made pages by prerender.mjs. */
    __RQ__?: DehydratedState;
  }
}

const app = (
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);

// Ready-made pages (prerender.mjs) already contain the markup: attach to it.
const container = document.getElementById('root')!;
if (window.__RQ__) hydrate(queryClient, window.__RQ__);
if (container.hasChildNodes()) {
  setReadyMadeLoad(true);
  ReactDOM.hydrateRoot(container, app);
} else {
  ReactDOM.createRoot(container).render(app);
}
