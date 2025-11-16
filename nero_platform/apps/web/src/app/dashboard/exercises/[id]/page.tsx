'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { exercisesApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

/**
 * Интерфейс для данных упражнения
 */
interface Exercise {
  id: string
  title: string
  slug: string
  description?: string
  instructions?: string
  targetedSkills?: string[]
  category: string
  difficulty: string
  ageMin: number
  ageMax: number
  durationMinutes?: number
  status: string
  mediaUrls?: {
    images?: string[]
    videos?: string[]
    audio?: string[]
  }
  materials?: string[]
  adaptations?: Record<string, any>
  createdAt: string
  updatedAt: string
}

const categoryLabels: Record<string, string> = {
  cognitive: 'Когнитивное',
  speech: 'Речь',
  motor: 'Моторика',
  social: 'Социальное',
  sensory: 'Сенсорика',
  behavior: 'Поведение',
}

const difficultyLabels: Record<string, string> = {
  beginner: 'Начальный',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
}

const statusLabels: Record<string, string> = {
  draft: 'Черновик',
  published: 'Опубликовано',
  archived: 'Архивировано',
}

const statusColors: Record<string, 'default' | 'secondary' | 'outline'> = {
  draft: 'outline',
  published: 'default',
  archived: 'secondary',
}

/**
 * Страница детального просмотра упражнения
 * 
 * Отображает полную информацию об упражнении, включая:
 * - Базовую информацию (название, описание, категория, сложность)
 * - Инструкции по выполнению
 * - Медиа-материалы (изображения, видео, аудио)
 * - Необходимые материалы
 * - Адаптации
 * - Действия (публикация, снятие с публикации, редактирование, удаление)
 */
