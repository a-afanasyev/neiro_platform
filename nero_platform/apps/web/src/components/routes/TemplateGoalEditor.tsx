'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'

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
 * Пропсы компонента TemplateGoalEditor
 */
interface TemplateGoalEditorProps {
  /** Начальные данные цели (для редактирования) */
  goal?: TemplateGoal
  /** Callback при сохранении цели */
  onSave: (goal: TemplateGoal) => void
  /** Callback при удалении цели */
  onDelete: () => void
  /** Callback при отмене */
  onCancel: () => void
}

/**
 * Компонент для создания и редактирования цели шаблона
 *
 * Цели шаблона определяют ожидаемые результаты программы.
 * Каждая цель содержит:
 * - Описание (description)
 * - Категорию (category)
 * - Тип цели (goalType)
 * - Целевую метрику и единицу измерения
 * - Базовые и целевые показатели
 * - Приоритет
 * - Заметки
 */
export function TemplateGoalEditor({ goal, onSave, onDelete, onCancel }: TemplateGoalEditorProps) {
  const [formData, setFormData] = useState<TemplateGoal>({
    description: goal?.description || '',
    category: goal?.category || 'cognitive',
    goalType: goal?.goalType || 'skill',
    targetMetric: goal?.targetMetric || '',
    measurementUnit: goal?.measurementUnit || '',
    baselineGuideline: goal?.baselineGuideline || '',
    targetGuideline: goal?.targetGuideline || '',
    priority: goal?.priority || 'medium',
    notes: goal?.notes || '',
  })

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
   * Обработчик сохранения цели
   */
  const handleSave = () => {
    if (!formData.description.trim()) {
      alert('Укажите описание цели')
      return
    }
    if (!formData.category) {
      alert('Выберите категорию')
      return
    }
    onSave(formData)
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {goal ? 'Редактирование цели' : 'Новая цель'}
        </h3>

        {/* Описание цели */}
        <div>
          <Label htmlFor="description">Описание цели *</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Например: Улучшить понимание устной речи в повседневных ситуациях"
            rows={3}
            required
            maxLength={1000}
          />
        </div>

        {/* Категория */}
        <div>
          <Label htmlFor="category">Категория *</Label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full rounded-md border border-neutral-300 px-3 py-2"
            required
          >
            <option value="cognitive">Когнитивное развитие</option>
            <option value="speech">Речевое развитие</option>
            <option value="motor">Моторное развитие</option>
            <option value="social">Социальное развитие</option>
            <option value="sensory">Сенсорное развитие</option>
            <option value="behavioral">Поведенческое развитие</option>
            <option value="academic">Академические навыки</option>
            <option value="other">Другое</option>
          </select>
        </div>

        {/* Тип цели */}
        <div>
          <Label htmlFor="goalType">Тип цели</Label>
          <select
            id="goalType"
            name="goalType"
            value={formData.goalType}
            onChange={handleChange}
            className="w-full rounded-md border border-neutral-300 px-3 py-2"
          >
            <option value="skill">Навык</option>
            <option value="behaviour">Поведение</option>
            <option value="academic">Академический</option>
            <option value="other">Другое</option>
          </select>
        </div>

        {/* Целевая метрика */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="targetMetric">Целевая метрика</Label>
            <Input
              id="targetMetric"
              name="targetMetric"
              value={formData.targetMetric}
              onChange={handleChange}
              placeholder="Например: Количество слов"
              maxLength={100}
            />
          </div>
          <div>
            <Label htmlFor="measurementUnit">Единица измерения</Label>
            <Input
              id="measurementUnit"
              name="measurementUnit"
              value={formData.measurementUnit}
              onChange={handleChange}
              placeholder="Например: слов/мин"
              maxLength={50}
            />
          </div>
        </div>

        {/* Базовый и целевой показатели */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="baselineGuideline">Базовый показатель</Label>
            <Textarea
              id="baselineGuideline"
              name="baselineGuideline"
              value={formData.baselineGuideline}
              onChange={handleChange}
              placeholder="Ожидаемый начальный уровень ребенка"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="targetGuideline">Целевой показатель</Label>
            <Textarea
              id="targetGuideline"
              name="targetGuideline"
              value={formData.targetGuideline}
              onChange={handleChange}
              placeholder="Ожидаемый результат после программы"
              rows={2}
            />
          </div>
        </div>

        {/* Приоритет */}
        <div>
          <Label htmlFor="priority">Приоритет</Label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full rounded-md border border-neutral-300 px-3 py-2"
          >
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>
        </div>

        {/* Заметки */}
        <div>
          <Label htmlFor="notes">Заметки</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Дополнительная информация для специалиста"
            rows={3}
          />
        </div>

        {/* Кнопки действий */}
        <div className="flex gap-2 justify-between">
          <Button type="button" variant="destructive" onClick={onDelete}>
            Удалить цель
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Отмена
            </Button>
            <Button type="button" onClick={handleSave}>Сохранить цель</Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
