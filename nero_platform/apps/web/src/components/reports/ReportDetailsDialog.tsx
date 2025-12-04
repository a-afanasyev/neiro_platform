'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface ReportDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onReview?: () => void
  report: {
    id: string
    submittedAt: string
    status: 'completed' | 'partial' | 'failed'
    durationMinutes: number
    childMood: 'good' | 'neutral' | 'difficult'
    feedbackText: string
    reviewStatus: 'not_reviewed' | 'approved' | 'needs_attention' | 'rejected'
    reviewedAt?: string
    reviewNotes?: string
    assignment?: {
      id: string
      notes?: string
      child?: {
        firstName: string
        lastName: string
      }
      exercise?: {
        title: string
        description?: string
      }
    }
    parent?: {
      firstName: string
      lastName: string
      email: string
    }
    mediaUrls?: string[]
  }
}

/**
 * Получить emoji для настроения
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
 * Получить текст для статуса
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
 * Диалог детального просмотра отчёта
 *
 * Показывает полную информацию об отчёте:
 * - Информация о ребёнке и задании
 * - Статус выполнения и настроение
 * - Отзыв родителя
 * - Прикреплённые медиа (фото/видео)
 * - Отзыв специалиста (если есть)
 */
export function ReportDetailsDialog({
  open,
  onOpenChange,
  onReview,
  report,
}: ReportDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" data-testid="report-details">
        <DialogHeader>
          <DialogTitle>
            Отчёт от {format(new Date(report.submittedAt), 'd MMMM yyyy, HH:mm', { locale: ru })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Информация о ребёнке и задании */}
          {report.assignment && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Информация о задании</h3>
              {report.assignment.child && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Ребёнок:</span>{' '}
                  {report.assignment.child.firstName} {report.assignment.child.lastName}
                </p>
              )}
              {report.assignment.exercise && (
                <div>
                  <p className="text-sm">
                    <span className="font-medium">Упражнение:</span>{' '}
                    {report.assignment.exercise.title}
                  </p>
                  {report.assignment.exercise.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {report.assignment.exercise.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Статусы */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Результаты выполнения</h3>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Статус:</span>
                <Badge variant="outline">{getStatusLabel(report.status)}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Настроение:</span>
                <span className="text-2xl">{getMoodEmoji(report.childMood)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Длительность:</span>
                <span className="text-sm">{report.durationMinutes} мин</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Проверка:</span>
                <Badge>{getReviewStatusLabel(report.reviewStatus)}</Badge>
              </div>
            </div>
          </div>

          {/* Отзыв родителя */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Отзыв родителя</h3>
            {report.parent && (
              <p className="text-xs text-muted-foreground mb-2">
                От: {report.parent.firstName} {report.parent.lastName}
              </p>
            )}
            <p className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-md">
              {report.feedbackText}
            </p>
          </div>

          {/* Медиа файлы */}
          {report.mediaUrls && report.mediaUrls.length > 0 && (
            <div className="space-y-2" data-testid="report-media">
              <h3 className="font-semibold text-lg">Прикреплённые файлы</h3>
              <div className="grid grid-cols-2 gap-4">
                {report.mediaUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-video rounded-md overflow-hidden border">
                    {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img
                        src={url}
                        alt={`Медиа файл`}
                        className="w-full h-full object-cover"
                      />
                    ) : url.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video
                        src={url}
                        controls
                        className="w-full h-full"
                      >
                        Ваш браузер не поддерживает видео.
                      </video>
                    ) : (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full h-full bg-muted hover:bg-muted/80"
                      >
                        <span className="text-sm text-muted-foreground">Открыть файл</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Медиа placeholder если нет файлов */}
          {(!report.mediaUrls || report.mediaUrls.length === 0) && (
            <div className="space-y-2" data-testid="report-media">
              <h3 className="font-semibold text-lg">Прикреплённые файлы</h3>
              <p className="text-sm text-muted-foreground">Нет прикреплённых файлов</p>
            </div>
          )}

          {/* Отзыв специалиста (если есть) */}
          {report.reviewedAt && report.reviewNotes && (
            <div className="space-y-2 border-t pt-4">
              <h3 className="font-semibold text-lg">Отзыв специалиста</h3>
              <p className="text-xs text-muted-foreground">
                {format(new Date(report.reviewedAt), 'd MMMM yyyy, HH:mm', { locale: ru })}
              </p>
              <p className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-md">
                {report.reviewNotes}
              </p>
            </div>
          )}
        </div>

        {/* Footer с кнопкой проверки */}
        {onReview && report.reviewStatus === 'not_reviewed' && (
          <DialogFooter>
            <Button onClick={onReview} data-testid="review-button">
              Проверить отчёт
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
