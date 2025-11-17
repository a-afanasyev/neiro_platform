'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { GoalEditor } from './GoalEditor'

/**
 * Интерфейс для цели фазы маршрута
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
 * Пропсы компонента PhaseEditor
 */
interface PhaseEditorProps {
  /** Начальные данные фазы (для редактирования) */
  phase?: RoutePhase
  /** Индекс фазы в списке */
  phaseIndex: number
  /** Callback при сохранении фазы */
  onSave: (phase: RoutePhase) => void
  /** Callback при удалении фазы */
  onDelete: () => void
  /** Callback при отмене */
  onCancel: () => void
}

/**
 * Компонент для создания и редактирования фазы маршрута
 *
 * Фаза - это этап в индивидуальном маршруте ребенка.
 * Каждая фаза содержит:
 * - Название (title)
 * - Описание
 * - Длительность в неделях
 * - Цели (goals) с приоритетами и критериями успеха
 */
export function PhaseEditor({ phase, phaseIndex, onSave, onDelete, onCancel }: PhaseEditorProps) {
  const [formData, setFormData] = useState<RoutePhase>({
    title: phase?.title || '',
    description: phase?.description || '',
    orderIndex: phase?.orderIndex ?? phaseIndex,
    durationWeeks: phase?.durationWeeks || 4,
    objectives: phase?.objectives || {},
    goals: phase?.goals || [],
  })

  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [editingGoalIndex, setEditingGoalIndex] = useState<number | null>(null)
  const [objectivesJson, setObjectivesJson] = useState(
    JSON.stringify(formData.objectives || {}, null, 2)
  )

  /**
   * Обработчик изменения полей формы
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'durationWeeks' ? parseInt(value) || 0 : value,
    }))
  }

  /**
   * Обработчик изменения objectives (JSON)
   */
  const handleObjectivesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setObjectivesJson(e.target.value)
  }

  /**
   * Обработчик добавления новой цели
   */
  const handleAddGoal = (goal: PhaseGoal) => {
    setFormData((prev) => ({
      ...prev,
      goals: [...(prev.goals || []), goal],
    }))
    setIsAddingGoal(false)
  }

  /**
   * Обработчик редактирования цели
   */
  const handleEditGoal = (goal: PhaseGoal) => {
    if (editingGoalIndex === null) return

    setFormData((prev) => ({
      ...prev,
      goals: (prev.goals || []).map((g, idx) => (idx === editingGoalIndex ? goal : g)),
    }))
    setEditingGoalIndex(null)
  }

  /**
   * Обработчик удаления цели
   */
  const handleDeleteGoal = (index: number) => {
    if (confirm('Удалить эту цель?')) {
      setFormData((prev) => ({
        ...prev,
        goals: (prev.goals || []).filter((_, idx) => idx !== index),
      }))
      setEditingGoalIndex(null)
    }
  }

  /**
   * Обработчик сохранения фазы
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Парсим JSON objectives
      const objectives = objectivesJson ? JSON.parse(objectivesJson) : {}

      // Формируем данные фазы с актуальными objectives
      const phaseData: RoutePhase = {
        ...formData,
        objectives,
      }

      onSave(phaseData)
    } catch (error) {
      alert('Ошибка в формате JSON задач фазы (objectives)')
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-lg font-semibold">
          {phase ? 'Редактирование фазы' : 'Новая фаза'} (Порядок: {phaseIndex + 1})
        </h3>

        {/* Название фазы */}
        <div>
          <Label htmlFor="title">Название фазы *</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Например: Диагностика и адаптация"
            required
            maxLength={255}
          />
        </div>

        {/* Описание */}
        <div>
          <Label htmlFor="description">Описание</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Подробное описание фазы"
            rows={3}
            maxLength={1000}
          />
        </div>

        {/* Длительность */}
        <div>
          <Label htmlFor="durationWeeks">Длительность (недели)</Label>
          <Input
            id="durationWeeks"
            name="durationWeeks"
            type="number"
            min="1"
            max="52"
            value={formData.durationWeeks}
            onChange={handleChange}
          />
        </div>

        {/* Задачи фазы (objectives) */}
        <div>
          <Label htmlFor="objectives">Задачи фазы (JSON)</Label>
          <Textarea
            id="objectives"
            name="objectives"
            value={objectivesJson}
            onChange={handleObjectivesChange}
            placeholder='{"main": "Основная задача", "secondary": ["Дополнительная 1", "Дополнительная 2"]}'
            rows={4}
            className="font-mono text-sm"
          />
          <p className="text-sm text-gray-500 mt-1">
            Формат: JSON объект с общими задачами фазы
          </p>
        </div>

        {/* Цели фазы */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>Цели фазы</Label>
            {!isAddingGoal && editingGoalIndex === null && (
              <Button type="button" size="sm" onClick={() => setIsAddingGoal(true)}>
                + Добавить цель
              </Button>
            )}
          </div>

          {/* Список целей */}
          {formData.goals && formData.goals.length > 0 && (
            <div className="space-y-2">
              {formData.goals.map((goal, index) => (
                <Card key={index} className="p-3 bg-neutral-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs ${
                            goal.priority === 'high'
                              ? 'bg-red-100 text-red-700'
                              : goal.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {goal.priority === 'high'
                            ? 'Высокий'
                            : goal.priority === 'medium'
                              ? 'Средний'
                              : 'Низкий'}
                        </span>
                        <span className="text-xs text-neutral-500">{goal.domain}</span>
                      </div>
                      <h4 className="font-medium text-sm">{goal.title}</h4>
                      <p className="text-xs text-neutral-600 mt-1">{goal.description}</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingGoalIndex(index)}
                    >
                      ✏️
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Пустое состояние */}
          {(!formData.goals || formData.goals.length === 0) && !isAddingGoal && (
            <div className="text-center py-4 text-neutral-500 text-sm">
              Нет целей. Добавьте цели для этой фазы.
            </div>
          )}

          {/* Форма добавления цели */}
          {isAddingGoal && (
            <Card className="p-4 border-dashed">
              <GoalEditor onSave={handleAddGoal} onCancel={() => setIsAddingGoal(false)} />
            </Card>
          )}

          {/* Форма редактирования цели */}
          {editingGoalIndex !== null && (
            <Card className="p-4 border-dashed">
              <GoalEditor
                goal={formData.goals![editingGoalIndex]}
                onSave={handleEditGoal}
                onCancel={() => setEditingGoalIndex(null)}
                onDelete={() => handleDeleteGoal(editingGoalIndex)}
              />
            </Card>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="flex gap-2 justify-between">
          <Button type="button" variant="destructive" onClick={onDelete}>
            Удалить фазу
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Отмена
            </Button>
            <Button type="submit">Сохранить фазу</Button>
          </div>
        </div>
      </form>
    </Card>
  )
}
