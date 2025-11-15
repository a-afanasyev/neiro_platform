'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  role: string
  firstName?: string
  lastName?: string
  phone?: string
  status?: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  clearAuth: () => void
  updateUser: (user: Partial<User>) => void
  setLoading: (isLoading: boolean) => void
  
  // Helpers
  hasRole: (roles: string | string[]) => boolean
  isAdmin: () => boolean
  isSpecialist: () => boolean
  isParent: () => boolean
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      
      setAuth: (user, accessToken, refreshToken) => {
        // Сохраняем в localStorage для интерцептора axios
        if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        }
        
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        })
      },
      
      clearAuth: () => {
        // Очищаем localStorage
        if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        }
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },
      
      updateUser: (userData) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          })
        }
      },
      
      setLoading: (isLoading) => {
        set({ isLoading })
      },
      
      // Helper methods
      hasRole: (roles) => {
        const user = get().user
        if (!user) return false
        
        const roleList = Array.isArray(roles) ? roles : [roles]
        return roleList.includes(user.role)
      },
      
      isAdmin: () => {
        return get().user?.role === 'admin'
      },
      
      isSpecialist: () => {
        const role = get().user?.role
        return role === 'specialist' || role === 'supervisor'
      },
      
      isParent: () => {
        return get().user?.role === 'parent'
      },
    }),
    {
      name: 'neiro-auth-storage',
      storage: createJSONStorage(() => {
        // Используем localStorage только на клиенте
        if (typeof window !== 'undefined') {
          return localStorage
        }
        // На сервере возвращаем заглушку
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      }),
      // Восстанавливаем токены в localStorage при гидратации
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== 'undefined') {
          if (state.accessToken) {
            localStorage.setItem('accessToken', state.accessToken)
          }
          if (state.refreshToken) {
            localStorage.setItem('refreshToken', state.refreshToken)
          }
        }
      },
    }
  )
)

