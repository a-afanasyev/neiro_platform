import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@neiro/types';
import { AppError } from '../utils/AppError';

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return next(new AppError('Пользователь не аутентифицирован', 401, 'UNAUTHORIZED'));
    }

    if (!allowedRoles.includes(user.role)) {
      return next(new AppError('Недостаточно прав', 403, 'FORBIDDEN'));
    }

    next();
  };
}

