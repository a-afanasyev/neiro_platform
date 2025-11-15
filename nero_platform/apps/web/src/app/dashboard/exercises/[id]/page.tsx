'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { exercisesApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

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
  materials?: {
    items?: string[]
  }
  instructions?: {
    steps?: string[]
  }
  successCriteria?: Record<string, any>
  safetyNotes?: string
  adaptations?: string
  mediaUrls?: {
    images?: string[]
    videos?: string[]
    audio?: string[]
  }
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

const difficultyColors: Record<string, 'default' | 'secondary' | 'outline'> = {
  beginner: 'outline',
  intermediate: 'secondary',
  advanced: 'default',
}

export default function ExerciseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const exerciseId = params.id as string

  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadExercise()
  }, [exerciseId])

  const loadExercise = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await exercisesApi.getExercise(exerciseId)
      if (response.success) {
        setExercise(response.data)
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Не удалось загрузить упражнение')
    } finally {
      setIsLoading(false)
    }
  }

  const canManageExercise = user?.role === 'specialist' || user?.role === 'admin'

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
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-neutral-900">{exercise.title}</h1>
                <Badge variant="outline">
                  {categoryLabels[exercise.category] || exercise.category}
                </Badge>
                <Badge variant={difficultyColors[exercise.difficulty]}>
                  {difficultyLabels[exercise.difficulty] || exercise.difficulty}
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
          {(exercise.mediaUrls?.images?.length || exercise.mediaUrls?.videos?.length) && (
            <Card>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {exercise.mediaUrls.images?.map((imageUrl, index) => (
                    <div key={index} className="aspect-video bg-neutral-100 rounded-lg overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={`${exercise.title} - изображение ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {exercise.mediaUrls.videos?.map((videoUrl, index) => (
                    <div key={index} className="aspect-video bg-neutral-100 rounded-lg overflow-hidden">
                      <video
                        src={videoUrl}
                        controls
                        className="w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Параметры упражнения</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-neutral-600">Возрастная группа</p>
                  <p className="font-medium">{exercise.ageMin}-{exercise.ageMax} лет</p>
                </div>
                {exercise.durationMinutes && (
                  <div>
                    <p className="text-sm text-neutral-600">Длительность</p>
                    <p className="font-medium">{exercise.durationMinutes} минут</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-neutral-600">Категория</p>
                  <p className="font-medium">
                    {categoryLabels[exercise.category] || exercise.category}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Уровень сложности</p>
                  <p className="font-medium">
                    {difficultyLabels[exercise.difficulty] || exercise.difficulty}
                  </p>
                </div>
              </CardContent>
            </Card>

            {exercise.materials?.items && exercise.materials.items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Необходимые материалы</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {exercise.materials.items.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="instructions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="instructions">Инструкции</TabsTrigger>
              <TabsTrigger value="criteria">Критерии успеха</TabsTrigger>
              {(exercise.safetyNotes || exercise.adaptations) && (
                <TabsTrigger value="additional">Дополнительно</TabsTrigger>
              )}
            </TabsList>

            {/* Instructions Tab */}
            <TabsContent value="instructions">
              <Card>
                <CardHeader>
                  <CardTitle>Порядок выполнения</CardTitle>
                  <CardDescription>
                    Следуйте этим шагам для проведения упражнения
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {exercise.instructions?.steps && exercise.instructions.steps.length > 0 ? (
                    <ol className="space-y-3">
                      {exercise.instructions.steps.map((step, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {index + 1}
                          </div>
                          <p className="pt-1">{step}</p>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-neutral-600">Инструкции не указаны</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Success Criteria Tab */}
            <TabsContent value="criteria">
              <Card>
                <CardHeader>
                  <CardTitle>Критерии успеха</CardTitle>
                  <CardDescription>
                    Показатели успешного выполнения упражнения
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {exercise.successCriteria && Object.keys(exercise.successCriteria).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(exercise.successCriteria).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between py-2 border-b last:border-0">
                          <span className="font-medium capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="text-neutral-600">
                            {typeof value === 'boolean'
                              ? value
                                ? 'Да'
                                : 'Нет'
                              : typeof value === 'number'
                                ? `${value}%`
                                : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-neutral-600">Критерии не указаны</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Additional Info Tab */}
            {(exercise.safetyNotes || exercise.adaptations) && (
              <TabsContent value="additional">
                <div className="space-y-4">
                  {exercise.safetyNotes && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Примечания по безопасности</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-neutral-700">{exercise.safetyNotes}</p>
                      </CardContent>
                    </Card>
                  )}
                  {exercise.adaptations && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Возможные адаптации</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-neutral-700">{exercise.adaptations}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            )}
          </Tabs>

          {/* Actions */}
          {canManageExercise && (
            <Card>
              <CardContent className="pt-6 flex gap-2">
                <Button variant="outline">Редактировать</Button>
                <Button variant="outline">Дублировать</Button>
                {exercise.status === 'draft' && <Button>Опубликовать</Button>}
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

