// Writes every page as ready-made HTML after `vite build` (run by `npm run build`).
// Search engines then see each page's title, H1, links and text without running
// JavaScript, and visitors see the page before the scripts finish loading.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, 'dist');
const ssrDir = join(root, 'dist-ssr');

const { render, prerenderPaths } = await import(pathToFileURL(join(ssrDir, 'entry-server.js')).href);
const template = await readFile(join(dist, 'index.html'), 'utf8');

// React warns that layout effects do not run on the server; that is expected here.
const consoleError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('useLayoutEffect does nothing on the server')) return;
  consoleError(...args);
};

const json = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

for (const path of prerenderPaths) {
  const { html, head, state } = await render(path);
  const page = template
    // The page's own title, description, canonical and structured data replace the defaults.
    .replace(/<!--seo-->[\s\S]*?<!--\/seo-->/, head)
    .replace(
      '<div id="root"></div>',
      `<div id="root" data-path="${path}">${html}</div>` +
        // Served for an unknown URL (the server's fallback page): drop this
        // page's markup so it never shows under the wrong address.
        `<script>!function(r){if(r.dataset.path!==(location.pathname.replace(/\\/+$/,'')||'/'))r.innerHTML=''}(document.getElementById('root'))</script>` +
        `<script>window.__RQ__=${json(state)}</script>`,
    );
  if (!page.includes('data-path=')) throw new Error(`Could not place the page markup for ${path}`);
  // /about is served from about/index.html or about.html, depending on the server.
  const files = path === '/' ? ['index.html'] : [`${path.slice(1)}/index.html`, `${path.slice(1)}.html`];
  for (const file of files) {
    await mkdir(dirname(join(dist, file)), { recursive: true });
    await writeFile(join(dist, file), page);
  }
}

await rm(ssrDir, { recursive: true, force: true });
console.log(`Prerendered ${prerenderPaths.length} pages.`);
