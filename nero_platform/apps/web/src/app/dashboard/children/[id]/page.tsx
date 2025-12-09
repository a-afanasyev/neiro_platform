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
import { AddParentDialog } from '@/components/children/AddParentDialog'
import { EditParentDialog } from '@/components/children/EditParentDialog'
import { ParentCard } from '@/components/children/ParentCard'

interface ParentInfo {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  relationship: 'mother' | 'father' | 'guardian' | 'other'
  legalGuardian: boolean
}

interface Child {
  id: string
  firstName: string
  lastName: string
  middleName?: string
  birthDate: string  // API возвращает birthDate, не dateOfBirth
  gender: string
  diagnosisSummary?: string  // API возвращает diagnosisSummary, не diagnosis
  notes?: string
  createdAt: string
  updatedAt: string
  parents?: ParentInfo[]
  specialists?: Array<{
    id: string
    user?: {
      firstName: string
      lastName: string
    }
    specialty?: string
    specialization?: string
    isPrimary?: boolean
  }>
}

export default function ChildDetailPage() {
  const params = useParams()
  const router = useRouter()
  const childId = params.id as string

  const [child, setChild] = useState<Child | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showAddParentDialog, setShowAddParentDialog] = useState(false)
  const [showEditParentDialog, setShowEditParentDialog] = useState(false)
  const [selectedParent, setSelectedParent] = useState<ParentInfo | null>(null)

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
   * 
   * Корректно вычисляет полные годы и месяцы с учетом дня рождения.
   * Например:
   * - Дата рождения: 15 ноября 2024
   * - Сегодня: 5 ноября 2025
   * - Результат: 0 лет 11 месяцев (т.к. день рождения еще не наступил в ноябре)
   */
  function calculateAge(dateOfBirth: string): string {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let years = today.getFullYear() - birthDate.getFullYear()
    let months = today.getMonth() - birthDate.getMonth()
    
    // Если месяц рождения еще не наступил в этом году,
    // или наступил, но день рождения еще не прошел
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--
      months += 12
    }
    
    // Если день рождения в текущем месяце еще не наступил,
    // уменьшаем количество месяцев (но только если не обрабатывали это выше)
    if (months > 0 && today.getDate() < birthDate.getDate()) {
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
              <h1 className="text-3xl font-bold" data-testid="child-detail-name">
                {child.lastName} {child.firstName} {child.middleName || ''}
              </h1>
              <p className="text-muted-foreground" data-testid="child-detail-age">
                {calculateAge(child.birthDate)} • {getGenderText(child.gender)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.back()} data-testid="back-button">
                Назад
              </Button>
              <Button onClick={() => router.push(`/dashboard/children/${childId}/edit`)} data-testid="edit-child-button">
                Редактировать
              </Button>
            </div>
          </div>

          {/* Основная информация */}
          <Card data-testid="child-detail-card">
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
                  <p className="text-lg">{formatDate(child.birthDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Возраст</p>
                  <p className="text-lg">{calculateAge(child.birthDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Пол</p>
                  <p className="text-lg">{getGenderText(child.gender)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Медицинская информация */}
          {(child.diagnosisSummary || child.notes) && (
            <Card>
              <CardHeader>
                <CardTitle>Медицинская информация</CardTitle>
                <CardDescription>Диагнозы и особенности развития</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {child.diagnosisSummary && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Диагноз</p>
                    <p className="text-base">{child.diagnosisSummary}</p>
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

          {/* Родители / Опекуны */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Родители / Опекуны</CardTitle>
                  <CardDescription>
                    Законные представители ребенка
                  </CardDescription>
                </div>
                <Button onClick={() => setShowAddParentDialog(true)}>
                  + Добавить родителя
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!child.parents || child.parents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>У ребенка пока нет привязанных родителей или опекунов</p>
                  <p className="text-sm mt-2">
                    Нажмите "Добавить родителя" чтобы привязать законного представителя
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {child.parents.map((parent) => (
                    <ParentCard
                      key={parent.id}
                      parent={parent}
                      childId={childId}
                      onEdit={(parent) => {
                        setSelectedParent(parent)
                        setShowEditParentDialog(true)
                      }}
                      onRemove={loadChildData}
                      legalGuardiansCount={
                        child.parents?.filter((p) => p.legalGuardian).length || 0
                      }
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

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
                          {specialist.user
                            ? `${specialist.user.lastName} ${specialist.user.firstName}`
                            : 'Неизвестный специалист'}
                        </p>
                        {(specialist.specialization || specialist.specialty) && (
                          <p className="text-sm text-muted-foreground">
                            {specialist.specialization || specialist.specialty}
                          </p>
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

        {/* Диалоги управления родителями */}
        <AddParentDialog
          childId={childId}
          open={showAddParentDialog}
          onOpenChange={setShowAddParentDialog}
          onSuccess={loadChildData}
          existingParentIds={child.parents?.map((p) => p.id) || []}
        />

        <EditParentDialog
          childId={childId}
          parent={selectedParent}
          open={showEditParentDialog}
          onOpenChange={setShowEditParentDialog}
          onSuccess={loadChildData}
          legalGuardiansCount={
            child.parents?.filter((p) => p.legalGuardian).length || 0
          }
        />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
