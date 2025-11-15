'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: string[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    // Если не авторизован, редирект на логин
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Если указаны разрешенные роли и роль пользователя не входит в список
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      // Редирект на dashboard по умолчанию
      router.push('/dashboard')
    }
  }, [isAuthenticated, user, allowedRoles, router])

  // Показываем контент только если авторизован и имеет нужную роль
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-600">Проверка авторизации...</p>
        </div>
      </div>
    )
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-error mb-2">Доступ запрещен</h2>
          <p className="text-neutral-600">У вас нет прав для доступа к этой странице</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

