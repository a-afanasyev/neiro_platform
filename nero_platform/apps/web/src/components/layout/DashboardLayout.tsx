'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { authApi } from '@/lib/api'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, clearAuth } = useAuth()

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearAuth()
      router.push('/login')
    }
  }

  const getNavItems = () => {
    if (!user) return []

    const baseItems = [
      { href: '/dashboard', label: 'Главная', icon: '🏠' },
    ]

    if (user.role === 'admin') {
      return [
        ...baseItems,
        { href: '/dashboard/users', label: 'Пользователи', icon: '👥' },
        { href: '/dashboard/children', label: 'Дети', icon: '👶' },
        { href: '/dashboard/specialists', label: 'Специалисты', icon: '👨‍⚕️' },
        { href: '/dashboard/diagnostics', label: 'Диагностика', icon: '📋' },
        { href: '/dashboard/settings', label: 'Настройки', icon: '⚙️' },
      ]
    }

    if (user.role === 'specialist' || user.role === 'supervisor') {
      return [
        ...baseItems,
        { href: '/dashboard/children', label: 'Мои дети', icon: '👶' },
        { href: '/dashboard/diagnostics', label: 'Диагностика', icon: '📋' },
        { href: '/dashboard/routes', label: 'Маршруты', icon: '🗺️' },
        { href: '/dashboard/exercises', label: 'Упражнения', icon: '🎯' },
        { href: '/dashboard/reports', label: 'Отчеты', icon: '📊' },
      ]
    }

    if (user.role === 'parent') {
      return [
        ...baseItems,
        { href: '/dashboard/children', label: 'Мои дети', icon: '👶' },
        { href: '/dashboard/assignments', label: 'Задания', icon: '📝' },
        { href: '/dashboard/progress', label: 'Прогресс', icon: '📈' },
        { href: '/dashboard/chat', label: 'Чат', icon: '💬' },
      ]
    }

    return baseItems
  }

  const navItems = getNavItems()

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-xl font-bold text-primary-900">
                Neiro Platform
              </Link>
              
              <nav className="hidden md:flex space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-neutral-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-neutral-500">
                  {user?.role === 'admin' && 'Администратор'}
                  {user?.role === 'specialist' && 'Специалист'}
                  {user?.role === 'supervisor' && 'Супервизор'}
                  {user?.role === 'parent' && 'Родитель'}
                </p>
              </div>
              
              <Button variant="outline" onClick={handleLogout} size="sm">
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white border-b border-neutral-200 px-4 py-2 overflow-x-auto">
        <div className="flex space-x-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                pathname === item.href
                  ? 'bg-primary-100 text-primary-900'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <span className="mr-1">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-neutral-500">
            <p>&copy; 2025 Neiro Platform. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

