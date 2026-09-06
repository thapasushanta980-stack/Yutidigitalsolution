import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@yukti/database';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../config/logger.js';
import { isProd } from '../config/env.js';

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound('Route not found'));
}

// Centralised error middleware — the single place errors become responses.
// Stack traces are never exposed in production.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  let apiError: ApiError;

  if (err instanceof ApiError) {
    apiError = err;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') apiError = ApiError.conflict('A record with that value already exists');
    else if (err.code === 'P2025') apiError = ApiError.notFound();
    else apiError = ApiError.badRequest('Database request error');
  } else {
    apiError = ApiError.internal();
  }

  if (apiError.statusCode >= 500) {
    logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');
  } else {
    logger.warn({ code: apiError.code, path: req.path }, apiError.message);
  }

  res.status(apiError.statusCode).json({
    success: false,
    error: {
      code: apiError.code,
      message: apiError.message,
      ...(apiError.details ? { details: apiError.details } : {}),
      ...(!isProd && apiError.statusCode >= 500 && err instanceof Error
        ? { stack: err.stack }
        : {}),
    },
  });
}
