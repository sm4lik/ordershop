import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Auth middleware: No authorization header');
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const token = authHeader.substring(7);
    console.log('Auth middleware: Token received, verifying...');
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string };

    req.user = decoded;
    console.log('Auth middleware: User authenticated:', req.user);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Неверный токен' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Недостаточно прав' });
    }

    next();
  };
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('OptionalAuth: Authorization header:', authHeader ? 'present' : 'missing');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('OptionalAuth: Token received, verifying...');
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string };
      req.user = decoded;
      console.log('OptionalAuth: User authenticated:', req.user);
    } else {
      console.log('OptionalAuth: No valid token, proceeding as guest');
    }
    next();
  } catch (error) {
    console.log('OptionalAuth: Token verification failed, proceeding as guest');
    next();
  }
};
