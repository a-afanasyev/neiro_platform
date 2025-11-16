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
import { PhaseEditor } from '@/components/routes/PhaseEditor'
import { templatesApi } from '@/lib/api'
import { useToast } from '@/hooks/useToast'

/**
 * Интерфейс для фазы шаблона
 */
interface TemplatePhase {
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
    slug: '',
    description: '',
    targetAudience: '',
    ageMin: 3,
    ageMax: 18,
    durationWeeks: 12,
    tags: '',
  })

  const [phases, setPhases] = useState<TemplatePhase[]>([])
  const [isAddingPhase, setIsAddingPhase] = useState(false)
  const [editingPhaseIndex, setEditingPhaseIndex] = useState<number | null>(null)

  /**
   * Обработчик изменения полей формы
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: ['ageMin', 'ageMax', 'durationWeeks'].includes(name)
        ? parseInt(value) || 0
        : value,
    }))
  }

  /**
   * Автоматическая генерация slug из заголовка
   */
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }))
  }

  /**
   * Генерация slug из текста
   */
  const generateSlug = (text: string): string => {
    const cyrillicMap: Record<string, string> = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
      'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
      'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
      'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    }

    return text
      .toLowerCase()
      .split('')
      .map(char => cyrillicMap[char] || char)
      .join('')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
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
    if (confirm('Удалить эту фазу? Все цели фазы также будут удалены.')) {
      setPhases((prev) =>
        prev
          .filter((_, idx) => idx !== index)
          .map((p, idx) => ({ ...p, orderIndex: idx }))
      )
      setEditingPhaseIndex(null)
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
      // Подготовка данных
      const tagsArray = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0)

      const templateData = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        targetAudience: formData.targetAudience,
        ageMin: formData.ageMin,
        ageMax: formData.ageMax,
        durationWeeks: formData.durationWeeks,
        tags: tagsArray,
        status: 'draft',
      }

      // Создаем шаблон
      const response = await templatesApi.createTemplate(templateData)
      
      if (response.success) {
        const templateId = response.data.id

        // Создаем фазы
        for (const phase of phases) {
          const phaseRes = await templatesApi.createPhase(templateId, {
            title: phase.title,
            description: phase.description,
            orderIndex: phase.orderIndex,
            durationWeeks: phase.durationWeeks,
            objectives: phase.objectives,
          })

          // Создаем цели для каждой фазы
          if (phaseRes.success && phase.goals) {
            const phaseId = phaseRes.data.id
            for (const goal of phase.goals) {
              await templatesApi.createPhaseGoal(templateId, phaseId, {
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

        success('Шаблон создан успешно', 'Все фазы и цели добавлены')
        // Перенаправляем на страницу созданного шаблона
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
                    onChange={handleTitleChange}
                    placeholder="Например: Программа развития речи (3-6 лет)"
                    required
                    maxLength={255}
                  />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL-идентификатор) *</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="programma-razvitiya-rechi-3-6"
                    required
                    maxLength={255}
                    pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                  />
                  <p className="text-sm text-neutral-600">
                    Только строчные латинские буквы, цифры и дефисы
                  </p>
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

                {/* Target Audience */}
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Целевая аудитория</Label>
                  <Textarea
                    id="targetAudience"
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleChange}
                    placeholder="Для кого предназначена программа"
                    rows={2}
                  />
                </div>

                {/* Age Range */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ageMin">Минимальный возраст *</Label>
                    <Input
                      id="ageMin"
                      name="ageMin"
                      type="number"
                      min="1"
                      max="25"
                      value={formData.ageMin}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ageMax">Максимальный возраст *</Label>
                    <Input
                      id="ageMax"
                      name="ageMax"
                      type="number"
                      min="1"
                      max="25"
                      value={formData.ageMax}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="durationWeeks">Длительность (недель) *</Label>
                  <Input
                    id="durationWeeks"
                    name="durationWeeks"
                    type="number"
                    min="1"
                    max="260"
                    value={formData.durationWeeks}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">Теги (через запятую)</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="речь, коммуникация, звукопроизношение"
                  />
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
                              <h4 className="font-semibold mb-1">{phase.title}</h4>
                              <p className="text-sm text-neutral-600 mb-2">
                                {phase.description}
                              </p>
                              <div className="flex gap-4 text-xs text-neutral-500">
                                <span>📅 {phase.durationWeeks} недель</span>
                                <span>🎯 {phase.goals?.length || 0} целей</span>
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
                  <PhaseEditor
                    phaseIndex={phases.length}
                    onSave={handleAddPhase}
                    onDelete={() => setIsAddingPhase(false)}
                    onCancel={() => setIsAddingPhase(false)}
                  />
                )}

                {/* Edit phase form */}
                {editingPhaseIndex !== null && (
                  <PhaseEditor
                    phase={phases[editingPhaseIndex]}
                    phaseIndex={editingPhaseIndex}
                    onSave={handleEditPhase}
                    onDelete={() => handleDeletePhase(editingPhaseIndex)}
                    onCancel={() => setEditingPhaseIndex(null)}
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

