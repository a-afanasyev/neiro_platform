'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { exercisesApi } from '@/lib/api'

interface Exercise {
  id: string
  title: string
  slug: string
  description?: string
  category: string
  difficulty: string
  ageMin: number
  ageMax: number
  durationMinutes?: number
  status: string
  instructions?: { steps?: string[] }
  materials?: { items?: string[] }
  successCriteria?: { accuracy?: number }
}

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

export default function EditExercisePage() {
  const router = useRouter()
  const params = useParams()
  const exerciseId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: '',
    ageMin: 0,
    ageMax: 0,
    durationMinutes: 0,
  })

  useEffect(() => {
    loadExercise()
  }, [exerciseId])

  const loadExercise = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await exercisesApi.getExercise(exerciseId)

      if (response.success && response.data) {
        const ex = response.data
        setFormData({
          title: ex.title || '',
          description: ex.description || '',
          category: ex.category || '',
          difficulty: ex.difficulty || '',
          ageMin: ex.ageMin || 0,
          ageMax: ex.ageMax || 0,
          durationMinutes: ex.durationMinutes || 0,
        })
      } else {
        setError('Упражнение не найдено')
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось загрузить упражнение')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const response = await exercisesApi.updateExercise(exerciseId, formData)

      if (response.success) {
        router.push(`/dashboard/exercises/${exerciseId}`)
      } else {
        setError('Не удалось сохранить изменения')
      }
    } catch (err: any) {
      const message = err.response?.data?.detail || err.message || 'Ошибка при сохранении'
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    router.push(`/dashboard/exercises/${exerciseId}`)
  }

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'specialist']}>
        <DashboardLayout>
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-neutral-600">Загрузка упражнения...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'specialist']}>
      <DashboardLayout>
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Редактирование упражнения</h1>
              <p className="text-neutral-600 mt-1">Измените параметры упражнения</p>
            </div>
            <Button variant="outline" onClick={handleCancel}>
              Отмена
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Edit Form */}
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Название *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Название упражнения"
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
                    placeholder="Краткое описание упражнения"
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Категория *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
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
                      onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите уровень" />
                      </SelectTrigger>
                      <SelectContent>
                        {difficultyOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {/* Age Min */}
                  <div className="space-y-2">
                    <Label htmlFor="ageMin">Мин. возраст (лет) *</Label>
                    <Input
                      id="ageMin"
                      type="number"
                      min={0}
                      max={18}
                      value={formData.ageMin}
                      onChange={(e) => setFormData({ ...formData, ageMin: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>

                  {/* Age Max */}
                  <div className="space-y-2">
                    <Label htmlFor="ageMax">Макс. возраст (лет) *</Label>
                    <Input
                      id="ageMax"
                      type="number"
                      min={0}
                      max={18}
                      value={formData.ageMax}
                      onChange={(e) => setFormData({ ...formData, ageMax: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <Label htmlFor="duration">Длительность (мин) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      min={1}
                      max={120}
                      value={formData.durationMinutes}
                      onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
                  Отмена
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
