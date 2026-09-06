import { Section, Container, Button } from '@yukti/ui';
import { Seo } from '../lib/Seo.js';

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" noindex />
      <Section className="page-hero" tone="paper">
        <Container>
          <p className="eyebrow">404</p>
          <h1>This page couldn't be found.</h1>
          <p className="lead">The page you're looking for may have moved or no longer exists.</p>
          <div style={{ marginTop: 'var(--space-6)' }}>
            <Button as="a" href="/">
              Back to home
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
