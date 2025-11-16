'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RouteBuilder } from '@/components/routes/RouteBuilder'
import { routesApi, childrenApi, usersApi, templatesApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

/**
 * Интерфейс для данных маршрута при редактировании
 */
interface RouteData {
  id?: string
  childId: string
  leadSpecialistId: string
  templateId?: string
  title: string
  summary?: string
  planHorizonWeeks: number
  phases?: RoutePhase[]
}

/**
 * Интерфейс для фазы маршрута
 */
interface RoutePhase {
  id?: string
  title: string
  description: string
  orderIndex: number
  durationWeeks: number
  objectives?: Record<string, any>
  goals?: PhaseGoal[]
}

/**
 * Интерфейс для цели фазы
 */
interface PhaseGoal {
  id?: string
  title: string
  domain: string
  description: string
  priority: 'low' | 'medium' | 'high'
  targetDate?: string
  successCriteria?: Record<string, any>
}

/**
 * Страница редактирования маршрута
 * 
 * Позволяет редактировать существующий маршрут с использованием компонента RouteBuilder.
 * Загружает текущие данные маршрута, включая фазы и цели, и предоставляет
 * полнофункциональный редактор для их изменения.
 */
export default function EditRoutePage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  
  const routeId = params.id as string

  const [route, setRoute] = useState<RouteData | null>(null)
  const [children, setChildren] = useState<Array<{ id: string; name: string }>>([])
  const [templates, setTemplates] = useState<Array<{ id: string; title: string; durationWeeks: number }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [routeId])

  /**
   * Загрузка всех необходимых данных для редактирования
   */
  const loadData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Загружаем маршрут с фазами и целями
      const [routeRes, goalsRes, phasesRes, childrenRes, templatesRes] = await Promise.all([
        routesApi.getRoute(routeId),
        routesApi.getGoals(routeId).catch(() => ({ success: true, data: { items: [] } })),
        routesApi.getPhases(routeId).catch(() => ({ success: true, data: { items: [] } })),
        childrenApi.getChildren(),
        templatesApi.getTemplates({ status: 'published' }),
      ])

      if (!routeRes.success) {
        throw new Error('Не удалось загрузить маршрут')
      }

      const routeData = routeRes.data

      // Формируем список детей
      const childrenList = childrenRes.success
        ? childrenRes.data.items.map((child: any) => ({
            id: child.id,
            name: `${child.firstName} ${child.lastName}`,
          }))
        : []

      // Формируем список шаблонов
      const templatesList = templatesRes.success
        ? templatesRes.data.items.map((template: any) => ({
            id: template.id,
            title: template.title,
            durationWeeks: template.durationWeeks || 12,
          }))
        : []

      // Объединяем фазы с их целями
      const phases = phasesRes.success && phasesRes.data.items
        ? phasesRes.data.items.map((phase: any) => ({
            ...phase,
            goals: goalsRes.success
              ? goalsRes.data.items.filter((goal: any) => goal.phaseId === phase.id)
              : [],
          }))
        : []

      setRoute({
        id: routeData.id,
        childId: routeData.childId,
        leadSpecialistId: routeData.leadSpecialistId,
        templateId: routeData.templateId,
        title: routeData.title,
        summary: routeData.summary,
        planHorizonWeeks: routeData.planHorizonWeeks || 12,
        phases,
      })
      
      setChildren(childrenList)
      setTemplates(templatesList)
    } catch (err: any) {
      console.error('Ошибка загрузки данных:', err)
      setError(err.response?.data?.error?.message || err.message || 'Не удалось загрузить данные')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Обработчик сохранения маршрута
   * 
   * Сохраняет изменения в маршруте, а также создает/обновляет/удаляет фазы и цели
   */
  const handleSave = async (routeData: RouteData) => {
    try {
      // 1. Обновляем базовую информацию о маршруте
      await routesApi.updateRoute(routeId, {
        title: routeData.title,
        summary: routeData.summary,
        planHorizonWeeks: routeData.planHorizonWeeks,
      })

      // 2. Обновляем фазы
      if (routeData.phases) {
        // Получаем текущие фазы для сравнения
        const currentPhasesRes = await routesApi.getPhases(routeId)
        const currentPhases = currentPhasesRes.success ? currentPhasesRes.data.items : []
        const currentPhaseIds = new Set(currentPhases.map((p: any) => p.id))

        // Обрабатываем каждую фазу
        for (const phase of routeData.phases) {
          if (phase.id && currentPhaseIds.has(phase.id)) {
            // Обновляем существующую фазу
            await routesApi.updatePhase(routeId, phase.id, {
              title: phase.title,
              description: phase.description,
              orderIndex: phase.orderIndex,
              durationWeeks: phase.durationWeeks,
              objectives: phase.objectives,
            })

            // Обновляем цели фазы
            if (phase.goals) {
              const currentGoalsRes = await routesApi.getGoals(routeId)
              const currentPhaseGoals = currentGoalsRes.success
                ? currentGoalsRes.data.items.filter((g: any) => g.phaseId === phase.id)
                : []
              const currentGoalIds = new Set(currentPhaseGoals.map((g: any) => g.id))

              for (const goal of phase.goals) {
                if (goal.id && currentGoalIds.has(goal.id)) {
                  // Обновляем существующую цель
                  await routesApi.updateGoal(routeId, goal.id, {
                    title: goal.title,
                    domain: goal.domain,
                    description: goal.description,
                    priority: goal.priority,
                    targetDate: goal.targetDate,
                    successCriteria: goal.successCriteria,
                  })
                  currentGoalIds.delete(goal.id)
                } else {
                  // Создаем новую цель
                  await routesApi.createGoal(routeId, {
                    phaseId: phase.id,
                    title: goal.title,
                    domain: goal.domain,
                    description: goal.description,
                    priority: goal.priority,
                    targetDate: goal.targetDate,
                    successCriteria: goal.successCriteria,
                  })
                }
              }

              // Удаляем цели, которые были удалены из UI
              for (const goalId of currentGoalIds) {
                await routesApi.deleteGoal(routeId, goalId as string)
              }
            }

            currentPhaseIds.delete(phase.id)
          } else {
            // Создаем новую фазу
            const newPhaseRes = await routesApi.createPhase(routeId, {
              title: phase.title,
              description: phase.description,
              orderIndex: phase.orderIndex,
              durationWeeks: phase.durationWeeks,
              objectives: phase.objectives,
            })

            // Создаем цели для новой фазы
            if (newPhaseRes.success && phase.goals) {
              const newPhaseId = newPhaseRes.data.id
              for (const goal of phase.goals) {
                await routesApi.createGoal(routeId, {
                  phaseId: newPhaseId,
                  title: goal.title,
                  domain: goal.domain,
                  description: goal.description,
                  priority: goal.priority,
                  targetDate: goal.targetDate,
                  successCriteria: goal.successCriteria,
                })
              }
            }
          }
        }

        // Удаляем фазы, которые были удалены из UI
        for (const phaseId of currentPhaseIds) {
          await routesApi.deletePhase(routeId, phaseId as string)
        }
      }

      success('Маршрут успешно обновлен', 'Все изменения сохранены')
      router.push(`/dashboard/routes/${routeId}`)
    } catch (err: any) {
      console.error('Ошибка сохранения маршрута:', err)
      const errorMessage = err.response?.data?.error?.message || 'Не удалось сохранить маршрут'
      showError(errorMessage, 'Проверьте корректность данных и повторите попытку')
      throw err
    }
  }

  /**
   * Обработчик отмены редактирования
   */
  const handleCancel = () => {
    router.push(`/dashboard/routes/${routeId}`)
  }

  // Проверка прав доступа
  const canEdit =
    user?.role === 'admin' ||
    (user?.role === 'specialist' && route?.leadSpecialistId === user.id)

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'specialist']}>
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
      <ProtectedRoute allowedRoles={['admin', 'specialist']}>
        <DashboardLayout>
          <Alert variant="destructive">
            <AlertDescription>{error || 'Маршрут не найден'}</AlertDescription>
          </Alert>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (!canEdit) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'specialist']}>
        <DashboardLayout>
          <Alert variant="destructive">
            <AlertDescription>
              У вас нет прав для редактирования этого маршрута
            </AlertDescription>
          </Alert>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'specialist']}>
      <DashboardLayout>
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Редактирование маршрута</h1>
            <p className="text-neutral-600 mt-1">
              Внесите изменения в маршрут, фазы и цели
            </p>
          </div>

          {/* RouteBuilder Component */}
          <RouteBuilder
            childId={route.childId}
            leadSpecialistId={route.leadSpecialistId}
            route={route}
            children={children}
            templates={templates}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

