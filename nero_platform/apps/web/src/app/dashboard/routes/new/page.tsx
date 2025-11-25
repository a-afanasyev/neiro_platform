'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
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
import { routesApi, childrenApi, usersApi, templatesApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

interface Child {
  id: string
  firstName: string
  lastName: string
}

interface Specialist {
  id: string
  firstName: string
  lastName: string
  role: string
}

interface Template {
  id: string
  title: string
  description?: string
  durationWeeks?: number
}

export default function NewRoutePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [children, setChildren] = useState<Child[]>([])
  const [specialists, setSpecialists] = useState<Specialist[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  const [formData, setFormData] = useState({
    childId: '',
    leadSpecialistId: '',
    templateId: '',
    title: '',
    summary: '',
    planHorizonWeeks: '',
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setIsLoadingData(true)
    try {
      const [childrenRes, usersRes, templatesRes] = await Promise.all([
        childrenApi.getChildren(),
        usersApi.getUsers(),
        templatesApi.getTemplates({ status: 'published' }),
      ])

      if (childrenRes.success) {
        // Backend возвращает массив детей напрямую в поле data
        const raw = childrenRes.data as any
        const list = Array.isArray(raw) ? raw : raw?.items ?? []
        setChildren(list)
      }

      if (usersRes.success) {
        // Users Service также возвращает массив пользователей в поле data
        const users = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data?.items ?? []
        const specialistUsers = users.filter(
          (u: any) => u.role === 'specialist'
        )
        setSpecialists(specialistUsers)

        // Автоматически выбрать текущего пользователя, если он специалист
        if (user?.role === 'specialist') {
          setFormData((prev) => ({ ...prev, leadSpecialistId: user.id }))
        }
      }

      if (templatesRes.success) {
        // Templates Service: список шаблонов лежит в поле data как массив
        const templates = Array.isArray(templatesRes.data)
          ? templatesRes.data
          : templatesRes.data?.items ?? []
        setTemplates(templates)
      }
    } catch (err: any) {
      setError('Не удалось загрузить данные для формы')
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const data = {
        childId: formData.childId,
        leadSpecialistId: formData.leadSpecialistId,
        ...(formData.templateId && { templateId: formData.templateId }),
        title: formData.title,
        ...(formData.summary && { summary: formData.summary }),
        ...(formData.planHorizonWeeks && { planHorizonWeeks: parseInt(formData.planHorizonWeeks) }),
      }

      const response = await routesApi.createRoute(data)
      
      if (response.success) {
        router.push(`/dashboard/routes/${response.data.id}`)
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Не удалось создать маршрут')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedTemplate = templates.find((t) => t.id === formData.templateId)

  if (isLoadingData) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-neutral-600">Загрузка...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'specialist']}>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Новый маршрут</h1>
            <p className="text-neutral-600 mt-1">
              Индивидуальный коррекционный маршрут для ребенка
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
                <CardDescription>
                  Заполните основные данные о маршруте
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Child Selection */}
                <div className="space-y-2">
                  <Label htmlFor="childId">Ребенок *</Label>
                  <Select
                    value={formData.childId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, childId: value })
                    }
                    required
                    name="childId"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите ребенка" />
                    </SelectTrigger>
                    <SelectContent>
                      {children.map((child) => (
                        <SelectItem key={child.id} value={child.id}>
                          {child.firstName} {child.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Lead Specialist Selection */}
                <div className="space-y-2">
                  <Label htmlFor="leadSpecialistId">Ведущий специалист *</Label>
                  <Select
                    value={formData.leadSpecialistId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, leadSpecialistId: value })
                    }
                    required
                    name="responsibleSpecialistId"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите специалиста" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialists.map((specialist) => (
                        <SelectItem key={specialist.id} value={specialist.id}>
                          {specialist.firstName} {specialist.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Template Selection (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="templateId">Шаблон (опционально)</Label>
                  <Select
                    value={formData.templateId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, templateId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите шаблон или создайте с нуля" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTemplate && (
                    <p className="text-sm text-neutral-600">
                      {selectedTemplate.description}
                      {selectedTemplate.durationWeeks && (
                        <> • Длительность: {selectedTemplate.durationWeeks} недель</>
                      )}
                    </p>
                  )}
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Название *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Например: Индивидуальный маршрут Алисы"
                    required
                    maxLength={255}
                  />
                </div>

                {/* Summary */}
                <div className="space-y-2">
                  <Label htmlFor="summary">Описание</Label>
                  <Textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="Краткое описание маршрута и целей"
                    rows={4}
                    maxLength={2000}
                  />
                </div>

                {/* Plan Horizon */}
                <div className="space-y-2">
                  <Label htmlFor="planHorizonWeeks">Плановая длительность (недель)</Label>
                  <Input
                    id="planHorizonWeeks"
                    type="number"
                    min="1"
                    max="260"
                    value={formData.planHorizonWeeks}
                    onChange={(e) =>
                      setFormData({ ...formData, planHorizonWeeks: e.target.value })
                    }
                    placeholder="Например: 24"
                  />
                  <p className="text-sm text-neutral-600">
                    Ожидаемая продолжительность работы по маршруту
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Отмена
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Создание...' : 'Создать маршрут'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

