import type { Request, Response } from 'express';
import * as leadService from './lead.service.js';
import { ok, created, parsePagination, paginationMeta } from '../../utils/http.js';
import { recordAudit } from '../../utils/audit.js';

// ── Public ──────────────────────────────────────────────────
export async function createLead(req: Request, res: Response) {
  return created(res, await leadService.createLead(req.body));
}
export async function createContact(req: Request, res: Response) {
  return created(res, await leadService.createContact(req.body));
}

// ── Admin ───────────────────────────────────────────────────
export async function listLeads(req: Request, res: Response) {
  const { page, pageSize, skip, take } = parsePagination(req, 20, 50);
  const { items, total } = await leadService.listLeads({
    status: req.query.status as string | undefined,
    q: req.query.q as string | undefined,
    skip,
    take,
  });
  return ok(res, items, paginationMeta(page, pageSize, total));
}
export async function getLead(req: Request, res: Response) {
  return ok(res, await leadService.getLead(req.params.id));
}
export async function updateLead(req: Request, res: Response) {
  const lead = await leadService.updateLead(req.params.id, req.body);
  await recordAudit({ userId: req.user?.id, action: 'UPDATED', entity: 'LEAD', entityId: lead.id });
  return ok(res, lead);
}
export async function deleteLead(req: Request, res: Response) {
  await leadService.deleteLead(req.params.id);
  await recordAudit({ userId: req.user?.id, action: 'DELETED', entity: 'LEAD', entityId: req.params.id });
  return ok(res, { id: req.params.id });
}
export async function stats(_req: Request, res: Response) {
  return ok(res, await leadService.stats());
}
