import { prisma, LeadSource, Prisma } from '@yukti/database';
import { ApiError } from '../../utils/ApiError.js';
import { sendEmail } from '../../utils/email.js';
import { env } from '../../config/env.js';
import type { CreateContactInput, CreateLeadInput, UpdateLeadInput } from './lead.schema.js';

// Create a growth-audit lead. Email notification is fire-and-forget and must
// never prevent the lead from being saved.
export async function createLead(input: CreateLeadInput) {
  if (input.company_website) throw ApiError.badRequest('Spam detected'); // honeypot

  const lead = await prisma.lead.create({
    data: {
      name: input.name,
      company: input.company ?? null,
      email: input.email,
      phone: input.phone ?? null,
      website: input.website,
      industry: input.industry ?? null,
      budget: input.budget ?? null,
      challenge: input.challenge,
      services: input.services ? JSON.stringify(input.services) : null,
      message: input.message ?? null,
      source: LeadSource.GROWTH_AUDIT,
    },
  });

  if (env.MAIL_TO_INTERNAL) {
    sendEmail({
      to: env.MAIL_TO_INTERNAL,
      subject: `New growth audit request — ${lead.name}`,
      text: `New lead:\nName: ${lead.name}\nEmail: ${lead.email}\nWebsite: ${lead.website}\nChallenge: ${lead.challenge}`,
    });
  }
  sendEmail({
    to: lead.email,
    subject: 'We received your growth audit request',
    text: `Hi ${lead.name},\n\nThanks for requesting a free growth audit from Yukti Digital Solutions. Our team will review your website and get back to you shortly.\n\n— Yukti Digital Solutions, Kathmandu`,
  });

  // Public response returns only a confirmation id — never internal fields.
  return { id: lead.id };
}

export async function createContact(input: CreateContactInput) {
  if (input.company_website) throw ApiError.badRequest('Spam detected');
  const submission = await prisma.contactSubmission.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      subject: input.subject ?? null,
      message: input.message,
    },
  });
  if (env.MAIL_TO_INTERNAL) {
    sendEmail({
      to: env.MAIL_TO_INTERNAL,
      subject: `New contact message — ${submission.name}`,
      text: `${submission.name} <${submission.email}>\n\n${submission.message}`,
    });
  }
  return { id: submission.id };
}

// ── Admin ──────────────────────────────────────────────────
interface ListParams {
  status?: string;
  q?: string;
  skip: number;
  take: number;
}

export async function listLeads({ status, q, skip, take }: ListParams) {
  const where: Prisma.LeadWhereInput = {};
  if (status) where.status = status as Prisma.LeadWhereInput['status'];
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { email: { contains: q } },
      { company: { contains: q } },
      { website: { contains: q } },
    ];
  }
  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { assignedTo: { select: { id: true, name: true } } },
    }),
    prisma.lead.count({ where }),
  ]);
  return { items, total };
}

export async function getLead(id: string) {
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { assignedTo: { select: { id: true, name: true } } },
  });
  if (!lead) throw ApiError.notFound('Lead not found');
  return lead;
}

export async function updateLead(id: string, input: UpdateLeadInput) {
  await getLead(id);
  return prisma.lead.update({ where: { id }, data: input });
}

export async function deleteLead(id: string) {
  await getLead(id);
  await prisma.lead.delete({ where: { id } });
}

// Dashboard counts.
export async function stats() {
  const [totalLeads, newLeads, publishedProjects, publishedInsights, services, clients] =
    await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: 'NEW' } }),
      prisma.project.count({ where: { status: 'PUBLISHED' } }),
      prisma.insight.count({ where: { status: 'PUBLISHED' } }),
      prisma.service.count(),
      prisma.client.count(),
    ]);
  return { totalLeads, newLeads, publishedProjects, publishedInsights, services, clients };
}
