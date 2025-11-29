'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { authApi } from '@/lib/api'
import { NotificationBell } from '@/components/notifications/NotificationBell'

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
      { href: '/dashboard', label: 'Главная', icon: '🏠', testId: 'home-menu' },
    ]

    if (user.role === 'admin') {
      return [
        ...baseItems,
        { href: '/dashboard/users', label: 'Пользователи', icon: '👥', testId: 'users-menu' },
        { href: '/dashboard/children', label: 'Дети', icon: '👶', testId: 'children-menu' },
        { href: '/dashboard/routes', label: 'Маршруты', icon: '🗺️', testId: 'routes-menu' },
        { href: '/dashboard/diagnostics', label: 'Диагностика', icon: '📋', testId: 'diagnostics-menu' },
        { href: '/dashboard/exercises', label: 'Упражнения', icon: '🎯', testId: 'exercises-menu' },
        { href: '/dashboard/templates', label: 'Шаблоны', icon: '📝', testId: 'templates-menu' },
        { href: '/dashboard/assignments', label: 'Назначения', icon: '📅', testId: 'assignments-menu' },
        { href: '/dashboard/settings', label: 'Настройки', icon: '⚙️', testId: 'settings-menu' },
      ]
    }

    if (user.role === 'specialist' || user.role === 'supervisor') {
      return [
        ...baseItems,
        { href: '/dashboard/children', label: 'Мои дети', icon: '👶', testId: 'children-link' },
        { href: '/dashboard/routes', label: 'Маршруты', icon: '🗺️', testId: 'routes-link' },
        { href: '/dashboard/diagnostics', label: 'Диагностика', icon: '📋', testId: 'diagnostics-link' },
        { href: '/dashboard/exercises', label: 'Упражнения', icon: '🎯', testId: 'exercises-link' },
        { href: '/dashboard/templates', label: 'Шаблоны', icon: '📝', testId: 'templates-link' },
        { href: '/dashboard/assignments', label: 'Назначения', icon: '📅', testId: 'assignments-link' },
        { href: '/dashboard/reports', label: 'Отчеты', icon: '📊', testId: 'reports-link' },
      ]
    }

    if (user.role === 'parent') {
      return [
        ...baseItems,
        { href: '/dashboard/children', label: 'Мои дети', icon: '👶', testId: 'children-link' },
        { href: '/dashboard/routes', label: 'Мой маршрут', icon: '🗺️', testId: 'routes-link' },
        { href: '/dashboard/assignments', label: 'Назначения', icon: '📅', testId: 'assignments-link' },
        { href: '/dashboard/progress', label: 'Прогресс', icon: '📈', testId: 'progress-link' },
        { href: '/dashboard/chat', label: 'Чат', icon: '💬', testId: 'chat-link' },
        { href: '#', label: 'Профиль', icon: '👤', testId: 'profile-menu', dropdown: [
          { href: '/dashboard/profile', label: 'Мой профиль', testId: 'profile-link' },
          { href: '/dashboard/settings', label: 'Настройки', testId: 'settings-link' },
        ]},
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
                {navItems.map((item) => {
                  if (item.dropdown) {
                    return (
                      <div key={item.href} className="relative group">
                        <button
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            item.dropdown.some((dropdownItem) => pathname === dropdownItem.href)
                              ? 'bg-primary-100 text-primary-900'
                              : 'text-neutral-600 hover:bg-neutral-100'
                          }`}
                          data-testid={item.testId}
                        >
                          <span className="mr-2">{item.icon}</span>
                          {item.label}
                          <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7 7" />
                          </svg>
                        </button>
                        <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                          {item.dropdown.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.href}
                              href={dropdownItem.href}
                              className={`block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 ${
                                pathname === dropdownItem.href ? 'bg-primary-100 text-primary-900' : ''
                              }`}
                              data-testid={dropdownItem.testId}
                            >
                              {dropdownItem.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  } else {
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          pathname === item.href
                            ? 'bg-primary-100 text-primary-900'
                            : 'text-neutral-600 hover:bg-neutral-100'
                        }`}
                        data-testid={item.testId}
                      >
                        <span className="mr-2">{item.icon}</span>
                        {item.label}
                      </Link>
                    )
                })}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <NotificationBell />

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
          {navItems.map((item) => {
            if (item.dropdown) {
              return (
                <div key={item.href} className="relative group">
                  <button
                    className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                      item.dropdown.some((dropdownItem) => pathname === dropdownItem.href)
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                    data-testid={item.testId}
                  >
                    <span className="mr-1">{item.icon}</span>
                    {item.label}
                    <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7 7" />
                    </svg>
                  </button>
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    {item.dropdown.map((dropdownItem) => (
                      <Link
                        key={dropdownItem.href}
                        href={dropdownItem.href}
                        className={`block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 ${
                          pathname === dropdownItem.href ? 'bg-primary-100 text-primary-900' : ''
                        }`}
                        data-testid={dropdownItem.testId}
                      >
                        {dropdownItem.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            } else {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    pathname === item.href
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                  data-testid={item.testId}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </Link>
              )
            }
          })}
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

