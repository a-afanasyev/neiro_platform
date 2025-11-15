'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

/**
 * Интерфейс для цели маршрута
 */
interface RouteGoal {
  id?: string
  title: string
  domain: string
  description: string
  priority: 'low' | 'medium' | 'high'
  targetDate?: string
  successCriteria?: Record<string, any>
  status?: string
}

/**
 * Пропсы компонента GoalEditor
 */
interface GoalEditorProps {
  /** Начальные данные цели (для редактирования) */
  goal?: RouteGoal
  /** Callback при сохранении цели */
  onSave: (goal: RouteGoal) => void
  /** Callback при отмене */
  onCancel: () => void
}

/**
 * Компонент для создания и редактирования цели маршрута
 * 
 * Позволяет специалисту задать:
 * - Название цели
 * - Домен (область развития: cognitive, speech, motor, social, sensory)
 * - Описание
 * - Приоритет (низкий, средний, высокий)
 * - Целевую дату достижения
 * - Критерии успеха (в формате JSON)
 */
export function GoalEditor({ goal, onSave, onCancel }: GoalEditorProps) {
  const [formData, setFormData] = useState<RouteGoal>({
    title: goal?.title || '',
    domain: goal?.domain || 'cognitive',
    description: goal?.description || '',
    priority: goal?.priority || 'medium',
    targetDate: goal?.targetDate || '',
    successCriteria: goal?.successCriteria || {},
  })

  const [criteriaJson, setCriteriaJson] = useState(
    JSON.stringify(goal?.successCriteria || {}, null, 2)
  )

  /**
   * Обработчик изменения полей формы
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  /**
   * Обработчик изменения критериев успеха (JSON)
   */
  const handleCriteriaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCriteriaJson(e.target.value)
  }

  /**
   * Обработчик сохранения цели
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Парсим JSON критериев успеха
      const successCriteria = criteriaJson ? JSON.parse(criteriaJson) : {}

      // Формируем данные цели
      const goalData: RouteGoal = {
        ...formData,
        successCriteria,
      }

      // Вызываем callback
      onSave(goalData)
    } catch (error) {
      alert('Ошибка в формате JSON критериев успеха')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Название цели */}
      <div>
        <Label htmlFor="title">Название цели *</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Например: Развитие речи"
          required
        />
      </div>

      {/* Домен (область развития) */}
      <div>
        <Label htmlFor="domain">Область развития *</Label>
        <select
          id="domain"
          name="domain"
          value={formData.domain}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          required
        >
          <option value="cognitive">Когнитивное развитие</option>
          <option value="speech">Речевое развитие</option>
          <option value="motor">Моторное развитие</option>
          <option value="social">Социальное развитие</option>
          <option value="sensory">Сенсорное развитие</option>
        </select>
      </div>

      {/* Описание */}
      <div>
        <Label htmlFor="description">Описание *</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Подробное описание цели"
          rows={3}
          required
        />
      </div>

      {/* Приоритет */}
      <div>
        <Label htmlFor="priority">Приоритет *</Label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          required
        >
          <option value="low">Низкий</option>
          <option value="medium">Средний</option>
          <option value="high">Высокий</option>
        </select>
      </div>

      {/* Целевая дата */}
      <div>
        <Label htmlFor="targetDate">Целевая дата</Label>
        <Input
          id="targetDate"
          name="targetDate"
          type="date"
          value={formData.targetDate}
          onChange={handleChange}
        />
      </div>

      {/* Критерии успеха (JSON) */}
      <div>
        <Label htmlFor="successCriteria">Критерии успеха (JSON)</Label>
        <Textarea
          id="successCriteria"
          name="successCriteria"
          value={criteriaJson}
          onChange={handleCriteriaChange}
          placeholder='{"wordCount": 100, "accuracy": 85}'
          rows={4}
          className="font-mono text-sm"
        />
        <p className="text-sm text-gray-500 mt-1">
          Формат: JSON объект с критериями успеха, например: {'{'}
          "wordCount": 100, "accuracy": 85{'}'}
        </p>
      </div>

      {/* Кнопки действий */}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit">Сохранить</Button>
      </div>
    </form>
  )
}

