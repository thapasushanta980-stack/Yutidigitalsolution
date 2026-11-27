import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';
import { ApiError } from '../utils/ApiError.js';

// Bound collection work before Zod can accumulate per-element issues.
export function withinValidationBudget(input: unknown): boolean {
  const stack: {value: unknown; depth: number}[] = [{value: input, depth: 0}];
  let nodes = 0;
  while (stack.length) {
    const {value, depth} = stack.pop()!;
    if (++nodes > 5000 || depth > 16) return false;
    if (Array.isArray(value)) {
      if (value.length > 200) return false;
      for (const child of value) stack.push({value: child, depth: depth + 1});
    } else if (value && typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length > 250) return false;
      for (const key of keys) stack.push({value: (value as Record<string, unknown>)[key], depth: depth + 1});
    }
  }
  return true;
}

interface Schemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

// Validates and COERCES request parts. Parsed values replace the originals so
// downstream handlers receive typed, sanitised data.
export const validate =
  (schemas: Schemas) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      for (const value of [req.params, req.query, req.body]) {
        if (!withinValidationBudget(value)) {
          return next(ApiError.validation([{path: '', message: 'Input collection exceeds validation limits'}]));
        }
      }
      if (schemas.params) req.params = schemas.params.parse(req.params);
      if (schemas.query) Object.assign(req.query, schemas.query.parse(req.query));
      if (schemas.body) req.body = schemas.body.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(
          ApiError.validation(
            err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
          ),
        );
      } else {
        next(err);
      }
    }
  };
