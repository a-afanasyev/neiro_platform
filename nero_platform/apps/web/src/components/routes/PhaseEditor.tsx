'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { GoalEditor } from './GoalEditor'

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
 * - Название и описание
 * - Длительность в неделях
 * - Список задач (objectives)
 * - Список целей (goals) с их критериями успеха
 */
export function PhaseEditor({ phase, phaseIndex, onSave, onDelete, onCancel }: PhaseEditorProps) {
  const [formData, setFormData] = useState<RoutePhase>({
    title: phase?.title || '',
    description: phase?.description || '',
    orderIndex: phase?.orderIndex ?? phaseIndex,
    durationWeeks: phase?.durationWeeks || 4,
    objectives: phase?.objectives || { items: [] },
    goals: phase?.goals || [],
  })

  const [objectivesText, setObjectivesText] = useState(
    (phase?.objectives?.items || []).join('\n')
  )

  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [editingGoalIndex, setEditingGoalIndex] = useState<number | null>(null)

  /**
   * Обработчик изменения полей формы
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'durationWeeks' ? parseInt(value) || 0 : value,
    }))
  }

  /**
   * Обработчик изменения задач фазы
   */
  const handleObjectivesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setObjectivesText(e.target.value)
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
   * Обработчик редактирования существующей цели
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
    }
  }

  /**
   * Обработчик сохранения фазы
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Парсим задачи из текста
    const objectives = {
      items: objectivesText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
    }

    // Формируем данные фазы
    const phaseData: RoutePhase = {
      ...formData,
      objectives,
    }

    // Вызываем callback
    onSave(phaseData)
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
          />
        </div>

        {/* Описание */}
        <div>
          <Label htmlFor="description">Описание *</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Подробное описание фазы"
            rows={3}
            required
          />
        </div>

        {/* Длительность */}
        <div>
          <Label htmlFor="durationWeeks">Длительность (недели) *</Label>
          <Input
            id="durationWeeks"
            name="durationWeeks"
            type="number"
            min="1"
            value={formData.durationWeeks}
            onChange={handleChange}
            required
          />
        </div>

        {/* Задачи фазы */}
        <div>
          <Label htmlFor="objectives">Задачи фазы (по одной на строку)</Label>
          <Textarea
            id="objectives"
            name="objectives"
            value={objectivesText}
            onChange={handleObjectivesChange}
            placeholder="Провести диагностику&#10;Установить контакт с ребенком&#10;Определить базовый уровень"
            rows={5}
          />
        </div>

        {/* Цели фазы */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label>Цели фазы</Label>
            {!isAddingGoal && editingGoalIndex === null && (
              <Button type="button" size="sm" onClick={() => setIsAddingGoal(true)}>
                + Добавить цель
              </Button>
            )}
          </div>

          {/* Список целей */}
          {formData.goals && formData.goals.length > 0 && (
            <div className="space-y-2 mb-4">
              {formData.goals.map((goal, index) => (
                <Card key={index} className="p-3 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{goal.title}</h4>
                      <p className="text-sm text-gray-600">{goal.description}</p>
                      <div className="flex gap-2 mt-1 text-xs text-gray-500">
                        <span>Приоритет: {goal.priority}</span>
                        <span>Домен: {goal.domain}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingGoalIndex(index)}
                      >
                        ✏️
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteGoal(index)}
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Форма добавления цели */}
          {isAddingGoal && (
            <Card className="p-4 mb-4">
              <h4 className="font-medium mb-3">Новая цель</h4>
              <GoalEditor
                onSave={handleAddGoal}
                onCancel={() => setIsAddingGoal(false)}
              />
            </Card>
          )}

          {/* Форма редактирования цели */}
          {editingGoalIndex !== null && (
            <Card className="p-4 mb-4">
              <h4 className="font-medium mb-3">Редактирование цели</h4>
              <GoalEditor
                goal={formData.goals![editingGoalIndex]}
                onSave={handleEditGoal}
                onCancel={() => setEditingGoalIndex(null)}
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

