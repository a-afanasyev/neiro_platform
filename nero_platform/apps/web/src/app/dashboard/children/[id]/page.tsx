'use client'

/**
 * Страница детального просмотра профиля ребенка
 * 
 * Отображает полную информацию о ребенке, включая:
 * - Личные данные (ФИО, дата рождения, возраст)
 * - Медицинскую информацию (диагнозы, особенности)
 * - Связанных родителей
 * - Назначенных специалистов
 * - Активные маршруты и назначения
 */

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { childrenApi } from '@/lib/api'

interface Child {
  id: string
  firstName: string
  lastName: string
  middleName?: string
  dateOfBirth: string
  gender: string
  diagnosis?: string
  notes?: string
  createdAt: string
  updatedAt: string
  parents?: Array<{
    id: string
    firstName: string
    lastName: string
    email: string
  }>
  specialists?: Array<{
    id: string
    firstName: string
    lastName: string
    specialization?: string
  }>
}

export default function ChildDetailPage() {
  const params = useParams()
  const router = useRouter()
  const childId = params.id as string

  const [child, setChild] = useState<Child | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadChildData()
  }, [childId])

  /**
   * Загрузка данных ребенка
   */
  async function loadChildData() {
    try {
      setLoading(true)
      setError(null)

      const res = await childrenApi.getChild(childId)
      const childData = res.data?.data || res.data
      setChild(childData)
    } catch (err: any) {
      console.error('Ошибка загрузки данных ребенка:', err)
      setError(err.response?.data?.message || 'Не удалось загрузить данные ребенка')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Вычисление возраста ребенка
   */
  function calculateAge(dateOfBirth: string): string {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let years = today.getFullYear() - birthDate.getFullYear()
    let months = today.getMonth() - birthDate.getMonth()
    
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--
      months += 12
    }
    
    if (today.getDate() < birthDate.getDate()) {
      months--
    }

    if (years > 0) {
      return `${years} ${getYearWord(years)}${months > 0 ? ` ${months} ${getMonthWord(months)}` : ''}`
    } else {
      return `${months} ${getMonthWord(months)}`
    }
  }

  /**
   * Склонение слова "год"
   */
  function getYearWord(years: number): string {
    const lastDigit = years % 10
    const lastTwoDigits = years % 100

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return 'лет'
    }

    if (lastDigit === 1) {
      return 'год'
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
      return 'года'
    }

    return 'лет'
  }

  /**
   * Склонение слова "месяц"
   */
  function getMonthWord(months: number): string {
    const lastDigit = months % 10
    const lastTwoDigits = months % 100

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return 'месяцев'
    }

    if (lastDigit === 1) {
      return 'месяц'
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
      return 'месяца'
    }

    return 'месяцев'
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
   * Получение текста пола на русском
   */
  function getGenderText(gender: string): string {
    switch (gender) {
      case 'male':
        return 'Мужской'
      case 'female':
        return 'Женский'
      default:
        return gender
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-neutral-600">Загрузка данных ребенка...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (error || !child) {
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
                <p className="text-red-600">{error || 'Ребенок не найден'}</p>
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
                {child.lastName} {child.firstName} {child.middleName || ''}
              </h1>
              <p className="text-muted-foreground">
                {calculateAge(child.dateOfBirth)} • {getGenderText(child.gender)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                Назад
              </Button>
              <Button onClick={() => router.push(`/dashboard/children/${childId}/edit`)}>
                Редактировать
              </Button>
            </div>
          </div>

          {/* Основная информация */}
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
              <CardDescription>Личные данные ребенка</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Имя</p>
                  <p className="text-lg">{child.firstName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Фамилия</p>
                  <p className="text-lg">{child.lastName}</p>
                </div>
                {child.middleName && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Отчество</p>
                    <p className="text-lg">{child.middleName}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Дата рождения</p>
                  <p className="text-lg">{formatDate(child.dateOfBirth)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Возраст</p>
                  <p className="text-lg">{calculateAge(child.dateOfBirth)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Пол</p>
                  <p className="text-lg">{getGenderText(child.gender)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Медицинская информация */}
          {(child.diagnosis || child.notes) && (
            <Card>
              <CardHeader>
                <CardTitle>Медицинская информация</CardTitle>
                <CardDescription>Диагнозы и особенности развития</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {child.diagnosis && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Диагноз</p>
                    <p className="text-base">{child.diagnosis}</p>
                  </div>
                )}
                {child.notes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Примечания</p>
                    <p className="text-base whitespace-pre-wrap">{child.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Родители */}
          {child.parents && child.parents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Родители</CardTitle>
                <CardDescription>Законные представители ребенка</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {child.parents.map((parent) => (
                    <div
                      key={parent.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => router.push(`/dashboard/users/${parent.id}`)}
                    >
                      <div>
                        <p className="font-medium">
                          {parent.lastName} {parent.firstName}
                        </p>
                        <p className="text-sm text-muted-foreground">{parent.email}</p>
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

          {/* Специалисты */}
          {child.specialists && child.specialists.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Назначенные специалисты</CardTitle>
                <CardDescription>Специалисты, работающие с ребенком</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {child.specialists.map((specialist) => (
                    <div
                      key={specialist.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => router.push(`/dashboard/users/${specialist.id}`)}
                    >
                      <div>
                        <p className="font-medium">
                          {specialist.lastName} {specialist.firstName}
                        </p>
                        {specialist.specialization && (
                          <p className="text-sm text-muted-foreground">{specialist.specialization}</p>
                        )}
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

