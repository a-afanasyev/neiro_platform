'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TemplatePhaseEditor } from '@/components/routes/TemplatePhaseEditor'
import { TemplateGoalEditor } from '@/components/routes/TemplateGoalEditor'
import { templatesApi } from '@/lib/api'
import { useToast } from '@/hooks/useToast'

/**
 * Интерфейс для фазы шаблона (новый контракт)
 */
interface TemplatePhase {
  id?: string
  name: string
  description?: string
  orderIndex: number
  durationWeeks?: number
  specialtyHint?: string
  notes?: string
}

/**
 * Интерфейс для цели шаблона (новый контракт)
 */
interface TemplateGoal {
  id?: string
  description: string
  category: string
  goalType?: 'skill' | 'behaviour' | 'academic' | 'other'
  targetMetric?: string
  measurementUnit?: string
  baselineGuideline?: string
  targetGuideline?: string
  priority?: 'low' | 'medium' | 'high'
  notes?: string
}

/**
 * Страница создания нового шаблона маршрута
 * 
 * Позволяет специалисту создать новый шаблон с использованием компонентов
 * PhaseEditor и GoalEditor для структурирования маршрута.
 * 
 * После создания базового шаблона можно добавить фазы и цели.
 */
export default function NewTemplatePage() {
  const router = useRouter()
  const { success, error: showError } = useToast()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAgeRange: '',
    severityLevel: '',
  })

  const [phases, setPhases] = useState<TemplatePhase[]>([])
  const [goals, setGoals] = useState<TemplateGoal[]>([])
  const [isAddingPhase, setIsAddingPhase] = useState(false)
  const [editingPhaseIndex, setEditingPhaseIndex] = useState<number | null>(null)
  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [editingGoalIndex, setEditingGoalIndex] = useState<number | null>(null)

  /**
   * Обработчик изменения полей формы
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  /**
   * Обработчик добавления новой фазы
   */
  const handleAddPhase = (phase: TemplatePhase) => {
    setPhases((prev) => [...prev, { ...phase, orderIndex: prev.length }])
    setIsAddingPhase(false)
  }

  /**
   * Обработчик редактирования фазы
   */
  const handleEditPhase = (phase: TemplatePhase) => {
    if (editingPhaseIndex === null) return

    setPhases((prev) =>
      prev.map((p, idx) => (idx === editingPhaseIndex ? phase : p))
    )
    setEditingPhaseIndex(null)
  }

  /**
   * Обработчик удаления фазы
   */
  const handleDeletePhase = (index: number) => {
    if (confirm('Удалить эту фазу?')) {
      setPhases((prev) =>
        prev
          .filter((_, idx) => idx !== index)
          .map((p, idx) => ({ ...p, orderIndex: idx }))
      )
      setEditingPhaseIndex(null)
    }
  }

  /**
   * Обработчик добавления новой цели
   */
  const handleAddGoal = (goal: TemplateGoal) => {
    setGoals((prev) => [...prev, goal])
    setIsAddingGoal(false)
  }

  /**
   * Обработчик редактирования цели
   */
  const handleEditGoal = (goal: TemplateGoal) => {
    if (editingGoalIndex === null) return

    setGoals((prev) =>
      prev.map((g, idx) => (idx === editingGoalIndex ? goal : g))
    )
    setEditingGoalIndex(null)
  }

  /**
   * Обработчик удаления цели
   */
  const handleDeleteGoal = (index: number) => {
    if (confirm('Удалить эту цель?')) {
      setGoals((prev) => prev.filter((_, idx) => idx !== index))
      setEditingGoalIndex(null)
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
      // Подготовка данных для нового контракта API
      const templateData = {
        title: formData.title,
        description: formData.description || undefined,
        targetAgeRange: formData.targetAgeRange || undefined,
        severityLevel: formData.severityLevel || undefined,
        phases: phases.map(p => ({
          name: p.name,
          description: p.description,
          orderIndex: p.orderIndex,
          durationWeeks: p.durationWeeks,
          specialtyHint: p.specialtyHint,
          notes: p.notes,
        })),
        goals: goals.map(g => ({
          description: g.description,
          category: g.category,
          goalType: g.goalType,
          targetMetric: g.targetMetric,
          measurementUnit: g.measurementUnit,
          baselineGuideline: g.baselineGuideline,
          targetGuideline: g.targetGuideline,
          priority: g.priority,
          notes: g.notes,
        })),
      }

      // Создаем шаблон с фазами и целями в одном запросе
      const response = await templatesApi.createTemplate(templateData)

      if (response.success) {
        const templateId = response.data.id
        success('Шаблон создан успешно', 'Все фазы и цели добавлены')
        router.push(`/dashboard/templates/${templateId}`)
      }
    } catch (err: any) {
      console.error('Ошибка создания шаблона:', err)
      const errorMsg = err.response?.data?.error?.message || 'Не удалось создать шаблон'
      setError(errorMsg)
      showError(errorMsg, 'Проверьте корректность данных')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'specialist']}>
      <DashboardLayout>
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Создать шаблон</h1>
            <p className="text-neutral-600 mt-1">
              Создайте новый шаблон коррекционной программы
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
                <CardDescription>
                  Базовые сведения о шаблоне
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Название шаблона *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Например: Программа развития речи (3-6 лет)"
                    required
                    maxLength={255}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Подробное описание программы и ее целей"
                    rows={4}
                    maxLength={2000}
                  />
                </div>

                {/* Target Age Range */}
                <div className="space-y-2">
                  <Label htmlFor="targetAgeRange">Целевой возраст</Label>
                  <Input
                    id="targetAgeRange"
                    name="targetAgeRange"
                    value={formData.targetAgeRange}
                    onChange={handleChange}
                    placeholder="Например: 3-6, 4-8, 2-10"
                    maxLength={50}
                  />
                  <p className="text-sm text-neutral-600">
                    Диапазон возраста в формате "мин-макс"
                  </p>
                </div>

                {/* Severity Level */}
                <div className="space-y-2">
                  <Label htmlFor="severityLevel">Уровень сложности</Label>
                  <select
                    id="severityLevel"
                    name="severityLevel"
                    value={formData.severityLevel}
                    onChange={handleChange}
                    className="w-full rounded-md border border-neutral-300 px-3 py-2"
                  >
                    <option value="">Не указан</option>
                    <option value="mild">Легкий</option>
                    <option value="mild_to_moderate">Легкий-Умеренный</option>
                    <option value="moderate">Умеренный</option>
                    <option value="moderate_to_severe">Умеренный-Тяжелый</option>
                    <option value="severe">Тяжелый</option>
                    <option value="varies">Варьируется</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Phases */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Фазы программы</CardTitle>
                    <CardDescription>
                      Добавьте этапы реализации программы
                    </CardDescription>
                  </div>
                  {!isAddingPhase && editingPhaseIndex === null && (
                    <Button type="button" onClick={() => setIsAddingPhase(true)}>
                      + Добавить фазу
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* List of phases */}
                {phases.length > 0 && (
                  <div className="space-y-3">
                    {phases.map((phase, index) => (
                      <Card key={index} className="bg-neutral-50">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{phase.name}</h4>
                              <p className="text-sm text-neutral-600 mb-2">
                                {phase.description || 'Без описания'}
                              </p>
                              <div className="flex gap-4 text-xs text-neutral-500">
                                <span>📅 {phase.durationWeeks || '?'} недель</span>
                                {phase.specialtyHint && (
                                  <span>👤 {phase.specialtyHint}</span>
                                )}
                              </div>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingPhaseIndex(index)}
                            >
                              Редактировать
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Empty state */}
                {phases.length === 0 && !isAddingPhase && (
                  <div className="text-center py-8 text-neutral-500">
                    <p className="mb-2">Нет фаз. Добавьте первую фазу программы.</p>
                    <p className="text-sm">
                      Фазы помогут структурировать программу по этапам
                    </p>
                  </div>
                )}

                {/* Add phase form */}
                {isAddingPhase && (
                  <TemplatePhaseEditor
                    phaseIndex={phases.length}
                    onSave={handleAddPhase}
                    onDelete={() => setIsAddingPhase(false)}
                    onCancel={() => setIsAddingPhase(false)}
                  />
                )}

                {/* Edit phase form */}
                {editingPhaseIndex !== null && (
                  <TemplatePhaseEditor
                    phase={phases[editingPhaseIndex]}
                    phaseIndex={editingPhaseIndex}
                    onSave={handleEditPhase}
                    onDelete={() => handleDeletePhase(editingPhaseIndex)}
                    onCancel={() => setEditingPhaseIndex(null)}
                  />
                )}
              </CardContent>
            </Card>

            {/* Goals */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Цели программы</CardTitle>
                    <CardDescription>
                      Добавьте цели, которые должны быть достигнуты
                    </CardDescription>
                  </div>
                  {!isAddingGoal && editingGoalIndex === null && (
                    <Button type="button" onClick={() => setIsAddingGoal(true)}>
                      + Добавить цель
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* List of goals */}
                {goals.length > 0 && (
                  <div className="space-y-3">
                    {goals.map((goal, index) => (
                      <Card key={index} className="bg-neutral-50">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={
                                  goal.priority === 'high' ? 'destructive' :
                                  goal.priority === 'medium' ? 'default' : 'secondary'
                                }>
                                  {goal.priority === 'high' ? 'Высокий' :
                                   goal.priority === 'medium' ? 'Средний' : 'Низкий'}
                                </Badge>
                                <Badge variant="outline">{goal.category}</Badge>
                                {goal.goalType && (
                                  <Badge variant="outline">{goal.goalType}</Badge>
                                )}
                              </div>
                              <p className="text-sm text-neutral-700 mb-2">
                                {goal.description}
                              </p>
                              <div className="flex gap-4 text-xs text-neutral-500">
                                {goal.targetMetric && (
                                  <span>📊 {goal.targetMetric} {goal.measurementUnit && `(${goal.measurementUnit})`}</span>
                                )}
                              </div>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingGoalIndex(index)}
                            >
                              Редактировать
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Empty state */}
                {goals.length === 0 && !isAddingGoal && (
                  <div className="text-center py-8 text-neutral-500">
                    <p className="mb-2">Нет целей. Добавьте цели программы.</p>
                    <p className="text-sm">
                      Цели определяют ожидаемые результаты для ребенка
                    </p>
                  </div>
                )}

                {/* Add goal form */}
                {isAddingGoal && (
                  <TemplateGoalEditor
                    onSave={handleAddGoal}
                    onDelete={() => setIsAddingGoal(false)}
                    onCancel={() => setIsAddingGoal(false)}
                  />
                )}

                {/* Edit goal form */}
                {editingGoalIndex !== null && (
                  <TemplateGoalEditor
                    goal={goals[editingGoalIndex]}
                    onSave={handleEditGoal}
                    onDelete={() => handleDeleteGoal(editingGoalIndex)}
                    onCancel={() => setEditingGoalIndex(null)}
                  />
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Создание...' : 'Создать шаблон'}
              </Button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

