/**
 * Типы для аутентификации и авторизации
 */

export type UserRole = 'parent' | 'specialist' | 'supervisor' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'invited';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserSession;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface InviteUserRequest {
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

