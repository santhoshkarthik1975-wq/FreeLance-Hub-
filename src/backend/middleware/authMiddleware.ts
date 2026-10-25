import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dataStore } from '../services/store.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'freelance_hub_super_secret_jwt_key_development_2026';

export interface AuthUserPayload {
  userId: string;
  role: 'FREELANCER' | 'COMPANY';
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

export function generateToken(payload: AuthUserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  // Check cookie or Authorization header Bearer token
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in to proceed.',
      code: 'UNAUTHORIZED',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    const user = dataStore.findUserById(decoded.userId);
    if (!user || user.status !== 'ACTIVE') {
      res.status(401).json({
        success: false,
        message: 'Account not found or inactive.',
        code: 'USER_INACTIVE',
      });
      return;
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please log in again.',
      code: 'INVALID_TOKEN',
    });
    return;
  }
}

export function requireRole(allowedRole: 'FREELANCER' | 'COMPANY') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
        code: 'UNAUTHORIZED',
      });
      return;
    }

    if (req.user.role !== allowedRole) {
      res.status(403).json({
        success: false,
        message: `Forbidden: This resource requires ${allowedRole} role privileges.`,
        code: 'FORBIDDEN_ROLE',
      });
      return;
    }

    next();
  };
}
