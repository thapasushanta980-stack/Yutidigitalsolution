import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { pinoHttp } from 'pino-http';
import path from 'node:path';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { globalLimiter } from './middlewares/rateLimit.js';
import { errorHandler, notFoundHandler } from './middlewares/error.js';
import apiRouter from './routes/index.js';
import { seoRouter } from './modules/seo/seo.routes.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);

  // Security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false, // CSP is managed at the web/reverse-proxy layer
    }),
  );

  // CORS — allow only the known frontends, with credentials for cookies.
  const allowedOrigins = [env.FRONTEND_URL, env.ADMIN_URL];
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error('Not allowed by CORS'));
      },
      credentials: true,
    }),
  );

  app.use(compression());
  app.use(express.json({ limit: '1mb' })); // request size limit
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());
  app.use(pinoHttp({ logger }));

  // Static media (local storage driver). In production this is typically a CDN.
  app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)));

  // Health check
  app.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));

  // SEO (served at root, not under /api)
  app.use('/', seoRouter);

  // API
  app.use('/api/v1', globalLimiter, apiRouter);

  // 404 + centralised error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
