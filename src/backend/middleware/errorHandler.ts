import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  console.error('[Error]', err?.message || err);

  if (err instanceof ZodError) {
    const firstIssue = err.issues[0];
    const message = firstIssue ? `${firstIssue.path.join('.')}: ${firstIssue.message}` : 'Validation error';
    res.status(400).json({
      success: false,
      message,
      code: 'VALIDATION_ERROR',
      details: err.issues,
    });
    return;
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';
  const code = err.code || (statusCode === 404 ? 'NOT_FOUND' : statusCode === 403 ? 'FORBIDDEN' : 'SERVER_ERROR');

  res.status(statusCode).json({
    success: false,
    message,
    code,
  });
}
