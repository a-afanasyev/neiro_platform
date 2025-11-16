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
  const [routeGoals, setRouteGoals] = useState<Array<{ id: string; title: string }>>([])

  // Форма
  const [formData, setFormData] = useState({
    childId: '',
    specialistId: '',
    routeId: '',
    routeGoalId: '',
    exerciseId: '',
    title: '',
    description: '',
    scheduledFor: '',
    durationMinutes: 30,
    location: '',
    isHomework: false,
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
        setChildren(
          childrenRes.data.items.map((child: any) => ({
            id: child.id,
            name: `${child.firstName} ${child.lastName}`,
          }))
        )
      }

      if (usersRes.success) {
        const specialistUsers = usersRes.data.items.filter(
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
        setExercises(
          exercisesRes.data.items.map((ex: any) => ({
            id: ex.id,
            title: ex.title,
          }))
        )
      }

      if (routesRes.success) {
        setRoutes(
          routesRes.data.items
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
   * Обработчик выбора маршрута - загружает цели маршрута
   */
  const handleRouteSelect = async (routeId: string) => {
    setFormData((prev) => ({ ...prev, routeId, routeGoalId: '' }))
    
    if (!routeId) {
      setRouteGoals([])
      return
    }

    try {
      const response = await routesApi.getGoals(routeId)
      if (response.success) {
        setRouteGoals(
          response.data.items.map((goal: any) => ({
            id: goal.id,
            title: goal.title,
          }))
        )
      }
    } catch (err: any) {
      console.error('Ошибка загрузки целей:', err)
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
      if (!formData.childId || !formData.specialistId || !formData.scheduledFor) {
        throw new Error('Заполните все обязательные поля')
      }

      if (!formData.exerciseId && !formData.routeGoalId) {
        throw new Error('Выберите упражнение или цель маршрута')
      }

      // Подготовка данных
      const data: any = {
        childId: formData.childId,
        specialistId: formData.specialistId,
        title: formData.title,
        description: formData.description,
        scheduledFor: new Date(formData.scheduledFor).toISOString(),
        durationMinutes: formData.durationMinutes,
        location: formData.location,
        isHomework: formData.isHomework,
        status: 'scheduled',
      }

      if (formData.exerciseId) {
        data.exerciseId = formData.exerciseId
      }

      if (formData.routeGoalId) {
        data.routeGoalId = formData.routeGoalId
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
          routeGoalId: '',
          exerciseId: '',
          title: '',
          description: '',
          scheduledFor: '',
          durationMinutes: 30,
          location: '',
          isHomework: false,
        })
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

            {/* Route Goal Selection */}
            {formData.routeId && routeGoals.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="routeGoalId">Цель маршрута</Label>
                <Select
                  value={formData.routeGoalId}
                  onValueChange={(value) => setFormData({ ...formData, routeGoalId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите цель" />
                  </SelectTrigger>
                  <SelectContent>
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
              <Label htmlFor="exerciseId">Упражнение</Label>
              <Select
                value={formData.exerciseId}
                onValueChange={(value) => setFormData({ ...formData, exerciseId: value })}
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

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Название назначения *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Например: Занятие по развитию речи"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Дополнительная информация о назначении"
                rows={3}
              />
            </div>

            {/* Scheduled Date/Time */}
            <div className="space-y-2">
              <Label htmlFor="scheduledFor">Дата и время *</Label>
              <Input
                id="scheduledFor"
                type="datetime-local"
                value={formData.scheduledFor}
                onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                required
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="durationMinutes">Длительность (минут) *</Label>
              <Input
                id="durationMinutes"
                type="number"
                min="5"
                max="180"
                value={formData.durationMinutes}
                onChange={(e) =>
                  setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 30 })
                }
                required
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Место проведения</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Кабинет № 5"
              />
            </div>

            {/* Is Homework */}
            <div className="flex items-center space-x-2">
              <input
                id="isHomework"
                type="checkbox"
                checked={formData.isHomework}
                onChange={(e) => setFormData({ ...formData, isHomework: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isHomework" className="cursor-pointer">
                Домашнее задание
              </Label>
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

