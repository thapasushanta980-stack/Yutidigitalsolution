import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, FormField } from '@yukti/ui';
import type { SiteSettings } from '@yukti/types';
import { get, put } from '../lib/api.js';

// Human labels for known keys; unknown keys still render with their raw key.
const LABELS: Record<string, string> = {
  company_name: 'Company name',
  tagline: 'Tagline',
  email: 'Email',
  phone: 'Phone',
  address: 'Address',
  coverage: 'Coverage',
  social_instagram: 'Instagram URL',
  social_facebook: 'Facebook URL',
  social_linkedin: 'LinkedIn URL',
  social_youtube: 'YouTube URL',
  social_tiktok: 'TikTok URL',
  social_x: 'X (Twitter) URL',
  google_maps_url: 'Google Maps embed URL',
  seo_title: 'SEO title',
  seo_description: 'SEO description',
  footer_note: 'Footer note',
};

export function Settings() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['admin-settings'], queryFn: () => get<SiteSettings>('/admin/settings') });
  const [form, setForm] = useState<SiteSettings>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const mutation = useMutation({
    mutationFn: () => put<SiteSettings>('/admin/settings', { settings: form }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const keys = Object.keys(form).length ? Object.keys(form) : Object.keys(LABELS);

  return (
    <div>
      <h1>Site Settings</h1>
      <p className="muted">Company info, SEO defaults, and social links used across the public site.</p>
      <div className="admin-card">
        <div className="form-grid form-grid--2">
          {keys.map((k) => (
            <FormField key={k} label={LABELS[k] ?? k} htmlFor={`set-${k}`}>
              <input
                id={`set-${k}`}
                className="yk-input"
                value={form[k] ?? ''}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              />
            </FormField>
          ))}
        </div>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : saved ? 'Saved ✓' : 'Save settings'}
        </Button>
      </div>
    </div>
  );
}
