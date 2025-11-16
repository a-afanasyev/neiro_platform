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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { exercisesApi } from '@/lib/api'
import { useToast } from '@/hooks/useToast'

const categoryOptions = [
  { value: 'cognitive', label: 'Когнитивное' },
  { value: 'speech', label: 'Речь' },
  { value: 'motor', label: 'Моторика' },
  { value: 'social', label: 'Социальное' },
  { value: 'sensory', label: 'Сенсорика' },
  { value: 'behavior', label: 'Поведение' },
]

const difficultyOptions = [
  { value: 'beginner', label: 'Начальный' },
  { value: 'intermediate', label: 'Средний' },
  { value: 'advanced', label: 'Продвинутый' },
]

/**
 * Страница создания нового упражнения
 * 
 * Позволяет специалисту создать новое упражнение, указав:
 * - Основную информацию (название, описание, slug)
 * - Параметры (категория, сложность, возраст, длительность)
 * - Инструкции по выполнению
 * - Развиваемые навыки
 * - Необходимые материалы
 * - Загрузить медиа-файлы (изображения, видео, аудио)
 */
export default function NewExercisePage() {
  const router = useRouter()
  const { success, error: showError } = useToast()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    instructions: '',
    category: 'cognitive',
    difficulty: 'beginner',
    ageMin: 3,
    ageMax: 18,
    durationMinutes: 30,
    targetedSkills: '',
    materials: '',
  })

  /**
   * Обработчик изменения полей формы
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: ['ageMin', 'ageMax', 'durationMinutes'].includes(name)
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
   * Обработчик отправки формы
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Подготовка данных
      const targetedSkillsArray = formData.targetedSkills
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0)

      const materialsArray = formData.materials
        .split('\n')
        .map(m => m.trim())
        .filter(m => m.length > 0)

      const data = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        instructions: formData.instructions,
        category: formData.category,
        difficulty: formData.difficulty,
        ageMin: formData.ageMin,
        ageMax: formData.ageMax,
        durationMinutes: formData.durationMinutes,
        targetedSkills: targetedSkillsArray,
        materials: materialsArray,
        status: 'draft',
      }

      const response = await exercisesApi.createExercise(data)
      
      if (response.success) {
        success('Упражнение создано', 'Теперь вы можете добавить медиа-файлы')
        // Перенаправляем на страницу созданного упражнения
        router.push(`/dashboard/exercises/${response.data.id}`)
      }
    } catch (err: any) {
      console.error('Ошибка создания упражнения:', err)
      const errorMsg = err.response?.data?.error?.message || 'Не удалось создать упражнение'
      setError(errorMsg)
      showError(errorMsg, 'Проверьте корректность данных')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'specialist']}>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Создать упражнение</h1>
            <p className="text-neutral-600 mt-1">
              Добавьте новое коррекционное упражнение в библиотеку
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
                <CardDescription>
                  Базовые сведения об упражнении
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
                  <Label htmlFor="title">Название упражнения *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleTitleChange}
                    placeholder="Например: Сортировка по цветам"
                    required
                    maxLength={255}
                  />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <Label htmlFor="slug">
                    Slug (URL-идентификатор) *
                  </Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="sortirovka-po-tsvetam"
                    required
                    maxLength={255}
                    pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                  />
                  <p className="text-sm text-neutral-600">
                    Только строчные латинские буквы, цифры и дефисы. Автоматически генерируется из названия.
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Краткое описание</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Краткое описание упражнения для списка"
                    rows={3}
                    maxLength={500}
                  />
                </div>

                {/* Instructions */}
                <div className="space-y-2">
                  <Label htmlFor="instructions">Инструкции по выполнению *</Label>
                  <Textarea
                    id="instructions"
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleChange}
                    placeholder="Подробные инструкции для специалиста по выполнению упражнения"
                    rows={8}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Parameters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Параметры упражнения</CardTitle>
                <CardDescription>
                  Категоризация и характеристики
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Категория *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty */}
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Сложность *</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) =>
                      setFormData({ ...formData, difficulty: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Label htmlFor="durationMinutes">Длительность (минут)</Label>
                  <Input
                    id="durationMinutes"
                    name="durationMinutes"
                    type="number"
                    min="5"
                    max="180"
                    value={formData.durationMinutes}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Дополнительная информация</CardTitle>
                <CardDescription>
                  Навыки и материалы
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Targeted Skills */}
                <div className="space-y-2">
                  <Label htmlFor="targetedSkills">
                    Развиваемые навыки (по одному на строку)
                  </Label>
                  <Textarea
                    id="targetedSkills"
                    name="targetedSkills"
                    value={formData.targetedSkills}
                    onChange={handleChange}
                    placeholder="Цветовосприятие&#10;Мелкая моторика&#10;Внимание"
                    rows={5}
                  />
                </div>

                {/* Materials */}
                <div className="space-y-2">
                  <Label htmlFor="materials">
                    Необходимые материалы (по одному на строку)
                  </Label>
                  <Textarea
                    id="materials"
                    name="materials"
                    value={formData.materials}
                    onChange={handleChange}
                    placeholder="Цветные кубики&#10;Контейнеры разных цветов&#10;Карточки с заданиями"
                    rows={5}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Media Upload Info */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Медиа-материалы</CardTitle>
                <CardDescription>
                  После создания упражнения вы сможете загрузить изображения, видео и аудио
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertDescription>
                    💡 Сначала создайте упражнение, затем перейдите на его страницу для загрузки медиа-файлов
                  </AlertDescription>
                </Alert>
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
                {isSubmitting ? 'Создание...' : 'Создать упражнение'}
              </Button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

