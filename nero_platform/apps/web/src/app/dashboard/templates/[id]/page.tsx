'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { templatesApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

/**
 * Интерфейс для шаблона маршрута
 */
interface Template {
  id: string
  title: string
  slug: string
  description?: string
  targetAudience?: string
  ageMin: number
  ageMax: number
  durationWeeks?: number
  status: string
  tags?: string[]
  version?: number
  createdAt: string
  updatedAt: string
}

/**
 * Интерфейс для фазы шаблона
 */
interface TemplatePhase {
  id: string
  title: string
  description?: string
  orderIndex: number
  durationWeeks: number
  objectives?: Record<string, any>
}

/**
 * Интерфейс для цели фазы шаблона
 */
interface TemplateGoal {
  id: string
  title: string
  description?: string
  domain: string
  priority: string
  targetDate?: string
}

const statusLabels: Record<string, string> = {
  draft: 'Черновик',
  published: 'Опубликован',
  archived: 'Архивный',
}

const statusColors: Record<string, 'default' | 'secondary' | 'outline'> = {
  draft: 'outline',
  published: 'default',
  archived: 'secondary',
}

const domainLabels: Record<string, string> = {
  cognitive: 'Когнитивное',
  speech: 'Речь',
  motor: 'Моторика',
  social: 'Социальное',
  sensory: 'Сенсорика',
  behavior: 'Поведение',
}

const priorityLabels: Record<string, string> = {
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
}

/**
 * Страница детального просмотра шаблона маршрута
 * 
 * Отображает информацию о шаблоне, его фазах и целях.
 * Предоставляет функции:
 * - Публикация/архивация шаблона
 * - Клонирование шаблона (создание новой версии)
 * - Редактирование шаблона
 * - Просмотр всех версий шаблона
 */
