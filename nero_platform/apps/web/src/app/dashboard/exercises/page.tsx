'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  mediaUrls?: {
    images?: string[]
    videos?: string[]
  }
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

export default function ExercisesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')

  useEffect(() => {
    loadExercises()
  }, [selectedCategory, selectedDifficulty])

  const loadExercises = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params: any = { status: 'published' }
      
      if (selectedCategory !== 'all') {
        params.category = selectedCategory
      }
      
      if (selectedDifficulty !== 'all') {
        params.difficulty = selectedDifficulty
      }

      const response = await exercisesApi.getExercises(params)
      
      if (response.success) {
        setExercises(response.data.items)
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Не удалось загрузить упражнения')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredExercises = exercises.filter((exercise) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      exercise.title.toLowerCase().includes(query) ||
      exercise.description?.toLowerCase().includes(query)
    )
  })

  const canManageExercises = user?.role === 'specialist' || user?.role === 'admin'

  return (
    <ProtectedRoute allowedRoles={['admin', 'specialist', 'supervisor']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Библиотека упражнений</h1>
              <p className="text-neutral-600 mt-1">
                Коллекция коррекционных упражнений и активностей
              </p>
            </div>

            {canManageExercises && (
              <Button onClick={() => router.push('/dashboard/exercises/new')}>
                + Добавить упражнение
              </Button>
            )}
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="space-y-2">
                  <Input
                    placeholder="Поиск упражнений..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Все категории" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все категории</SelectItem>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty Filter */}
                <div className="space-y-2">
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Все уровни" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все уровни</SelectItem>
                      {Object.entries(difficultyLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-neutral-600">Загрузка...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Exercises Grid */}
          {!isLoading && !error && (
            <>
              {filteredExercises.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-semibold mb-2">
                      {searchQuery || selectedCategory !== 'all' || selectedDifficulty !== 'all'
                        ? 'Ничего не найдено'
                        : 'Нет упражнений'}
                    </h3>
                    <p className="text-neutral-600 mb-4">
                      {searchQuery || selectedCategory !== 'all' || selectedDifficulty !== 'all'
                        ? 'Попробуйте изменить параметры поиска'
                        : 'В библиотеке пока нет упражнений'}
                    </p>
                    {canManageExercises && !searchQuery && selectedCategory === 'all' && selectedDifficulty === 'all' && (
                      <Button onClick={() => router.push('/dashboard/exercises/new')}>
                        Добавить первое упражнение
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="text-sm text-neutral-600">
                    Найдено упражнений: {filteredExercises.length}
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredExercises.map((exercise) => (
                      <Card
                        key={exercise.id}
                        className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => router.push(`/dashboard/exercises/${exercise.id}`)}
                      >
                        {exercise.mediaUrls?.images?.[0] && (
                          <div className="h-40 bg-neutral-100 overflow-hidden">
                            <img
                              src={exercise.mediaUrls.images[0]}
                              alt={exercise.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-lg">{exercise.title}</CardTitle>
                          </div>
                          {exercise.description && (
                            <CardDescription className="line-clamp-2">
                              {exercise.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="outline">
                              {categoryLabels[exercise.category] || exercise.category}
                            </Badge>
                            <Badge variant={difficultyColors[exercise.difficulty]}>
                              {difficultyLabels[exercise.difficulty] || exercise.difficulty}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-neutral-600">
                            <p>
                              <span className="font-medium">Возраст:</span> {exercise.ageMin}-
                              {exercise.ageMax} лет
                            </p>
                            {exercise.durationMinutes && (
                              <p>
                                <span className="font-medium">Длительность:</span>{' '}
                                {exercise.durationMinutes} мин
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

