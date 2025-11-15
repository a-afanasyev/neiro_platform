import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface Exercise {
  id: string
  title: string
  slug: string
  description?: string
  category?: string
  difficulty?: string
  durationMinutes?: number
  ageMin?: number
  ageMax?: number
}

interface ExerciseCardProps {
  exercise: Exercise
}

/**
 * Карточка упражнения для отображения в списке
 */
export function ExerciseCard({ exercise }: ExerciseCardProps) {
  const categoryLabels: Record<string, { label: string; icon: string }> = {
    cognitive: { label: 'Когнитивное', icon: '🧠' },
    speech: { label: 'Речь', icon: '💬' },
    motor: { label: 'Моторика', icon: '✋' },
    social: { label: 'Социальное', icon: '👥' },
    sensory: { label: 'Сенсорика', icon: '👀' },
    behavior: { label: 'Поведение', icon: '🎭' },
  }

  const difficultyColors: Record<string, 'default' | 'secondary' | 'outline'> = {
    beginner: 'outline',
    intermediate: 'secondary',
    advanced: 'default',
  }

  const difficultyLabels: Record<string, string> = {
    beginner: 'Начальный',
    intermediate: 'Средний',
    advanced: 'Продвинутый',
  }

  const category = exercise.category
    ? categoryLabels[exercise.category]
    : { label: 'Общее', icon: '📝' }

  return (
    <Link href={`/dashboard/exercises/${exercise.id}`} className="block">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{category.icon}</span>
                {exercise.difficulty && (
                  <Badge variant={difficultyColors[exercise.difficulty]}>
                    {difficultyLabels[exercise.difficulty]}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg line-clamp-2">{exercise.title}</CardTitle>
              {exercise.description && (
                <CardDescription className="line-clamp-2 mt-1">
                  {exercise.description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-3 text-sm text-neutral-600">
            {exercise.category && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Категория:</span>
                <span>{category.label}</span>
              </div>
            )}

            {exercise.durationMinutes && (
              <div className="flex items-center gap-1">
                <span className="font-medium">⏱️</span>
                <span>{exercise.durationMinutes} мин</span>
              </div>
            )}

            {(exercise.ageMin !== undefined || exercise.ageMax !== undefined) && (
              <div className="flex items-center gap-1">
                <span className="font-medium">👶</span>
                <span>
                  {exercise.ageMin && exercise.ageMax
                    ? `${exercise.ageMin}-${exercise.ageMax} лет`
                    : exercise.ageMin
                    ? `от ${exercise.ageMin} лет`
                    : `до ${exercise.ageMax} лет`}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

