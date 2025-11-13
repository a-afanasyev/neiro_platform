/**
 * Role-Based Access Control (RBAC) Middleware
 * 
 * Проверка прав доступа на основе ролей пользователя
 */

import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@neiro/types';
import { AppError } from '../utils/AppError';

/**
 * Middleware для проверки роли пользователя
 * @param allowedRoles - массив разрешённых ролей
 */
export function requireRoles(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return next(new AppError('Пользователь не аутентифицирован', 401, 'UNAUTHORIZED'));
    }

    if (!allowedRoles.includes(user.role)) {
      return next(
        new AppError(
          'Недостаточно прав для выполнения операции',
          403,
          'FORBIDDEN'
        )
      );
    }

    next();
  };
}

