'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { assignmentsApi, childrenApi, usersApi, exercisesApi, routesApi } from '@/lib/api'

/**
 * Пропсы компонента CreateAssignmentDialog
 */
interface CreateAssignmentDialogProps {
  /** Видимость диалога */
  open: boolean
  /** Callback для изменения видимости */
  onOpenChange: (open: boolean) => void
  /** Callback после успешного создания */
  onSuccess?: () => void
}

/**
 * Компонент диалога для создания нового назначения
 * 
 * Предоставляет форму для создания назначения с выбором:
 * - Ребенка
 * - Специалиста
 * - Упражнения или цели маршрута
 * - Даты и времени
 * - Длительности
 * - Типа (занятие или домашнее задание)
 * - Места проведения
 */
export function CreateAssignmentDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateAssignmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)

  // Данные для селектов
  const [children, setChildren] = useState<Array<{ id: string; name: string }>>([])
  const [specialists, setSpecialists] = useState<Array<{ id: string; name: string }>>([])
  const [exercises, setExercises] = useState<Array<{ id: string; title: string }>>([])
  const [routes, setRoutes] = useState<Array<{ id: string; title: string; childId: string }>>([])
  const [routePhases, setRoutePhases] = useState<Array<{ id: string; name: string }>>([])
  const [routeGoals, setRouteGoals] = useState<Array<{ id: string; title: string }>>([])

  // Форма
  const [formData, setFormData] = useState({
    childId: '',
    specialistId: '',
    routeId: '',
    phaseId: '',
    targetGoalId: '',
    exerciseId: '',
    notes: '',
    plannedStartDate: '',
    dueDate: '',
    expectedDurationMinutes: 30,
    deliveryChannel: 'in_person',
    frequencyPerWeek: 1,
  })

  useEffect(() => {
    if (open) {
      loadInitialData()
    }
  }, [open])

  /**
   * Загрузка начальных данных для формы
   */
  const loadInitialData = async () => {
    setIsLoadingData(true)
    try {
      const [childrenRes, usersRes, exercisesRes, routesRes] = await Promise.all([
        childrenApi.getChildren(),
        usersApi.getUsers(),
        exercisesApi.getExercises({ status: 'published' }),
        routesApi.getRoutes(),
      ])

      if (childrenRes.success) {
        // Children Service: массив детей лежит в поле data
        const childrenRaw = childrenRes.data as any
        const childrenList = Array.isArray(childrenRaw) ? childrenRaw : childrenRaw?.items ?? []

        setChildren(
          childrenList.map((child: any) => ({
            id: child.id,
            name: `${child.firstName} ${child.lastName}`,
          }))
        )
      }

      if (usersRes.success) {
        // Users Service: массив пользователей в поле data
        const usersRaw = usersRes.data as any
        const users = Array.isArray(usersRaw) ? usersRaw : usersRaw?.items ?? []

        const specialistUsers = users.filter(
          (u: any) => u.role === 'specialist'
        )
        setSpecialists(
          specialistUsers.map((s: any) => ({
            id: s.id,
            name: `${s.firstName} ${s.lastName}`,
          }))
        )
      }

      if (exercisesRes.success) {
        // Exercises Service: список упражнений в поле data
        const exercisesRaw = exercisesRes.data as any
        const exercisesList = Array.isArray(exercisesRaw) ? exercisesRaw : exercisesRaw?.items ?? []

        setExercises(
          exercisesList.map((ex: any) => ({
            id: ex.id,
            title: ex.title,
          }))
        )
      }

      if (routesRes.success) {
        // Routes Service: список маршрутов в поле data
        const routesRaw = routesRes.data as any
        const routesList = Array.isArray(routesRaw) ? routesRaw : routesRaw?.items ?? []

        setRoutes(
          routesList
            .filter((r: any) => r.status === 'active')
            .map((r: any) => ({
              id: r.id,
              title: r.title,
              childId: r.childId,
            }))
        )
      }
    } catch (err: any) {
      console.error('Ошибка загрузки данных:', err)
      setError('Не удалось загрузить данные для формы')
    } finally {
      setIsLoadingData(false)
    }
  }

  /**
   * Обработчик выбора маршрута - загружает фазы и цели маршрута
   */
  const handleRouteSelect = async (routeId: string) => {
    setFormData((prev) => ({ ...prev, routeId, phaseId: '', targetGoalId: '' }))

    if (!routeId) {
      setRoutePhases([])
      setRouteGoals([])
      return
    }

    try {
      const [phasesRes, goalsRes] = await Promise.all([
        routesApi.getPhases(routeId),
        routesApi.getGoals(routeId),
      ])

      if (phasesRes.success) {
        const raw = phasesRes.data as any
        const phases = Array.isArray(raw) ? raw : raw?.items ?? []

        setRoutePhases(
          phases.map((phase: any) => ({
            id: phase.id,
            name: phase.name || phase.title,
          }))
        )
      }

      if (goalsRes.success) {
        const raw = goalsRes.data as any
        const goals = Array.isArray(raw) ? raw : raw?.items ?? []

        setRouteGoals(
          goals.map((goal: any) => ({
            id: goal.id,
            title: goal.targetMetric || goal.description || goal.title,
          }))
        )
      }
    } catch (err: any) {
      console.error('Ошибка загрузки фаз и целей:', err)
    }
  }

  /**
   * Обработчик отправки формы
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Валидация
      if (!formData.childId || !formData.specialistId || !formData.plannedStartDate) {
        throw new Error('Заполните все обязательные поля')
      }

      if (!formData.routeId || !formData.phaseId) {
        throw new Error('Выберите маршрут и фазу')
      }

      if (!formData.exerciseId) {
        throw new Error('Выберите упражнение')
      }

      // Подготовка данных для Assignment schema
      const data: any = {
        childId: formData.childId,
        exerciseId: formData.exerciseId,
        specialistId: formData.specialistId,
        routeId: formData.routeId,
        phaseId: formData.phaseId,
        plannedStartDate: formData.plannedStartDate.split('T')[0], // только дата
        dueDate: formData.dueDate ? formData.dueDate.split('T')[0] : formData.plannedStartDate.split('T')[0],
        deliveryChannel: formData.deliveryChannel,
        expectedDurationMinutes: formData.expectedDurationMinutes,
        frequencyPerWeek: formData.frequencyPerWeek,
        notes: formData.notes || undefined,
      }

      if (formData.targetGoalId) {
        data.targetGoalId = formData.targetGoalId
      }

      const response = await assignmentsApi.createAssignment(data)

      if (response.success) {
        // Успех - закрываем диалог и обновляем список
        onOpenChange(false)
        if (onSuccess) {
          onSuccess()
        }

        // Сбрасываем форму
        setFormData({
          childId: '',
          specialistId: '',
          routeId: '',
          phaseId: '',
          targetGoalId: '',
          exerciseId: '',
          notes: '',
          plannedStartDate: '',
          dueDate: '',
          expectedDurationMinutes: 30,
          deliveryChannel: 'in_person',
          frequencyPerWeek: 1,
        })
        setRoutePhases([])
        setRouteGoals([])
      }
    } catch (err: any) {
      console.error('Ошибка создания назначения:', err)
      setError(err.response?.data?.error?.message || err.message || 'Не удалось создать назначение')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Фильтруем маршруты для выбранного ребенка
  const availableRoutes = routes.filter((r) => r.childId === formData.childId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создать назначение</DialogTitle>
          <DialogDescription>
            Запланируйте занятие или домашнее задание для ребенка
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-neutral-600">Загрузка...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Child Selection */}
            <div className="space-y-2">
              <Label htmlFor="childId">Ребенок *</Label>
              <Select
                value={formData.childId}
                onValueChange={(value) => setFormData({ ...formData, childId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите ребенка" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Specialist Selection */}
            <div className="space-y-2">
              <Label htmlFor="specialistId">Специалист *</Label>
              <Select
                value={formData.specialistId}
                onValueChange={(value) => setFormData({ ...formData, specialistId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите специалиста" />
                </SelectTrigger>
                <SelectContent>
                  {specialists.map((specialist) => (
                    <SelectItem key={specialist.id} value={specialist.id}>
                      {specialist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Route Selection (optional) */}
            {formData.childId && availableRoutes.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="routeId">Маршрут (опционально)</Label>
                <Select
                  value={formData.routeId}
                  onValueChange={handleRouteSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите маршрут" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Без маршрута</SelectItem>
                    {availableRoutes.map((route) => (
                      <SelectItem key={route.id} value={route.id}>
                        {route.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Phase Selection */}
            {formData.routeId && routePhases.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="phaseId">Фаза маршрута *</Label>
                <Select
                  value={formData.phaseId}
                  onValueChange={(value) => setFormData({ ...formData, phaseId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите фазу" />
                  </SelectTrigger>
                  <SelectContent>
                    {routePhases.map((phase) => (
                      <SelectItem key={phase.id} value={phase.id}>
                        {phase.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Route Goal Selection */}
            {formData.routeId && routeGoals.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="targetGoalId">Цель маршрута (опционально)</Label>
                <Select
                  value={formData.targetGoalId}
                  onValueChange={(value) => setFormData({ ...formData, targetGoalId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите цель" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Без цели</SelectItem>
                    {routeGoals.map((goal) => (
                      <SelectItem key={goal.id} value={goal.id}>
                        {goal.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Exercise Selection */}
            <div className="space-y-2">
              <Label htmlFor="exerciseId">Упражнение *</Label>
              <Select
                value={formData.exerciseId}
                onValueChange={(value) => setFormData({ ...formData, exerciseId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите упражнение" />
                </SelectTrigger>
                <SelectContent>
                  {exercises.map((exercise) => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Delivery Channel */}
            <div className="space-y-2">
              <Label htmlFor="deliveryChannel">Канал доставки *</Label>
              <Select
                value={formData.deliveryChannel}
                onValueChange={(value) => setFormData({ ...formData, deliveryChannel: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите канал" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_person">Очно</SelectItem>
                  <SelectItem value="home">Домашнее задание</SelectItem>
                  <SelectItem value="telepractice">Телепрактика</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Planned Start Date */}
            <div className="space-y-2">
              <Label htmlFor="plannedStartDate">Дата начала *</Label>
              <Input
                id="plannedStartDate"
                type="date"
                value={formData.plannedStartDate}
                onChange={(e) => setFormData({ ...formData, plannedStartDate: e.target.value })}
                required
              />
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Срок выполнения</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="expectedDurationMinutes">Длительность (минут) *</Label>
              <Input
                id="expectedDurationMinutes"
                type="number"
                min="5"
                max="180"
                value={formData.expectedDurationMinutes}
                onChange={(e) =>
                  setFormData({ ...formData, expectedDurationMinutes: parseInt(e.target.value) || 30 })
                }
                required
              />
            </div>

            {/* Frequency Per Week */}
            <div className="space-y-2">
              <Label htmlFor="frequencyPerWeek">Частота (раз в неделю) *</Label>
              <Input
                id="frequencyPerWeek"
                type="number"
                min="1"
                max="7"
                value={formData.frequencyPerWeek}
                onChange={(e) =>
                  setFormData({ ...formData, frequencyPerWeek: parseInt(e.target.value) || 1 })
                }
                required
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Заметки</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Дополнительная информация о назначении"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Создание...' : 'Создать назначение'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

