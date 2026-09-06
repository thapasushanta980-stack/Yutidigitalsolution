import { z } from 'zod';

// Public growth-audit submission. Required: name, email, website, challenge.
export const createLeadSchema = z.object({
  name: z.string().min(2).max(120),
  company: z.string().max(160).optional().nullable(),
  email: z.string().email(),
  phone: z
    .string()
    .max(40)
    .regex(/^[0-9+()\-\s]*$/, 'Invalid phone number')
    .optional()
    .nullable(),
  website: z.string().url('Enter a valid URL including https://'),
  industry: z.string().max(120).optional().nullable(),
  budget: z.string().max(80).optional().nullable(),
  challenge: z.string().min(4).max(2000),
  services: z.array(z.string().max(80)).max(20).optional(),
  message: z.string().max(4000).optional().nullable(),
  // honeypot — must be empty (basic spam trap)
  company_website: z.string().max(0).optional(),
});

// Public contact submission (reuses secure lead pipeline).
export const createContactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z
    .string()
    .max(40)
    .regex(/^[0-9+()\-\s]*$/)
    .optional()
    .nullable(),
  subject: z.string().max(160).optional().nullable(),
  message: z.string().min(4).max(4000),
  company_website: z.string().max(0).optional(),
});

// Admin-side updates — status, assignment, internal notes.
export const updateLeadSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST']).optional(),
  internalNote: z.string().max(4000).optional().nullable(),
  assignedToId: z.string().optional().nullable(),
});

export const leadQuerySchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST']).optional(),
  q: z.string().max(120).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(50).optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
