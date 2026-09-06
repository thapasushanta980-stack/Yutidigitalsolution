import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2 } from 'lucide-react';
import { Section, Container, Button, FormField } from '@yukti/ui';
import { Seo } from '../lib/Seo.js';
import { SectionHeader } from '../components/SectionHeader.js';
import { postData } from '../lib/api.js';
import { useServices } from '../lib/queries.js';

// Client-side schema mirrors the server (server validates again — never trust client only).
const schema = z.object({
  name: z.string().min(2, 'Please enter your full name'),
  company: z.string().optional(),
  email: z.string().email('Enter a valid email address'),
  phone: z
    .string()
    .regex(/^[0-9+()\-\s]*$/, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
  website: z.string().url('Include https:// in your website URL'),
  industry: z.string().optional(),
  budget: z.string().optional(),
  challenge: z.string().min(4, 'Tell us your primary challenge'),
  services: z.array(z.string()).optional(),
  message: z.string().optional(),
  company_website: z.string().max(0).optional(), // honeypot
});
type FormValues = z.infer<typeof schema>;

const BUDGETS = ['< $1k / mo', '$1k–5k / mo', '$5k–10k / mo', '$10k+ / mo', 'Not sure yet'];

export default function FreeGrowthAudit() {
  const { data: services } = useServices();
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { services: [] } });

  const onSubmit = async (values: FormValues) => {
    try {
      await postData('/leads', values);
      setSubmitted(true);
    } catch (err) {
      setError('root', {
        message: err instanceof Error ? err.message : 'Submission failed. Please try again.',
      });
    }
  };

  return (
    <>
      <Seo
        title="Free Growth Audit"
        description="Request a free growth audit. We'll review your website and digital presence and share where the biggest opportunities are."
        path="/free-growth-audit"
      />
      <Section className="page-hero" tone="paper">
        <Container>
          <SectionHeader
            as="h1"
            eyebrow="Free Growth Audit"
            title="See where your growth is hiding."
            intro="Tell us about your brand and we'll review your website, search visibility and paid opportunities — no obligation."
          />
        </Container>
      </Section>

      <Section tone="alt">
        <Container>
          {submitted ? (
            <div className="form-success" role="status">
              <CheckCircle2 size={40} aria-hidden="true" color="var(--color-accent)" />
              <h2>Request received.</h2>
              <p className="muted">
                Thank you — our team will review your details and get back to you shortly. A
                confirmation has been sent to your email.
              </p>
              <Button as="a" href="/">
                Back to home
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ maxWidth: 720 }}>
              {/* Honeypot — visually hidden, must stay empty */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="yk-sr-only"
                {...register('company_website')}
              />

              <div className="form-grid form-grid--2">
                <FormField label="Full name" htmlFor="name" required error={errors.name?.message}>
                  <input id="name" className="yk-input" {...register('name')} />
                </FormField>
                <FormField label="Company" htmlFor="company" error={errors.company?.message}>
                  <input id="company" className="yk-input" {...register('company')} />
                </FormField>
                <FormField label="Email" htmlFor="email" required error={errors.email?.message}>
                  <input id="email" type="email" className="yk-input" {...register('email')} />
                </FormField>
                <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
                  <input id="phone" className="yk-input" {...register('phone')} />
                </FormField>
                <FormField label="Website" htmlFor="website" required error={errors.website?.message}>
                  <input id="website" placeholder="https://" className="yk-input" {...register('website')} />
                </FormField>
                <FormField label="Industry" htmlFor="industry" error={errors.industry?.message}>
                  <input id="industry" className="yk-input" {...register('industry')} />
                </FormField>
              </div>

              <FormField label="Monthly marketing budget" htmlFor="budget" error={errors.budget?.message}>
                <select id="budget" className="yk-select" {...register('budget')}>
                  <option value="">Select a range</option>
                  {BUDGETS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Primary challenge" htmlFor="challenge" required error={errors.challenge?.message}>
                <textarea id="challenge" className="yk-textarea" {...register('challenge')} />
              </FormField>

              {services && services.length > 0 && (
                <FormField label="Services you're interested in" htmlFor="services">
                  <div className="checkbox-grid">
                    {services.map((s) => (
                      <label key={s.id}>
                        <input type="checkbox" value={s.title} {...register('services')} />
                        {s.title}
                      </label>
                    ))}
                  </div>
                </FormField>
              )}

              <FormField label="Anything else?" htmlFor="message" error={errors.message?.message}>
                <textarea id="message" className="yk-textarea" {...register('message')} />
              </FormField>

              {errors.root && (
                <p className="yk-field__error" role="alert">
                  {errors.root.message}
                </p>
              )}

              <Button size="lg" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending…' : 'Request my free audit'}
              </Button>
            </form>
          )}
        </Container>
      </Section>
    </>
  );
}
