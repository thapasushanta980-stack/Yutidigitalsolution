import { render, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { describe, it, expect } from 'vitest';
import { Seo } from '../lib/Seo.js';

describe('landing SEO metadata', () => {
  it('uses the production canonical instead of the test/browser host', async () => {
    render(<HelmetProvider><Seo title="Services" description="Our services" path="/services" /></HelmetProvider>);
    await waitFor(() => expect(document.querySelector('link[rel="canonical"]'))
      .toHaveAttribute('href', 'https://yuktids.com/services'));
  });

  it('clears noindex when navigating from an error to a published page', async () => {
    const { rerender } = render(<HelmetProvider><Seo title="Not found" noindex /></HelmetProvider>);
    await waitFor(() => expect(document.querySelector('meta[name="robots"]'))
      .toHaveAttribute('content', 'noindex, follow'));
    rerender(<HelmetProvider><Seo title="Home" path="/" /></HelmetProvider>);
    await waitFor(() => expect(document.querySelector('meta[name="robots"]'))
      .toHaveAttribute('content', 'index, follow'));
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://yuktids.com/');
  });
});
