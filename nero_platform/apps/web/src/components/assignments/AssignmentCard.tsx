import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Assignment {
  id: string
  title: string
  description?: string
  status: string
  scheduledFor: string
  durationMinutes?: number
  location?: string
  isHomework?: boolean
  child?: {
    firstName: string
    lastName: string
  }
  specialist?: {
    firstName: string
    lastName: string
  }
}

interface AssignmentCardProps {
  assignment: Assignment
  onComplete?: (id: string) => void
  onCancel?: (id: string) => void
  showActions?: boolean
}

/**
 * Карточка назначения для отображения в календаре
 */
export function AssignmentCard({
  assignment,
  onComplete,
  onCancel,
  showActions = false,
}: AssignmentCardProps) {
  const statusLabels: Record<string, string> = {
    scheduled: 'Запланировано',
    in_progress: 'В процессе',
    completed: 'Выполнено',
    cancelled: 'Отменено',
    skipped: 'Пропущено',
    overdue: 'Просрочено',
  }

  const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    scheduled: 'default',
    in_progress: 'secondary',
    completed: 'secondary',
    cancelled: 'destructive',
    skipped: 'outline',
    overdue: 'destructive',
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isPastDue = new Date(assignment.scheduledFor) < new Date() && assignment.status === 'scheduled'

  return (
    <Card
      className={`${
        isPastDue ? 'border-red-300 bg-red-50' : ''
      } transition-all hover:shadow-md`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={statusColors[assignment.status]}>
                {statusLabels[assignment.status] || assignment.status}
              </Badge>
              {assignment.isHomework && <Badge variant="outline">🏠 Домашнее</Badge>}
              {isPastDue && <Badge variant="destructive">Просрочено</Badge>}
            </div>
            <CardTitle className="text-base">{assignment.title}</CardTitle>
            {assignment.description && (
              <CardDescription className="text-sm mt-1 line-clamp-2">
                {assignment.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Время и место */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-neutral-600">
          <div className="flex items-center gap-1">
            <span className="font-medium">⏰</span>
            <span>{formatTime(assignment.scheduledFor)}</span>
          </div>

          {assignment.durationMinutes && (
            <div className="flex items-center gap-1">
              <span className="font-medium">⏱️</span>
              <span>{assignment.durationMinutes} мин</span>
            </div>
          )}

          {assignment.location && (
            <div className="flex items-center gap-1">
              <span className="font-medium">📍</span>
              <span>{assignment.location}</span>
            </div>
          )}
        </div>

        {/* Ребенок и специалист */}
        {(assignment.child || assignment.specialist) && (
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-neutral-700">
            {assignment.child && (
              <div>
                <span className="font-medium text-neutral-500">Ребенок: </span>
                <span>
                  {assignment.child.firstName} {assignment.child.lastName}
                </span>
              </div>
            )}

            {assignment.specialist && (
              <div>
                <span className="font-medium text-neutral-500">Специалист: </span>
                <span>
                  {assignment.specialist.firstName} {assignment.specialist.lastName}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Действия */}
        {showActions && assignment.status === 'scheduled' && (
          <div className="flex gap-2 pt-2">
            {onComplete && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onComplete(assignment.id)}
                className="flex-1"
              >
                ✅ Выполнено
              </Button>
            )}
            {onCancel && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onCancel(assignment.id)}
                className="flex-1"
              >
                ❌ Отменить
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

