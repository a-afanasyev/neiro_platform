'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { routesApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

interface Route {
  id: string
  title: string
  summary?: string
  status: string
  childId: string
  leadSpecialistId: string
  planHorizonWeeks?: number
  startDate?: string
  endDate?: string
  createdAt: string
  child?: {
    firstName: string
    lastName: string
  }
  leadSpecialist?: {
    firstName: string
    lastName: string
  }
}

const statusLabels: Record<string, string> = {
  draft: 'Черновик',
  active: 'Активный',
  paused: 'Приостановлен',
  completed: 'Завершен',
  archived: 'Архивный',
}

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'outline',
  active: 'default',
  paused: 'secondary',
  completed: 'secondary',
  archived: 'outline',
}

export default function RoutesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [routes, setRoutes] = useState<Route[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRoutes()
  }, [])

  const loadRoutes = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await routesApi.getRoutes()
      if (response.success) {
        setRoutes(response.data.items)
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Не удалось загрузить маршруты')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  const canCreateRoute = user?.role === 'specialist' || user?.role === 'admin'

  return (
    <ProtectedRoute allowedRoles={['admin', 'specialist', 'supervisor']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Маршруты</h1>
              <p className="text-neutral-600 mt-1">
                Индивидуальные коррекционные маршруты детей
              </p>
            </div>

            {canCreateRoute && (
              <Button onClick={() => router.push('/dashboard/routes/new')}>
                + Создать маршрут
              </Button>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-neutral-600">Загрузка...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Routes List */}
          {!isLoading && !error && (
            <>
              {routes.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="text-6xl mb-4">🗺️</div>
                    <h3 className="text-xl font-semibold mb-2">Нет маршрутов</h3>
                    <p className="text-neutral-600 mb-4">
                      Пока не создано ни одного коррекционного маршрута
                    </p>
                    {canCreateRoute && (
                      <Button onClick={() => router.push('/dashboard/routes/new')}>
                        Создать первый маршрут
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {routes.map((route) => (
                    <Card
                      key={route.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(`/dashboard/routes/${route.id}`)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-xl">{route.title}</CardTitle>
                              <Badge variant={statusColors[route.status]}>
                                {statusLabels[route.status] || route.status}
                              </Badge>
                            </div>
                            {route.summary && (
                              <CardDescription className="mb-3">
                                {route.summary}
                              </CardDescription>
                            )}
                            <div className="space-y-1 text-sm text-neutral-600">
                              {route.child && (
                                <p>
                                  <span className="font-medium">Ребенок:</span>{' '}
                                  {route.child.firstName} {route.child.lastName}
                                </p>
                              )}
                              {route.leadSpecialist && (
                                <p>
                                  <span className="font-medium">Ведущий специалист:</span>{' '}
                                  {route.leadSpecialist.firstName}{' '}
                                  {route.leadSpecialist.lastName}
                                </p>
                              )}
                              {route.planHorizonWeeks && (
                                <p>
                                  <span className="font-medium">Длительность:</span>{' '}
                                  {route.planHorizonWeeks}{' '}
                                  {route.planHorizonWeeks === 1
                                    ? 'неделя'
                                    : route.planHorizonWeeks < 5
                                      ? 'недели'
                                      : 'недель'}
                                </p>
                              )}
                              {route.startDate && (
                                <p>
                                  <span className="font-medium">Начало:</span>{' '}
                                  {formatDate(route.startDate)}
                                  {route.endDate && ` — ${formatDate(route.endDate)}`}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

