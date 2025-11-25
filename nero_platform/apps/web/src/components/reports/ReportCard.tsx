'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface ReportCardProps {
  report: {
    id: string
    submittedAt: string
    status: 'completed' | 'partial' | 'failed'
    durationMinutes: number
    childMood: 'good' | 'neutral' | 'difficult'
    feedbackText: string
    reviewStatus: 'not_reviewed' | 'approved' | 'needs_attention' | 'rejected'
    reviewedAt?: string
    assignment?: {
      id: string
      notes?: string
      child?: {
        firstName: string
        lastName: string
      }
    }
    parent?: {
      firstName: string
      lastName: string
      email: string
    }
  }
  /** Показать действия (для родителя - удаление, для специалиста - проверка) */
  showActions?: boolean
  /** Callback при клике на проверку */
  onReview?: () => void
  /** Callback при клике на удаление */
  onDelete?: () => void
}

/**
 * Получить emoji для настроения ребенка
 */
const getMoodEmoji = (mood: string) => {
  switch (mood) {
    case 'good':
      return '😊'
    case 'neutral':
      return '😐'
    case 'difficult':
      return '😔'
    default:
      return '😐'
  }
}

/**
 * Получить текст для статуса выполнения
 */
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Выполнено'
    case 'partial':
      return 'Частично'
    case 'failed':
      return 'Не выполнено'
    default:
      return status
  }
}

/**
 * Получить цвет бейджа для статуса проверки
 */
const getReviewStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'approved':
      return 'default'
    case 'needs_attention':
      return 'secondary'
    case 'rejected':
      return 'destructive'
    default:
      return 'outline'
  }
}

/**
 * Получить текст для статуса проверки
 */
const getReviewStatusLabel = (status: string) => {
  switch (status) {
    case 'approved':
      return 'Одобрено'
    case 'needs_attention':
      return 'Требует внимания'
    case 'rejected':
      return 'Отклонено'
    case 'not_reviewed':
      return 'Ожидает проверки'
    default:
      return status
  }
}

/**
 * Компонент карточки отчета
 *
 * Отображает информацию о выполненном задании:
 * - Дата и время
 * - Статус выполнения
 * - Настроение ребенка
 * - Отзыв родителя
 * - Статус проверки специалистом
 */
export function ReportCard({
  report,
  showActions = false,
  onReview,
  onDelete,
}: ReportCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              Отчет от {format(new Date(report.submittedAt), 'd MMMM yyyy, HH:mm', { locale: ru })}
            </CardTitle>
            {report.assignment?.child && (
              <CardDescription>
                {report.assignment.child.firstName} {report.assignment.child.lastName}
              </CardDescription>
            )}
            {report.parent && (
              <CardDescription className="text-xs mt-1">
                Родитель: {report.parent.firstName} {report.parent.lastName}
              </CardDescription>
            )}
          </div>
          <Badge variant={getReviewStatusVariant(report.reviewStatus)}>
            {getReviewStatusLabel(report.reviewStatus)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Статусы */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">Статус:</span>
            <Badge variant="outline">{getStatusLabel(report.status)}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Настроение:</span>
            <span className="text-lg">{getMoodEmoji(report.childMood)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Длительность:</span>
            <span>{report.durationMinutes} мин</span>
          </div>
        </div>

        {/* Отзыв */}
        <div>
          <p className="text-sm font-medium mb-2">Отзыв:</p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {report.feedbackText}
          </p>
        </div>

        {/* Информация о проверке */}
        {report.reviewedAt && (
          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground">
              Проверено {format(new Date(report.reviewedAt), 'd MMMM yyyy, HH:mm', { locale: ru })}
            </p>
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="flex justify-end gap-2">
          {onReview && report.reviewStatus === 'not_reviewed' && (
            <Button size="sm" onClick={onReview}>
              Проверить
            </Button>
          )}
          {onDelete && !report.reviewedAt && (
            <Button size="sm" variant="outline" onClick={onDelete}>
              Удалить
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
