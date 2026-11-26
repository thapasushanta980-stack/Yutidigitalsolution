import { describe, expect, it } from 'vitest';
import { applyAnalytics, GTM_SNIPPET } from '../../analytics';

const page = '<head><!--analytics--></head>';

describe('analytics tag', () => {
  it('adds the container only when switched on', () => {
    const html = applyAnalytics(page, true);
    expect(html).toContain('https://www.googletagmanager.com/gtm.js?id=GTM-TSSNL2FN');
    expect(html).toContain("gtag('js', new Date());");
    expect(html).not.toContain('<!--analytics-->');
    expect(html.split(GTM_SNIPPET).length).toBe(2);
  });
  it('leaves it out and removes the marker when not switched on', () => {
    const html = applyAnalytics(page, false);
    expect(html).toBe('<head></head>');
  });
});
