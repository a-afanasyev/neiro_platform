import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, requireRole } from '../../middleware/auth';
import { UnauthorizedError } from '../../middleware/errorHandler';

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    mockResponse = {};
    nextFunction = jest.fn();
  });

  describe('authenticate', () => {
    it('should pass valid token', async () => {
      const token = jwt.sign(
        { userId: 'test-user-id', email: 'test@test.com', role: 'parent' },
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: '1h' }
      );

      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      await authenticate(mockRequest as any, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
      expect((mockRequest as any).user).toBeDefined();
      expect((mockRequest as any).user.userId).toBe('test-user-id');
    });

    it('should reject missing authorization header', async () => {
      await authenticate(mockRequest as any, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should reject malformed authorization header', async () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat token'
      };

      await authenticate(mockRequest as any, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should reject invalid token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid.token.here'
      };

      await authenticate(mockRequest as any, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should reject expired token', async () => {
      const token = jwt.sign(
        { userId: 'test-user-id', email: 'test@test.com', role: 'parent' },
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: '-1h' } // Expired 1 hour ago
      );

      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      await authenticate(mockRequest as any, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });

  describe('requireRole', () => {
    beforeEach(() => {
      mockResponse.status = jest.fn().mockReturnThis();
      mockResponse.json = jest.fn();
    });

    it('should allow user with correct role', () => {
      mockRequest.user = {
        userId: 'test-user-id',
        email: 'test@test.com',
        role: 'parent'
      };

      const middleware = requireRole('parent');
      middleware(mockRequest as any, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should allow user with any of allowed roles', () => {
      mockRequest.user = {
        userId: 'test-user-id',
        email: 'test@test.com',
        role: 'specialist'
      };

      const middleware = requireRole('parent', 'specialist', 'admin');
      middleware(mockRequest as any, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should reject user without required role', () => {
      mockRequest.user = {
        userId: 'test-user-id',
        email: 'test@test.com',
        role: 'parent'
      };

      const middleware = requireRole('specialist', 'admin');
      middleware(mockRequest as any, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'FORBIDDEN',
          message: 'Insufficient permissions'
        })
      });
    });

    it('should reject when user is not set', () => {
      const middleware = requireRole('parent');
      middleware(mockRequest as any, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });
  });
});
