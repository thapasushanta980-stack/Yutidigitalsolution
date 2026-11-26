import type { Plugin } from 'vite';

// Google Tag Manager container for the public website (snippet exactly as supplied).
// It is OFF unless the build sets YUKTI_ANALYTICS=on, so review builds, local builds and
// tests never carry it. Only the public website's build turns it on. When off, the marker
// is simply removed.
export const GTM_SNIPPET = `<!-- Google tag (Tag Manager container GTM-TSSNL2FN) -->
    <script async src="https://www.googletagmanager.com/gtm.js?id=GTM-TSSNL2FN"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
    </script>`;

export function applyAnalytics(html: string, on: boolean): string {
  return html.replace('<!--analytics-->', on ? GTM_SNIPPET : '');
}

export function analytics(): Plugin {
  return {
    name: 'yukti-analytics',
    transformIndexHtml: { order: 'pre', handler: (html) => applyAnalytics(html, process.env.YUKTI_ANALYTICS === 'on') },
  };
}