export default function TemplateDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  
  const templateId = params.id as string

  const [template, setTemplate] = useState<Template | null>(null)
  const [phases, setPhases] = useState<TemplatePhase[]>([])
  const [goals, setGoals] = useState<TemplateGoal[]>([])
  const [versions, setVersions] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)

  // Dialog states
  const [showCloneDialog, setShowCloneDialog] = useState(false)
  const [cloneTitle, setCloneTitle] = useState('')

  useEffect(() => {
    loadTemplateData()
  }, [templateId])

  /**
   * Загрузка данных шаблона
   */
  const loadTemplateData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [templateRes, versionsRes] = await Promise.all([
        templatesApi.getTemplate(templateId),
        templatesApi.getVersions(templateId).catch(() => ({ success: true, data: { items: [] } })),
      ])

      if (templateRes.success) {
        setTemplate(templateRes.data)
        
        // Загружаем фазы и цели, если они есть в данных
        if (templateRes.data.phases) {
          setPhases(templateRes.data.phases)
        }
        if (templateRes.data.goals) {
          setGoals(templateRes.data.goals)
        }
      }

      if (versionsRes.success) {
        setVersions(versionsRes.data.items || [])
      }
    } catch (err: any) {
      console.error('Ошибка загрузки шаблона:', err)
      setError(err.response?.data?.error?.message || 'Не удалось загрузить шаблон')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Публикация шаблона
   */
  const handlePublish = async () => {
    if (!template) return

    setIsActionLoading(true)
    try {
      await templatesApi.publishTemplate(templateId)
      await loadTemplateData()
      success('Шаблон опубликован', 'Теперь он доступен для создания маршрутов')
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || 'Не удалось опубликовать шаблон'
      setError(errorMsg)
      showError(errorMsg)
    } finally {
      setIsActionLoading(false)
    }
  }

  /**
   * Архивация шаблона
   */
  const handleArchive = async () => {
    if (!template) return

    if (!confirm(`Архивировать шаблон "${template.title}"?`)) {
      return
    }

    setIsActionLoading(true)
    try {
      await templatesApi.archiveTemplate(templateId)
      await loadTemplateData()
      success('Шаблон архивирован')
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || 'Не удалось архивировать шаблон'
      setError(errorMsg)
      showError(errorMsg)
    } finally {
      setIsActionLoading(false)
    }
  }

  /**
   * Клонирование шаблона
   */
  const handleClone = async () => {
    if (!template || !cloneTitle.trim()) return

    setIsActionLoading(true)
    try {
      const response = await templatesApi.cloneTemplate(templateId, cloneTitle)
      
      if (response.success) {
        success('Шаблон клонирован', 'Создана новая версия шаблона')
        // Перенаправляем на новый клонированный шаблон
        router.push(`/dashboard/templates/${response.data.id}`)
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || 'Не удалось клонировать шаблон'
      setError(errorMsg)
      showError(errorMsg)
    } finally {
      setIsActionLoading(false)
      setShowCloneDialog(false)
    }
  }

  /**
   * Удаление шаблона
   */
  const handleDelete = async () => {
    if (!template) return

    if (!confirm(`Удалить шаблон "${template.title}"? Это действие нельзя отменить.`)) {
      return
    }

    setIsActionLoading(true)
    try {
      await templatesApi.deleteTemplate(templateId)
      success('Шаблон удален')
      router.push('/dashboard/templates')
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || 'Не удалось удалить шаблон'
      setError(errorMsg)
      showError(errorMsg)
      setIsActionLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  const canManage = user?.role === 'admin' || user?.role === 'specialist'

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'specialist']}>
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

  if (error || !template) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'specialist']}>
        <DashboardLayout>
          <Alert variant="destructive">
            <AlertDescription>{error || 'Шаблон не найден'}</AlertDescription>
          </Alert>
          <Button onClick={() => router.back()} className="mt-4">
            Назад
          </Button>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'specialist']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-neutral-900">{template.title}</h1>
                <Badge variant={statusColors[template.status]}>
                  {statusLabels[template.status]}
                </Badge>
                {template.version && (
                  <Badge variant="outline">v{template.version}</Badge>
                )}
              </div>
              {template.description && (
                <p className="text-neutral-600">{template.description}</p>
              )}
            </div>
            <Button variant="outline" onClick={() => router.back()}>
              Назад к списку
            </Button>
          </div>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Информация о шаблоне</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              {template.targetAudience && (
                <div>
                  <p className="text-sm text-neutral-600">Целевая аудитория</p>
                  <p className="font-medium">{template.targetAudience}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-neutral-600">Возраст</p>
                <p className="font-medium">
                  {template.ageMin}-{template.ageMax} лет
                </p>
              </div>
              {template.durationWeeks && (
                <div>
                  <p className="text-sm text-neutral-600">Длительность</p>
                  <p className="font-medium">{template.durationWeeks} недель</p>
                </div>
              )}
              <div>
                <p className="text-sm text-neutral-600">Обновлен</p>
                <p className="font-medium">{formatDate(template.updatedAt)}</p>
              </div>
              {template.tags && template.tags.length > 0 && (
                <div className="md:col-span-2">
                  <p className="text-sm text-neutral-600 mb-2">Теги</p>
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {canManage && (
            <Card>
              <CardHeader>
                <CardTitle>Управление шаблоном</CardTitle>
                <CardDescription>Доступные действия</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {template.status === 'draft' && (
                  <Button onClick={handlePublish} disabled={isActionLoading}>
                    {isActionLoading ? 'Публикация...' : 'Опубликовать'}
                  </Button>
                )}
                {template.status === 'published' && (
                  <Button 
                    variant="secondary" 
                    onClick={handleArchive} 
                    disabled={isActionLoading}
                  >
                    {isActionLoading ? 'Архивация...' : 'Архивировать'}
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={() => setShowCloneDialog(true)}
                  disabled={isActionLoading}
                >
                  Клонировать
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push(`/dashboard/templates/${templateId}/edit`)}
                >
                  Редактировать
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete} 
                  disabled={isActionLoading}
                >
                  Удалить
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Tabs: Phases, Goals, Versions */}
          <Tabs defaultValue="phases" className="space-y-4">
            <TabsList>
              <TabsTrigger value="phases">Фазы ({phases.length})</TabsTrigger>
              <TabsTrigger value="goals">Цели ({goals.length})</TabsTrigger>
              <TabsTrigger value="versions">Версии ({versions.length})</TabsTrigger>
            </TabsList>

            {/* Phases Tab */}
            <TabsContent value="phases" className="space-y-4">
              {phases.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-neutral-600 mb-4">Нет фаз</p>
                    {canManage && (
                      <Button 
                        variant="outline"
                        onClick={() => router.push(`/dashboard/templates/${templateId}/edit`)}
                      >
                        Добавить фазы
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {phases.map((phase, index) => (
                    <Card key={phase.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{phase.title}</h4>
                            {phase.description && (
                              <p className="text-sm text-neutral-600 mb-2">
                                {phase.description}
                              </p>
                            )}
                            <p className="text-xs text-neutral-500">
                              Длительность: {phase.durationWeeks} недель
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Goals Tab */}
            <TabsContent value="goals" className="space-y-4">
              {goals.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-neutral-600 mb-4">Нет целей</p>
                    {canManage && (
                      <Button 
                        variant="outline"
                        onClick={() => router.push(`/dashboard/templates/${templateId}/edit`)}
                      >
                        Добавить цели
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {goals.map((goal) => (
                    <Card key={goal.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{goal.title}</h4>
                              <Badge variant="outline">
                                {domainLabels[goal.domain] || goal.domain}
                              </Badge>
                              {goal.priority === 'high' && (
                                <Badge>{priorityLabels[goal.priority]}</Badge>
                              )}
                            </div>
                            {goal.description && (
                              <p className="text-sm text-neutral-600">
                                {goal.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Versions Tab */}
            <TabsContent value="versions" className="space-y-4">
              {versions.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-neutral-600">Нет других версий</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {versions.map((version) => (
                    <Card 
                      key={version.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(`/dashboard/templates/${version.id}`)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{version.title}</h4>
                              {version.version && (
                                <Badge variant="outline">v{version.version}</Badge>
                              )}
                              <Badge variant={statusColors[version.status]}>
                                {statusLabels[version.status]}
                              </Badge>
                            </div>
                            <p className="text-sm text-neutral-600">
                              Создан: {formatDate(version.createdAt)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Clone Dialog */}
        <Dialog open={showCloneDialog} onOpenChange={setShowCloneDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Клонировать шаблон</DialogTitle>
              <DialogDescription>
                Создайте копию шаблона с новым названием
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cloneTitle">Название нового шаблона</Label>
                <Input
                  id="cloneTitle"
                  value={cloneTitle}
                  onChange={(e) => setCloneTitle(e.target.value)}
                  placeholder={`${template.title} (копия)`}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCloneDialog(false)}>
                Отмена
              </Button>
              <Button 
                onClick={handleClone} 
                disabled={!cloneTitle.trim() || isActionLoading}
              >
                {isActionLoading ? 'Клонирование...' : 'Клонировать'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

