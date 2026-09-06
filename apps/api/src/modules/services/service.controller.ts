import type { Request, Response } from 'express';
import * as svc from './service.service.js';
import { ok, created } from '../../utils/http.js';
import { recordAudit } from '../../utils/audit.js';

export async function listPublic(_req: Request, res: Response) {
  return ok(res, await svc.listPublic());
}
export async function getPublicBySlug(req: Request, res: Response) {
  return ok(res, await svc.getPublicBySlug(req.params.slug));
}
export async function listAll(_req: Request, res: Response) {
  return ok(res, await svc.listAll());
}
export async function getById(req: Request, res: Response) {
  return ok(res, await svc.getById(req.params.id));
}
export async function create(req: Request, res: Response) {
  const service = await svc.create(req.body);
  await recordAudit({ userId: req.user?.id, action: 'CREATED', entity: 'SERVICE', entityId: service.id });
  return created(res, service);
}
export async function update(req: Request, res: Response) {
  const service = await svc.update(req.params.id, req.body);
  await recordAudit({ userId: req.user?.id, action: 'UPDATED', entity: 'SERVICE', entityId: service.id });
  return ok(res, service);
}
export async function remove(req: Request, res: Response) {
  await svc.remove(req.params.id);
  await recordAudit({ userId: req.user?.id, action: 'DELETED', entity: 'SERVICE', entityId: req.params.id });
  return ok(res, { id: req.params.id });
}
