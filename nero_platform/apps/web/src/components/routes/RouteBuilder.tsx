'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { PhaseEditor } from './PhaseEditor'
import { useToast } from '@/hooks/useToast'

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
 * Интерфейс для маршрута
 */
interface Route {
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
 * Пропсы компонента RouteBuilder
 */
interface RouteBuilderProps {
  /** ID ребенка, для которого создается маршрут */
  childId: string
  /** ID ведущего специалиста */
  leadSpecialistId: string
  /** Начальные данные маршрута (для редактирования) */
  route?: Route
  /** Список доступных детей для выбора */
  children?: Array<{ id: string; name: string }>
  /** Список доступных шаблонов */
  templates?: Array<{ id: string; title: string; durationWeeks: number }>
  /** Callback при сохранении маршрута */
  onSave: (route: Route) => Promise<void>
  /** Callback при отмене */
  onCancel: () => void
}

/**
 * Компонент для создания и редактирования индивидуального маршрута
 * 
 * RouteBuilder - это конструктор маршрута, который позволяет:
 * - Задать базовую информацию о маршруте (название, описание, горизонт планирования)
 * - Выбрать шаблон маршрута (опционально)
 * - Создать и настроить фазы маршрута
 * - Добавить цели к каждой фазе
 * 
 * Компонент поддерживает как создание нового маршрута, так и редактирование существующего.
 */
export function RouteBuilder({
  childId,
  leadSpecialistId,
  route,
  children,
  templates,
  onSave,
  onCancel,
}: RouteBuilderProps) {
  const { success, error } = useToast()

  // Состояние формы маршрута
  const [formData, setFormData] = useState<Route>({
    childId: route?.childId || childId,
    leadSpecialistId: route?.leadSpecialistId || leadSpecialistId,
    templateId: route?.templateId,
    title: route?.title || '',
    summary: route?.summary || '',
    planHorizonWeeks: route?.planHorizonWeeks || 12,
    phases: route?.phases || [],
  })

  // Состояние редактирования фаз
  const [editingPhaseIndex, setEditingPhaseIndex] = useState<number | null>(null)
  const [isAddingPhase, setIsAddingPhase] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  /**
   * Обработчик изменения базовых полей маршрута
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'planHorizonWeeks' ? parseInt(value) || 0 : value,
    }))
  }

  /**
   * Обработчик выбора шаблона
   */
  const handleTemplateSelect = (templateId: string) => {
    const selectedTemplate = templates?.find((t) => t.id === templateId)
    if (selectedTemplate) {
      setFormData((prev) => ({
        ...prev,
        templateId,
        planHorizonWeeks: selectedTemplate.durationWeeks,
      }))
    }
  }

  /**
   * Обработчик добавления новой фазы
   */
  const handleAddPhase = (phase: RoutePhase) => {
    setFormData((prev) => ({
      ...prev,
      phases: [...(prev.phases || []), { ...phase, orderIndex: prev.phases?.length || 0 }],
    }))
    setIsAddingPhase(false)
    success('Фаза добавлена')
  }

  /**
   * Обработчик редактирования существующей фазы
   */
  const handleEditPhase = (phase: RoutePhase) => {
    if (editingPhaseIndex === null) return

    setFormData((prev) => ({
      ...prev,
      phases: (prev.phases || []).map((p, idx) => (idx === editingPhaseIndex ? phase : p)),
    }))
    setEditingPhaseIndex(null)
    success('Фаза обновлена')
  }

  /**
   * Обработчик удаления фазы
   */
  const handleDeletePhase = (index: number) => {
    if (confirm('Удалить эту фазу? Все цели фазы также будут удалены.')) {
      setFormData((prev) => ({
        ...prev,
        phases: (prev.phases || [])
          .filter((_, idx) => idx !== index)
          .map((p, idx) => ({ ...p, orderIndex: idx })),
      }))
      setEditingPhaseIndex(null)
      success('Фаза удалена')
    }
  }

  /**
   * Обработчик сохранения маршрута
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Валидация
    if (!formData.title.trim()) {
      error('Укажите название маршрута')
      return
    }

    if (!formData.phases || formData.phases.length === 0) {
      error('Добавьте хотя бы одну фазу к маршруту')
      return
    }

    try {
      setIsSaving(true)
      await onSave(formData)
      success('Маршрут сохранен')
    } catch (err) {
      error('Ошибка при сохранении маршрута')
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Базовая информация о маршруте */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Базовая информация</h2>

          {/* Выбор ребенка (если доступен список) */}
          {children && children.length > 0 && (
            <div className="mb-4">
              <Label htmlFor="childId">Ребенок *</Label>
              <select
                id="childId"
                name="childId"
                value={formData.childId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Выберите ребенка</option>
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Выбор шаблона (опционально) */}
          {templates && templates.length > 0 && (
            <div className="mb-4">
              <Label htmlFor="templateId">Шаблон (опционально)</Label>
              <select
                id="templateId"
                name="templateId"
                value={formData.templateId || ''}
                onChange={(e) => {
                  handleChange(e)
                  if (e.target.value) {
                    handleTemplateSelect(e.target.value)
                  }
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Без шаблона</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.title} ({template.durationWeeks} недель)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Название маршрута */}
          <div className="mb-4">
            <Label htmlFor="title">Название маршрута *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Например: Индивидуальный маршрут Алисы"
              required
            />
          </div>

          {/* Краткое описание */}
          <div className="mb-4">
            <Label htmlFor="summary">Краткое описание</Label>
            <Textarea
              id="summary"
              name="summary"
              value={formData.summary || ''}
              onChange={handleChange}
              placeholder="Краткое описание целей маршрута"
              rows={3}
            />
          </div>

          {/* Горизонт планирования */}
          <div>
            <Label htmlFor="planHorizonWeeks">Горизонт планирования (недели) *</Label>
            <Input
              id="planHorizonWeeks"
              name="planHorizonWeeks"
              type="number"
              min="1"
              value={formData.planHorizonWeeks}
              onChange={handleChange}
              required
            />
          </div>
        </Card>

        {/* Фазы маршрута */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Фазы маршрута</h2>
            {!isAddingPhase && editingPhaseIndex === null && (
              <Button type="button" onClick={() => setIsAddingPhase(true)}>
                + Добавить фазу
              </Button>
            )}
          </div>

          {/* Список фаз */}
          {formData.phases && formData.phases.length > 0 && (
            <div className="space-y-4 mb-4">
              {formData.phases.map((phase, index) => (
                <Card key={index} className="p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block bg-blue-500 text-white rounded-full w-6 h-6 text-center text-sm leading-6">
                          {index + 1}
                        </span>
                        <h3 className="font-semibold">{phase.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{phase.description}</p>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>📅 {phase.durationWeeks} недель</span>
                        <span>🎯 {phase.goals?.length || 0} целей</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingPhaseIndex(index)}
                      >
                        ✏️ Редактировать
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Сообщение, если фаз нет */}
          {(!formData.phases || formData.phases.length === 0) && !isAddingPhase && (
            <div className="text-center py-8 text-gray-500">
              <p>Нет фаз. Добавьте первую фазу маршрута.</p>
            </div>
          )}

          {/* Форма добавления фазы */}
          {isAddingPhase && (
            <div className="mb-4">
              <PhaseEditor
                phaseIndex={formData.phases?.length || 0}
                onSave={handleAddPhase}
                onDelete={() => setIsAddingPhase(false)}
                onCancel={() => setIsAddingPhase(false)}
              />
            </div>
          )}

          {/* Форма редактирования фазы */}
          {editingPhaseIndex !== null && (
            <div className="mb-4">
              <PhaseEditor
                phase={formData.phases![editingPhaseIndex]}
                phaseIndex={editingPhaseIndex}
                onSave={handleEditPhase}
                onDelete={() => handleDeletePhase(editingPhaseIndex)}
                onCancel={() => setEditingPhaseIndex(null)}
              />
            </div>
          )}
        </Card>

        {/* Кнопки действий */}
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Сохранение...' : 'Сохранить маршрут'}
          </Button>
        </div>
      </form>
    </div>
  )
}

