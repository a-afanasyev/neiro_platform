'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const { user } = useAuth()

  const getWelcomeMessage = () => {
    if (!user) return 'Добро пожаловать'
    
    const time = new Date().getHours()
    const greeting = time < 12 ? 'Доброе утро' : time < 18 ? 'Добрый день' : 'Добрый вечер'
    
    return `${greeting}, ${user.firstName}!`
  }

  const getQuickActions = () => {
    if (!user) return []

    if (user.role === 'admin') {
      return [
        { href: '/dashboard/children', label: 'Управление детьми', icon: '👶', description: 'Просмотр и редактирование профилей детей' },
        { href: '/dashboard/users', label: 'Управление пользователями', icon: '👥', description: 'Добавление и настройка пользователей' },
        { href: '/dashboard/diagnostics', label: 'Диагностика', icon: '📋', description: 'Просмотр результатов диагностики' },
        { href: '/dashboard/settings', label: 'Настройки системы', icon: '⚙️', description: 'Конфигурация платформы' },
      ]
    }

    if (user.role === 'specialist' || user.role === 'supervisor') {
      return [
        { href: '/dashboard/children', label: 'Мои дети', icon: '👶', description: 'Список закрепленных детей' },
        { href: '/dashboard/diagnostics', label: 'Диагностика', icon: '📋', description: 'Проведение и просмотр диагностик' },
        { href: '/dashboard/routes', label: 'Коррекционные маршруты', icon: '🗺️', description: 'Планирование и отслеживание' },
        { href: '/dashboard/reports', label: 'Отчеты', icon: '📊', description: 'Аналитика и прогресс' },
      ]
    }

    if (user.role === 'parent') {
      return [
        { href: '/dashboard/children', label: 'Мои дети', icon: '👶', description: 'Профили моих детей' },
        { href: '/dashboard/assignments', label: 'Задания', icon: '📝', description: 'Домашние упражнения' },
        { href: '/dashboard/progress', label: 'Прогресс', icon: '📈', description: 'Динамика развития' },
        { href: '/dashboard/chat', label: 'Связь со специалистами', icon: '💬', description: 'Общение и консультации' },
      ]
    }

    return []
  }

  const quickActions = getQuickActions()

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              {getWelcomeMessage()}
            </h1>
            <p className="text-neutral-600">
              {user?.role === 'admin' && 'Панель администратора системы'}
              {user?.role === 'specialist' && 'Панель специалиста'}
              {user?.role === 'supervisor' && 'Панель супервизора'}
              {user?.role === 'parent' && 'Личный кабинет родителя'}
            </p>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Быстрые действия</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="text-4xl mb-2">{action.icon}</div>
                      <CardTitle className="text-lg">{action.label}</CardTitle>
                      <CardDescription>{action.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Статистика</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    {user?.role === 'parent' ? '2' : '15'}
                  </div>
                  <p className="text-sm text-neutral-600">
                    {user?.role === 'parent' ? 'Детей в системе' : 'Активных детей'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-success-600 mb-2">
                    {user?.role === 'parent' ? '5' : '23'}
                  </div>
                  <p className="text-sm text-neutral-600">
                    {user?.role === 'parent' ? 'Выполнено заданий' : 'Завершенных диагностик'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-warning-600 mb-2">
                    {user?.role === 'parent' ? '3' : '8'}
                  </div>
                  <p className="text-sm text-neutral-600">
                    {user?.role === 'parent' ? 'Активных заданий' : 'Активных маршрутов'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Последняя активность</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">Диагностика завершена</p>
                      <p className="text-neutral-500">CARS для Артем Иванов</p>
                    </div>
                    <span className="text-neutral-400">2 часа назад</span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">Задание выполнено</p>
                      <p className="text-neutral-500">Сортировка по цветам</p>
                    </div>
                    <span className="text-neutral-400">5 часов назад</span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm">
                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">Новое назначение</p>
                      <p className="text-neutral-500">Пальчиковая гимнастика</p>
                    </div>
                    <span className="text-neutral-400">1 день назад</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

