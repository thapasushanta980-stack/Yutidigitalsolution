import { pino } from 'pino';
import { env, isProd } from './env.js';

// Structured logging. Sensitive fields are redacted; never log passwords/tokens.
export const logger = pino({
  level: isProd ? 'info' : 'debug',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'passwordHash',
      'token',
      '*.password',
      '*.passwordHash',
    ],
    censor: '[redacted]',
  },
  transport: isProd
    ? undefined
    : { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } },
  base: { app: 'yukti-api', env: env.NODE_ENV },
});
