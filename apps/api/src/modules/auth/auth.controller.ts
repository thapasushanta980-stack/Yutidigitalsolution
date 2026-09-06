import type { CookieOptions, Request, Response } from 'express';
import * as authService from './auth.service.js';
import { env, isProd } from '../../config/env.js';
import { ok } from '../../utils/http.js';
import { recordAudit } from '../../utils/audit.js';

function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProd, // HTTPS-only in production
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const { user, token } = await authService.login(email, password);
  res.cookie(env.COOKIE_NAME, token, cookieOptions());
  await recordAudit({ userId: user.id, action: 'LOGIN', entity: 'USER', entityId: user.id, ipAddress: req.ip });
  return ok(res, { user });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie(env.COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
  return ok(res, { message: 'Logged out' });
}

export async function me(req: Request, res: Response) {
  return ok(res, { user: req.user });
}
