import type { NextFunction, Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';
import { HttpError } from '../utils/http-error';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new HttpError(404, `Route ${req.method} ${req.originalUrl} was not found`));
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  if (error instanceof MongooseError.ValidationError || error instanceof MongooseError.CastError) {
    res.status(400).json({ error: error.message });
    return;
  }

  if (error instanceof SyntaxError && typeof (error as { status?: unknown }).status === 'number') {
    res.status(400).json({ error: 'Invalid JSON request body' });
    return;
  }

  if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: number }).code === 11000) {
    res.status(409).json({ error: 'A record with those unique values already exists' });
    return;
  }

  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
}
