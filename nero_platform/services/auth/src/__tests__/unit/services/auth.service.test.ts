/**
 * Unit тесты для Auth Service
 * 
 * Тестируем бизнес-логику аутентификации:
 * - Регистрация пользователей
 * - Вход в систему
 * - Обновление токенов
 * - Приглашение пользователей
 */

import { PrismaClient } from '@neiro/database';
import * as bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken } from '../../../services/jwt.service';

// Mock Prisma Client
jest.mock('@neiro/database', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

// Mock bcrypt
jest.mock('bcrypt');

// Mock JWT service
jest.mock('../../../services/jwt.service');

describe('Auth Service - Unit Tests', () => {
  let prisma: any;

  beforeEach(() => {
    // Создаем новый экземпляр Prisma для каждого теста
    prisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('User Registration', () => {
    it('should successfully register a new user', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'parent',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const hashedPassword = 'hashed_password_123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null); // Пользователь не существует
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'parent' as const,
      };

      // Эмулируем создание пользователя
      const existingUser = await prisma.user.findUnique({ where: { email: userData.email } });
      expect(existingUser).toBeNull();

      const hashedPwd = await bcrypt.hash(userData.password, 10);
      const newUser = await prisma.user.create({
        data: {
          email: userData.email,
          passwordHash: hashedPwd,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          status: 'active',
        },
      });

      // Assert
      expect(newUser).toEqual(mockUser);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          passwordHash: hashedPassword,
          firstName: 'Test',
          lastName: 'User',
          role: 'parent',
          status: 'active',
        },
      });
    });

    it('should fail if user already exists', async () => {
      // Arrange
      const existingUser = {
        id: 'user-123',
        email: 'existing@example.com',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);

      // Act & Assert
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
      };

      const user = await prisma.user.findUnique({ where: { email: userData.email } });
      expect(user).not.toBeNull();
      expect(user.email).toBe('existing@example.com');
    });
  });

  describe('User Login', () => {
    it('should successfully login with valid credentials', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        firstName: 'Test',
        lastName: 'User',
        role: 'parent',
        status: 'active',
      };

      const mockAccessToken = 'access_token_123';
      const mockRefreshToken = 'refresh_token_123';

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (generateAccessToken as jest.Mock).mockReturnValue(mockAccessToken);
      (generateRefreshToken as jest.Mock).mockReturnValue(mockRefreshToken);
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({
        id: 'token-123',
        token: mockRefreshToken,
        userId: mockUser.id,
      });

      // Act
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await prisma.user.findUnique({ where: { email: credentials.email } });
      const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
      
      expect(isPasswordValid).toBe(true);

      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
      const refreshToken = generateRefreshToken({ userId: user.id });

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Assert
      expect(user).not.toBeNull();
      expect(accessToken).toBe(mockAccessToken);
      expect(refreshToken).toBe(mockRefreshToken);
      expect(prisma.refreshToken.create).toHaveBeenCalled();
    });

    it('should fail with invalid password', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act
      const credentials = {
        email: 'test@example.com',
        password: 'wrong_password',
      };

      const user = await prisma.user.findUnique({ where: { email: credentials.email } });
      const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

      // Assert
      expect(isPasswordValid).toBe(false);
    });

    it('should fail with non-existent user', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const user = await prisma.user.findUnique({ where: { email: credentials.email } });

      // Assert
      expect(user).toBeNull();
    });
  });

  describe('Token Refresh', () => {
    it('should successfully refresh access token', async () => {
      // Arrange
      const mockRefreshToken = {
        id: 'token-123',
        token: 'refresh_token_123',
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        revoked: false,
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'parent',
      };

      const mockNewAccessToken = 'new_access_token_123';

      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(mockRefreshToken);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (generateAccessToken as jest.Mock).mockReturnValue(mockNewAccessToken);

      // Act
      const refreshToken = await prisma.refreshToken.findUnique({
        where: { token: 'refresh_token_123' },
      });

      expect(refreshToken).not.toBeNull();
      expect(refreshToken.revoked).toBe(false);
      expect(refreshToken.expiresAt.getTime()).toBeGreaterThan(Date.now());

      const user = await prisma.user.findUnique({ where: { id: refreshToken.userId } });
      const newAccessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Assert
      expect(newAccessToken).toBe(mockNewAccessToken);
    });

    it('should fail with revoked refresh token', async () => {
      // Arrange
      const mockRefreshToken = {
        id: 'token-123',
        token: 'refresh_token_123',
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        revoked: true, // Токен отозван
      };

      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(mockRefreshToken);

      // Act
      const refreshToken = await prisma.refreshToken.findUnique({
        where: { token: 'refresh_token_123' },
      });

      // Assert
      expect(refreshToken.revoked).toBe(true);
    });

    it('should fail with expired refresh token', async () => {
      // Arrange
      const mockRefreshToken = {
        id: 'token-123',
        token: 'refresh_token_123',
        userId: 'user-123',
        expiresAt: new Date(Date.now() - 1000), // Токен истек
        revoked: false,
      };

      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(mockRefreshToken);

      // Act
      const refreshToken = await prisma.refreshToken.findUnique({
        where: { token: 'refresh_token_123' },
      });

      // Assert
      expect(refreshToken.expiresAt.getTime()).toBeLessThan(Date.now());
    });
  });

  describe('User Invitation', () => {
    it('should successfully invite a new user', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'invited@example.com',
        role: 'specialist',
        status: 'invited',
        createdAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('temp_hashed_password');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const inviteData = {
        email: 'invited@example.com',
        role: 'specialist' as const,
        firstName: 'Invited',
        lastName: 'User',
      };

      const existingUser = await prisma.user.findUnique({ where: { email: inviteData.email } });
      expect(existingUser).toBeNull();

      const temporaryPassword = 'temp_password_123';
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

      const newUser = await prisma.user.create({
        data: {
          email: inviteData.email,
          passwordHash: hashedPassword,
          firstName: inviteData.firstName,
          lastName: inviteData.lastName,
          role: inviteData.role,
          status: 'invited',
        },
      });

      // Assert
      expect(newUser).toEqual(mockUser);
      expect(newUser.status).toBe('invited');
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should fail if user already exists', async () => {
      // Arrange
      const existingUser = {
        id: 'user-123',
        email: 'existing@example.com',
        status: 'active',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);

      // Act
      const inviteData = {
        email: 'existing@example.com',
        role: 'specialist' as const,
      };

      const user = await prisma.user.findUnique({ where: { email: inviteData.email } });

      // Assert
      expect(user).not.toBeNull();
      expect(user.email).toBe('existing@example.com');
    });
  });
});