export default function ExerciseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  
  const exerciseId = params.id as string

  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)

  useEffect(() => {
    loadExercise()
  }, [exerciseId])

  /**
   * Загрузка данных упражнения
   */
  const loadExercise = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await exercisesApi.getExercise(exerciseId)
      
      if (response.success) {
        setExercise(response.data)
      }
    } catch (err: any) {
      console.error('Ошибка загрузки упражнения:', err)
      setError(err.response?.data?.error?.message || 'Не удалось загрузить упражнение')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Публикация упражнения
   */
  const handlePublish = async () => {
    if (!exercise) return

    setIsActionLoading(true)
    try {
      await exercisesApi.publishExercise(exerciseId)
      await loadExercise()
      success('Упражнение опубликовано', 'Теперь оно доступно для использования')
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || 'Не удалось опубликовать упражнение'
      setError(errorMsg)
      showError(errorMsg)
    } finally {
      setIsActionLoading(false)
    }
  }

  /**
   * Снятие упражнения с публикации
   */
  const handleUnpublish = async () => {
    if (!exercise) return

    setIsActionLoading(true)
    try {
      await exercisesApi.unpublishExercise(exerciseId)
      await loadExercise()
      success('Упражнение снято с публикации')
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || 'Не удалось снять упражнение с публикации'
      setError(errorMsg)
      showError(errorMsg)
    } finally {
      setIsActionLoading(false)
    }
  }

  /**
   * Удаление упражнения
   */
  const handleDelete = async () => {
    if (!exercise) return

    if (!confirm(`Удалить упражнение "${exercise.title}"? Это действие нельзя отменить.`)) {
      return
    }

    setIsActionLoading(true)
    try {
      await exercisesApi.deleteExercise(exerciseId)
      success('Упражнение удалено')
      router.push('/dashboard/exercises')
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || 'Не удалось удалить упражнение'
      setError(errorMsg)
      showError(errorMsg)
      setIsActionLoading(false)
    }
  }

  const canManage = user?.role === 'admin' || user?.role === 'specialist'

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'specialist', 'supervisor']}>
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

  if (error || !exercise) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'specialist', 'supervisor']}>
        <DashboardLayout>
          <Alert variant="destructive">
            <AlertDescription>{error || 'Упражнение не найдено'}</AlertDescription>
          </Alert>
          <Button onClick={() => router.back()} className="mt-4">
            Назад
          </Button>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'specialist', 'supervisor']}>
      <DashboardLayout>
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-neutral-900">{exercise.title}</h1>
                <Badge variant={statusColors[exercise.status]}>
                  {statusLabels[exercise.status]}
                </Badge>
              </div>
              {exercise.description && (
                <p className="text-neutral-600">{exercise.description}</p>
              )}
            </div>
            <Button variant="outline" onClick={() => router.back()}>
              Назад к списку
            </Button>
          </div>

          {/* Media Gallery */}
          {exercise.mediaUrls && (exercise.mediaUrls.images || exercise.mediaUrls.videos) && (
            <Card>
              <CardHeader>
                <CardTitle>Медиа-материалы</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Images */}
                {exercise.mediaUrls.images && exercise.mediaUrls.images.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Изображения</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {exercise.mediaUrls.images.map((url, index) => (
                        <div key={index} className="relative aspect-video bg-neutral-100 rounded-lg overflow-hidden">
                          <img
                            src={url}
                            alt={`${exercise.title} - изображение ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Videos */}
                {exercise.mediaUrls.videos && exercise.mediaUrls.videos.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Видео</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {exercise.mediaUrls.videos.map((url, index) => (
                        <div key={index} className="relative aspect-video bg-neutral-100 rounded-lg overflow-hidden">
                          <video
                            src={url}
                            controls
                            className="w-full h-full"
                          >
                            Ваш браузер не поддерживает видео
                          </video>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Audio */}
                {exercise.mediaUrls.audio && exercise.mediaUrls.audio.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Аудио</h4>
                    <div className="space-y-2">
                      {exercise.mediaUrls.audio.map((url, index) => (
                        <div key={index}>
                          <audio src={url} controls className="w-full">
                            Ваш браузер не поддерживает аудио
                          </audio>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Информация об упражнении</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600">Категория</p>
                  <p className="font-medium">
                    {categoryLabels[exercise.category] || exercise.category}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Сложность</p>
                  <p className="font-medium">
                    {difficultyLabels[exercise.difficulty] || exercise.difficulty}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Возраст</p>
                  <p className="font-medium">
                    {exercise.ageMin}-{exercise.ageMax} лет
                  </p>
                </div>
                {exercise.durationMinutes && (
                  <div>
                    <p className="text-sm text-neutral-600">Длительность</p>
                    <p className="font-medium">{exercise.durationMinutes} минут</p>
                  </div>
                )}
              </div>

              {/* Targeted Skills */}
              {exercise.targetedSkills && exercise.targetedSkills.length > 0 && (
                <div>
                  <p className="text-sm text-neutral-600 mb-2">Развиваемые навыки</p>
                  <div className="flex flex-wrap gap-2">
                    {exercise.targetedSkills.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          {exercise.instructions && (
            <Card>
              <CardHeader>
                <CardTitle>Инструкции по выполнению</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{exercise.instructions}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Materials */}
          {exercise.materials && exercise.materials.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Необходимые материалы</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {exercise.materials.map((material, index) => (
                    <li key={index}>{material}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {canManage && (
            <Card>
              <CardHeader>
                <CardTitle>Управление упражнением</CardTitle>
                <CardDescription>Доступные действия</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                {exercise.status === 'draft' && (
                  <Button onClick={handlePublish} disabled={isActionLoading}>
                    {isActionLoading ? 'Публикация...' : 'Опубликовать'}
                  </Button>
                )}
                {exercise.status === 'published' && (
                  <Button 
                    variant="secondary" 
                    onClick={handleUnpublish} 
                    disabled={isActionLoading}
                  >
                    {isActionLoading ? 'Снятие...' : 'Снять с публикации'}
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={() => router.push(`/dashboard/exercises/${exerciseId}/edit`)}
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
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
