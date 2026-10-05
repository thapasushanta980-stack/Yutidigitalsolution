import { PrismaClient, RoleName } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

// Production bootstrap: never seed, delete, or overwrite CMS content/users.
const prisma = new PrismaClient();
async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.endsWith('.example') ||
      !password || password.length < 16 || password === 'ChangeMe!2026') {
    throw new Error('Set a real SEED_ADMIN_EMAIL and unique SEED_ADMIN_PASSWORD (at least 16 characters)');
  }
  if (await prisma.user.findUnique({ where: { email } })) {
    throw new Error('User already exists; bootstrap will not change its password or role');
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.$transaction(async (tx) => {
    for (const name of Object.values(RoleName)) {
      await tx.role.upsert({ where: { name }, update: {}, create: { name } });
    }
    const role = await tx.role.findUniqueOrThrow({ where: { name: RoleName.SUPER_ADMIN } });
    await tx.user.create({ data: {
      email, passwordHash, roleId: role.id,
      name: process.env.SEED_ADMIN_NAME || 'Yukti Admin',
    } });
  });
  console.log('Administrator created; no CMS content was changed.');
}
main().catch(() => {
  console.error('Admin bootstrap failed. Check input, database connectivity, and whether the user already exists.');
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
