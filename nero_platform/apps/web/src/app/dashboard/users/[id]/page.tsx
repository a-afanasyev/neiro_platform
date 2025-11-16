'use client'

/**
 * Страница детального просмотра пользователя
 * 
 * Отображает полную информацию о пользователе, включая:
 * - Личные данные (имя, email, телефон)
 * - Роль и статус
 * - Дату регистрации
 * - Связанных детей (для родителей)
 * - Назначенных детей (для специалистов)
 */

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usersApi } from '@/lib/api'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  middleName?: string
  phone?: string
  role: string
  status: string
  createdAt: string
  updatedAt: string
}

interface Child {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUserData()
  }, [userId])

  /**
   * Загрузка данных пользователя и связанных детей
   */
  async function loadUserData() {
    try {
      setLoading(true)
      setError(null)

      // Загружаем данные пользователя
      const userRes = await usersApi.getUser(userId)
      const userData = userRes.data?.data || userRes.data
      setUser(userData)

      // Загружаем связанных детей
      try {
        const childrenRes = await usersApi.getUserChildren(userId)
        const childrenData = Array.isArray(childrenRes.data) 
          ? childrenRes.data 
          : childrenRes.data?.data || []
        setChildren(childrenData)
      } catch (err) {
        console.warn('Не удалось загрузить детей пользователя:', err)
        setChildren([])
      }
    } catch (err: any) {
      console.error('Ошибка загрузки данных пользователя:', err)
      setError(err.response?.data?.message || 'Не удалось загрузить данные пользователя')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Получение цвета badge для роли пользователя
   */
  function getRoleBadgeVariant(role: string): "default" | "secondary" | "destructive" | "outline" {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'specialist':
        return 'default'
      case 'parent':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  /**
   * Получение текста роли на русском
   */
  function getRoleText(role: string): string {
    switch (role) {
      case 'admin':
        return 'Администратор'
      case 'specialist':
        return 'Специалист'
      case 'parent':
        return 'Родитель'
      default:
        return role
    }
  }

  /**
   * Получение цвета badge для статуса
   */
  function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
    switch (status) {
      case 'active':
        return 'default'
      case 'inactive':
        return 'secondary'
      case 'blocked':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  /**
   * Получение текста статуса на русском
   */
  function getStatusText(status: string): string {
    switch (status) {
      case 'active':
        return 'Активен'
      case 'inactive':
        return 'Неактивен'
      case 'blocked':
        return 'Заблокирован'
      default:
        return status
    }
  }

  /**
   * Форматирование даты
   */
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  /**
   * Вычисление возраста ребенка
   */
  function calculateAge(dateOfBirth: string): number {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-neutral-600">Загрузка данных пользователя...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (error || !user) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Ошибка</h1>
              <Button onClick={() => router.back()}>Назад</Button>
            </div>
            <Card>
              <CardContent className="pt-6">
                <p className="text-red-600">{error || 'Пользователь не найден'}</p>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Заголовок с кнопками действий */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {user.lastName} {user.firstName} {user.middleName || ''}
              </h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                Назад
              </Button>
              <Button onClick={() => router.push(`/dashboard/users/${userId}/edit`)}>
                Редактировать
              </Button>
            </div>
          </div>

          {/* Основная информация */}
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
              <CardDescription>Личные данные и контактная информация</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Имя</p>
                  <p className="text-lg">{user.firstName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Фамилия</p>
                  <p className="text-lg">{user.lastName}</p>
                </div>
                {user.middleName && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Отчество</p>
                    <p className="text-lg">{user.middleName}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg">{user.email}</p>
                </div>
                {user.phone && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Телефон</p>
                    <p className="text-lg">{user.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Роль</p>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {getRoleText(user.role)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Статус</p>
                  <Badge variant={getStatusBadgeVariant(user.status)}>
                    {getStatusText(user.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Дата регистрации</p>
                  <p className="text-lg">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Связанные дети */}
          {children.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Связанные дети</CardTitle>
                <CardDescription>
                  {user.role === 'parent' ? 'Дети пользователя' : 'Назначенные дети'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => router.push(`/dashboard/children/${child.id}`)}
                    >
                      <div>
                        <p className="font-medium">
                          {child.lastName} {child.firstName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {calculateAge(child.dateOfBirth)} лет
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        Подробнее →
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

