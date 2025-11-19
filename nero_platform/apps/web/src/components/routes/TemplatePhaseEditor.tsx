'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'

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
 * Пропсы компонента TemplatePhaseEditor
 */
interface TemplatePhaseEditorProps {
  /** Начальные данные фазы (для редактирования) */
  phase?: TemplatePhase
  /** Индекс фазы в списке */
  phaseIndex: number
  /** Callback при сохранении фазы */
  onSave: (phase: TemplatePhase) => void
  /** Callback при удалении фазы */
  onDelete: () => void
  /** Callback при отмене */
  onCancel: () => void
}

/**
 * Компонент для создания и редактирования фазы шаблона маршрута
 *
 * Фаза - это этап в шаблоне маршрута.
 * Каждая фаза содержит:
 * - Название (name)
 * - Описание
 * - Длительность в неделях
 * - Подсказка по специальности
 * - Заметки
 */
export function TemplatePhaseEditor({ phase, phaseIndex, onSave, onDelete, onCancel }: TemplatePhaseEditorProps) {
  const [formData, setFormData] = useState<TemplatePhase>({
    name: phase?.name || '',
    description: phase?.description || '',
    orderIndex: phase?.orderIndex ?? phaseIndex,
    durationWeeks: phase?.durationWeeks || 4,
    specialtyHint: phase?.specialtyHint || '',
    notes: phase?.notes || '',
  })

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
   * Обработчик сохранения фазы
   */
  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Укажите название фазы')
      return
    }
    onSave(formData)
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {phase ? 'Редактирование фазы' : 'Новая фаза'} (Порядок: {phaseIndex + 1})
        </h3>

        {/* Название фазы */}
        <div>
          <Label htmlFor="name">Название фазы *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
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

        {/* Подсказка по специальности */}
        <div>
          <Label htmlFor="specialtyHint">Рекомендуемая специальность</Label>
          <select
            id="specialtyHint"
            name="specialtyHint"
            value={formData.specialtyHint}
            onChange={handleChange}
            className="w-full rounded-md border border-neutral-300 px-3 py-2"
          >
            <option value="">Не указана</option>
            <option value="neuropsychologist">Нейропсихолог</option>
            <option value="speech_therapist">Логопед</option>
            <option value="psychologist">Психолог</option>
            <option value="occupational">Эрготерапевт</option>
            <option value="defectologist">Дефектолог</option>
            <option value="other">Другое</option>
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
            placeholder="Дополнительные заметки для специалиста"
            rows={3}
          />
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
            <Button type="button" onClick={handleSave}>Сохранить фазу</Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
