/**
 * Типы пользователей
 */

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


