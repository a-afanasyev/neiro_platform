'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  updatedAt: string
  child?: {
    id: string
    firstName: string
    lastName: string
  }
  leadSpecialist?: {
    id: string
    firstName: string
    lastName: string
  }
}

interface Goal {
  id: string
  title: string
  description?: string
  domain: string
  priority: string
  status: string
  targetDate?: string
  orderIndex: number
}

interface Phase {
  id: string
  title: string
  description?: string
  orderIndex: number
  startDate?: string
  endDate?: string
  status?: string
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

const domainLabels: Record<string, string> = {
  cognitive: 'Когнитивное',
  speech: 'Речь',
  motor: 'Моторика',
  social: 'Социальное',
  sensory: 'Сенсорика',
  behavior: 'Поведение',
}

const priorityLabels: Record<string, string> = {
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
}

export default function RouteDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const routeId = params.id as string

  const [route, setRoute] = useState<Route | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [phases, setPhases] = useState<Phase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)

  useEffect(() => {
    loadRouteData()
  }, [routeId])

  const loadRouteData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [routeRes, goalsRes, phasesRes] = await Promise.all([
        routesApi.getRoute(routeId),
        // В случае ошибки по целям/фазам возвращаем пустые массивы в data
        routesApi.getGoals(routeId).catch(() => ({ success: true, data: [] })),
        routesApi.getPhases(routeId).catch(() => ({ success: true, data: [] })),
      ])

      if (routeRes.success) {
        setRoute(routeRes.data)
      }
      if (goalsRes.success) {
        const goalsRaw = goalsRes.data as any
        const goalsList = Array.isArray(goalsRaw) ? goalsRaw : goalsRaw?.items ?? []
        setGoals(goalsList)
      }
      if (phasesRes.success) {
        const phasesRaw = phasesRes.data as any
        const phasesList = Array.isArray(phasesRaw) ? phasesRaw : phasesRaw?.items ?? []
        setPhases(phasesList)
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Не удалось загрузить маршрут')
    } finally {
      setIsLoading(false)
    }
  }

  const handleActivate = async () => {
    setIsActionLoading(true)
    try {
      await routesApi.activateRoute(routeId)
      await loadRouteData()
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Не удалось активировать маршрут')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleComplete = async () => {
    setIsActionLoading(true)
    try {
      await routesApi.completeRoute(routeId)
      await loadRouteData()
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Не удалось завершить маршрут')
    } finally {
      setIsActionLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  const canManageRoute =
    user?.role === 'admin' ||
    (user?.role === 'specialist' && route?.leadSpecialistId === user.id)

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'specialist', 'supervisor']}>
        <DashboardLayout>
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-neutral-600">Загрузка...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (error || !route) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'specialist', 'supervisor']}>
        <DashboardLayout>
          <Alert variant="destructive">
            <AlertDescription>{error || 'Маршрут не найден'}</AlertDescription>
          </Alert>
          <Button onClick={() => router.back()} className="mt-4">
            Назад
          </Button>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'specialist', 'supervisor']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-neutral-900">{route.title}</h1>
                <Badge variant={statusColors[route.status]}>
                  {statusLabels[route.status]}
                </Badge>
              </div>
              {route.summary && <p className="text-neutral-600">{route.summary}</p>}
            </div>
            <Button variant="outline" onClick={() => router.back()}>
              Назад к списку
            </Button>
          </div>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Информация о маршруте</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-600">Ребенок</p>
                <p className="font-medium">
                  {route.child
                    ? `${route.child.firstName} ${route.child.lastName}`
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Ведущий специалист</p>
                <p className="font-medium">
                  {route.leadSpecialist
                    ? `${route.leadSpecialist.firstName} ${route.leadSpecialist.lastName}`
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Длительность</p>
                <p className="font-medium">
                  {route.planHorizonWeeks
                    ? `${route.planHorizonWeeks} ${
                        route.planHorizonWeeks === 1
                          ? 'неделя'
                          : route.planHorizonWeeks < 5
                            ? 'недели'
                            : 'недель'
                      }`
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Даты</p>
                <p className="font-medium">
                  {formatDate(route.startDate)} — {formatDate(route.endDate)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {canManageRoute && (
            <Card>
              <CardHeader>
                <CardTitle>Управление маршрутом</CardTitle>
                <CardDescription>Действия с маршрутом</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                {route.status === 'draft' && (
                  <Button onClick={handleActivate} disabled={isActionLoading}>
                    {isActionLoading ? 'Активация...' : 'Активировать маршрут'}
                  </Button>
                )}
                {route.status === 'active' && (
                  <Button onClick={handleComplete} disabled={isActionLoading}>
                    {isActionLoading ? 'Завершение...' : 'Завершить маршрут'}
                  </Button>
                )}
                {(route.status === 'draft' || route.status === 'active') && (
                  <Button 
                    variant="outline"
                    onClick={() => router.push(`/dashboard/routes/${routeId}/edit`)}
                  >
                    Редактировать
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tabs: Goals, Phases, Assignments */}
          <Tabs defaultValue="goals" className="space-y-4">
            <TabsList>
              <TabsTrigger value="goals">Цели ({goals.length})</TabsTrigger>
              <TabsTrigger value="phases">Фазы ({phases.length})</TabsTrigger>
              <TabsTrigger value="assignments">Назначения</TabsTrigger>
            </TabsList>

            {/* Goals Tab */}
            <TabsContent value="goals" className="space-y-4">
              {goals.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-neutral-600 mb-4">Нет целей</p>
                    {canManageRoute && (
                      <Button variant="outline">Добавить цель</Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {goals.map((goal) => (
                    <Card key={goal.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{goal.title}</h4>
                              <Badge variant="outline">
                                {domainLabels[goal.domain] || goal.domain}
                              </Badge>
                              {goal.priority === 'high' && (
                                <Badge>{priorityLabels[goal.priority]}</Badge>
                              )}
                            </div>
                            {goal.description && (
                              <p className="text-sm text-neutral-600 mb-2">
                                {goal.description}
                              </p>
                            )}
                            {goal.targetDate && (
                              <p className="text-xs text-neutral-500">
                                Целевая дата: {formatDate(goal.targetDate)}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Phases Tab */}
            <TabsContent value="phases" className="space-y-4">
              {phases.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-neutral-600 mb-4">Нет фаз</p>
                    {canManageRoute && (
                      <Button variant="outline">Добавить фазу</Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {phases.map((phase, index) => (
                    <Card key={phase.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{phase.title}</h4>
                            {phase.description && (
                              <p className="text-sm text-neutral-600 mb-2">
                                {phase.description}
                              </p>
                            )}
                            {(phase.startDate || phase.endDate) && (
                              <p className="text-xs text-neutral-500">
                                {formatDate(phase.startDate)} — {formatDate(phase.endDate)}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Assignments Tab */}
            <TabsContent value="assignments">
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-neutral-600">Назначения будут отображены здесь</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

