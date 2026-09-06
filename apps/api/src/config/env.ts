import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

// Load the single root .env regardless of which workspace cwd we run from or
// whether we run from source (tsx) or a bundled dist. Real process env always
// wins (dotenv does not override already-set variables), so production hosts
// that inject env vars work with no .env file present.
const here = path.dirname(fileURLToPath(import.meta.url));
let dir = here;
for (let i = 0; i < 6; i += 1) {
  const candidate = path.join(dir, '.env');
  if (existsSync(candidate)) {
    config({ path: candidate });
    break;
  }
  dir = path.dirname(dir);
}
config(); // also honour cwd/.env and real process env

// Validate environment at boot — fail fast on misconfiguration.
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_NAME: z.string().default('yukti_token'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  ADMIN_URL: z.string().url().default('http://localhost:5174'),
  PUBLIC_SITE_URL: z.string().url().default('http://localhost:5173'),
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.coerce.number().default(5 * 1024 * 1024),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  MAIL_FROM: z.string().default('Yukti <no-reply@yukti.example>'),
  MAIL_TO_INTERNAL: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
