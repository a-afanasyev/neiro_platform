/**
 * Общие типы для всей платформы Neiro
 */

// API Response типы
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

// User типы
export type UserRole = 'admin' | 'specialist' | 'supervisor' | 'parent'
export type UserStatus = 'active' | 'suspended' | 'pending'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: UserRole
  status: UserStatus
  timezone: string
  createdAt: Date
  updatedAt: Date
}

// Auth типы
export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthUser extends User {
  // Дополнительные поля для аутентифицированного пользователя
}

// Экспорт для использования в сервисах
export * from './api'
export * from './auth'
export * from './user'
