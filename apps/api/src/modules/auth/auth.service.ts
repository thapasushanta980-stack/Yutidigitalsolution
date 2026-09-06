import bcrypt from 'bcryptjs';
import { prisma } from '@yukti/database';
import type { AuthUser } from '@yukti/types';
import { ApiError } from '../../utils/ApiError.js';
import { signToken } from '../../middlewares/auth.js';

// Verifies credentials and returns the auth user + a signed JWT.
// Uses a constant-ish comparison path to avoid user-enumeration timing leaks.
export async function login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });

  // Always run a bcrypt compare to keep timing uniform whether or not the user exists.
  const hash = user?.passwordHash ?? '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinv';
  const valid = await bcrypt.compare(password, hash);

  if (!user || !user.isActive || !valid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const authUser: AuthUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role.name,
  };
  return { user: authUser, token: signToken({ sub: user.id, role: user.role.name }) };
}
