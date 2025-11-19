/**
 * Auth Routes
 * 
 * POST /login - аутентификация
 * POST /refresh - обновление токенов
 * POST /logout - выход
 * POST /invite - приглашение пользователя (admin only)
 */

import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validation';
import { loginSchema, refreshSchema, inviteSchema } from '../validators/auth.validators';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * POST /auth/v1/login
 * Аутентификация пользователя
 */
router.post('/login', authRateLimiter, validateRequest(loginSchema), authController.login);

/**
 * POST /auth/v1/refresh
 * Обновление access токена с помощью refresh токена
 */
router.post('/refresh', validateRequest(refreshSchema), authController.refresh);

/**
 * POST /auth/v1/logout
 * Выход из системы (инвалидация refresh токена)
 */
router.post('/logout', authenticateToken, authController.logout);

/**
 * POST /auth/v1/invite
 * Приглашение нового пользователя (только для admin)
 */
router.post(
  '/invite',
  authenticateToken,
  requireRole(['admin']),
  validateRequest(inviteSchema),
  authController.invite
);

/**
 * GET /auth/v1/me
 * Получение информации о текущем пользователе
 */
router.get('/me', authenticateToken, authController.getCurrentUser);

/**
 * POST /auth/v1/dev/hash-password
 * TEMPORARY: Generate bcrypt hash for development (REMOVE IN PRODUCTION)
 */
if (process.env.NODE_ENV !== 'production') {
  router.post('/dev/hash-password', async (req, res) => {
    const bcrypt = require('bcrypt');
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password required' });
    }
    const hash = await bcrypt.hash(password, 12);
    res.json({ password, hash });
  });
}

export default router;

