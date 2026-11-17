import { Writable } from 'node:stream';
import { StrictMode } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { QueryClient, QueryClientProvider, dehydrate, type DehydratedState } from '@tanstack/react-query';
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async';
import App from './App.js';

export { prerenderPaths } from './lib/sitePaths.js';

// Build-time only (see prerender.mjs): renders one page to HTML so search
// engines and first paint get the full page without waiting for JavaScript.

function renderOnce(url: string, queryClient: QueryClient) {
  const helmetContext: { helmet?: HelmetServerState } = {};
  return new Promise<{ html: string; helmet: HelmetServerState }>((resolve, reject) => {
    let html = '';
    const sink = new Writable({
      write(chunk, _encoding, done) {
        html += chunk;
        done();
      },
    });
    sink.on('finish', () => resolve({ html, helmet: helmetContext.helmet! }));
    const stream = renderToPipeableStream(
      <StrictMode>
        <HelmetProvider context={helmetContext}>
          <QueryClientProvider client={queryClient}>
            <StaticRouter location={url}>
              <App />
            </StaticRouter>
          </QueryClientProvider>
        </HelmetProvider>
      </StrictMode>,
      { onAllReady: () => stream.pipe(sink), onShellError: reject, onError: reject },
    );
  });
}

export async function render(url: string): Promise<{ html: string; head: string; state: DehydratedState }> {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  // Queries do not run during a server render, so render, load whatever the
  // page asked for, and render again until nothing new is requested.
  let result = await renderOnce(url, queryClient);
  for (let pass = 0; pass < 4; pass++) {
    const pending = queryClient.getQueryCache().getAll().filter((q) => q.state.status === 'pending');
    if (!pending.length) break;
    await Promise.all(pending.map((q) => q.fetch().catch(() => undefined)));
    result = await renderOnce(url, queryClient);
  }
  const { helmet } = result;
  const head = [helmet.title, helmet.meta, helmet.link, helmet.script].map((part) => part.toString()).join('');
  return { html: result.html, head, state: dehydrate(queryClient) };
}
