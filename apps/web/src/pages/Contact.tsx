import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2 } from 'lucide-react';
import { Section, Container, Button, FormField } from '@yukti/ui';
import { Seo } from '../lib/Seo.js';
import { SectionHeader } from '../components/SectionHeader.js';
import { postData } from '../lib/api.js';
import { useSiteSettings } from '../lib/queries.js';

const schema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().optional().or(z.literal('')),
  subject: z.string().optional(),
  message: z.string().min(4, 'Please enter a message'),
  company_website: z.string().max(0).optional(),
});
type FormValues = z.infer<typeof schema>;

export default function Contact() {
  const { data: settings } = useSiteSettings();
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await postData('/contact', values);
      setSubmitted(true);
    } catch (err) {
      setError('root', { message: err instanceof Error ? err.message : 'Something went wrong.' });
    }
  };

  const mapsUrl = settings?.google_maps_url;

  return (
    <>
      <Seo
        title="Contact"
        description="Get in touch with Yukti Digital Solutions in Kathmandu, Nepal."
        path="/contact"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: 'Yukti Digital Solutions',
          address: { '@type': 'PostalAddress', addressLocality: 'Kathmandu', addressCountry: 'NP' },
          email: settings?.email,
          telephone: settings?.phone,
        }}
      />
      <Section className="page-hero" tone="paper">
        <Container>
          <SectionHeader
            as="h1"
            eyebrow="Contact"
            title="Let's talk growth."
            intro={`Yukti Digital Solutions — ${settings?.address ?? 'Kathmandu, Nepal'}. Working with brands across ${settings?.coverage ?? 'South Asia, the Gulf and Australia'}.`}
          />
        </Container>
      </Section>

      <Section tone="alt">
        <Container>
          <div className="split">
            <div>
              <h3>Reach us</h3>
              <ul className="prose muted" style={{ listStyle: 'none', padding: 0 }}>
                {settings?.email && (
                  <li>
                    Email: <a href={`mailto:${settings.email}`}>{settings.email}</a>
                  </li>
                )}
                {settings?.phone && (
                  <li>
                    Phone: <a href={`tel:${settings.phone}`}>{settings.phone}</a>
                  </li>
                )}
                <li>{settings?.address ?? 'Kathmandu, Nepal'}</li>
              </ul>
              {mapsUrl ? (
                <div className="map-embed">
                  <iframe title="Office location" src={mapsUrl} loading="lazy" />
                </div>
              ) : (
                <div className="map-embed" aria-label="Map unavailable">
                  <div className="logo-grid__cell">Map will appear here once configured.</div>
                </div>
              )}
            </div>

            <div>
              {submitted ? (
                <div className="form-success" role="status">
                  <CheckCircle2 size={36} aria-hidden="true" color="var(--color-accent)" />
                  <h3>Message sent.</h3>
                  <p className="muted">Thanks for reaching out — we'll be in touch shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <input
                    type="text"
                    tabIndex={-1}
                    aria-hidden="true"
                    className="yk-sr-only"
                    {...register('company_website')}
                  />
                  <FormField label="Name" htmlFor="c-name" required error={errors.name?.message}>
                    <input id="c-name" className="yk-input" {...register('name')} />
                  </FormField>
                  <FormField label="Email" htmlFor="c-email" required error={errors.email?.message}>
                    <input id="c-email" type="email" className="yk-input" {...register('email')} />
                  </FormField>
                  <FormField label="Subject" htmlFor="c-subject" error={errors.subject?.message}>
                    <input id="c-subject" className="yk-input" {...register('subject')} />
                  </FormField>
                  <FormField label="Message" htmlFor="c-message" required error={errors.message?.message}>
                    <textarea id="c-message" className="yk-textarea" {...register('message')} />
                  </FormField>
                  {errors.root && (
                    <p className="yk-field__error" role="alert">
                      {errors.root.message}
                    </p>
                  )}
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending…' : 'Send message'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
