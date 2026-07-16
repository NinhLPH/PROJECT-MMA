import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { HttpError } from '../utils/http-error';

interface TokenPayload extends JwtPayload {
  role?: 'customer' | 'admin';
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authorization = req.header('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      throw new HttpError(401, 'Bearer token is required');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET environment variable is required');

    const token = authorization.slice('Bearer '.length).trim();
    const payload = jwt.verify(token, secret) as TokenPayload;
    if (!payload.sub || (payload.role !== 'customer' && payload.role !== 'admin')) {
      throw new HttpError(401, 'Invalid authentication token');
    }

    req.auth = { userId: payload.sub, role: payload.role };
    next();
  } catch (error) {
    if (error instanceof HttpError) return next(error);
    if (error instanceof jwt.TokenExpiredError) return next(new HttpError(401, 'Authentication token has expired'));
    if (error instanceof jwt.JsonWebTokenError) return next(new HttpError(401, 'Invalid authentication token'));
    next(error);
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (req.auth?.role !== 'admin') return next(new HttpError(403, 'Admin access is required'));
  next();
}
