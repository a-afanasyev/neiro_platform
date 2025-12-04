'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { reportsApi } from '@/lib/api'

interface ReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reportId: string
  onSuccess?: () => void
}

/**
 * Диалог для проверки отчёта специалистом
 *
 * Позволяет специалисту:
 * - Выбрать статус проверки (одобрено/требует внимания/отклонено)
 * - Оставить комментарий
 */
export function ReviewDialog({
  open,
  onOpenChange,
  reportId,
  onSuccess,
}: ReviewDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reviewStatus, setReviewStatus] = useState<string>('approved')
  const [reviewNotes, setReviewNotes] = useState<string>('')

  /**
   * Обработка отправки отзыва
   */
  const handleSubmit = async () => {
    setError(null)
    setIsSubmitting(true)

    try {
      // Валидация
      if (!reviewNotes.trim()) {
        setError('Пожалуйста, добавьте комментарий')
        setIsSubmitting(false)
        return
      }

      // Отправка отзыва
      const response = await reportsApi.reviewReport(reportId, {
        reviewStatus,
        reviewNotes: reviewNotes.trim(),
      })

      if (response.success) {
        // Показать success toast
        const toastDiv = document.createElement('div')
        toastDiv.setAttribute('data-testid', 'success-toast')
        toastDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 16px; border-radius: 8px; z-index: 9999;'
        toastDiv.textContent = 'Отзыв успешно отправлен'
        document.body.appendChild(toastDiv)

        setTimeout(() => {
          document.body.removeChild(toastDiv)
        }, 3000)

        // Сброс формы
        setReviewStatus('approved')
        setReviewNotes('')

        // Закрытие диалога
        onOpenChange(false)

        // Callback успеха
        if (onSuccess) {
          onSuccess()
        }
      } else {
        setError(response.error?.message || 'Не удалось отправить отзыв')
      }
    } catch (err: any) {
      console.error('Error submitting review:', err)
      setError(
        err.response?.data?.error?.message ||
        err.message ||
        'Произошла ошибка при отправке отзыва'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="review-dialog">
        <DialogHeader>
          <DialogTitle>Проверка отчёта</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Статус проверки */}
          <div className="space-y-3">
            <Label>Статус проверки *</Label>
            <Select value={reviewStatus} onValueChange={setReviewStatus}>
              <SelectTrigger data-testid="review-status-select">
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved" data-testid="approved-option">
                  ✅ Одобрено - отличная работа
                </SelectItem>
                <SelectItem value="needs_attention" data-testid="needs-attention-option">
                  ⚠️ Требует внимания - есть замечания
                </SelectItem>
                <SelectItem value="rejected" data-testid="rejected-option">
                  ❌ Отклонено - нужно переделать
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Комментарий */}
          <div className="space-y-2">
            <Label htmlFor="review-notes">Комментарий *</Label>
            <Textarea
              id="review-notes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Опишите что было сделано хорошо, какие есть замечания или рекомендации..."
              rows={6}
              maxLength={2000}
              required
              data-testid="review-notes"
            />
            <p className="text-sm text-muted-foreground">
              {reviewNotes.length}/2000 символов
            </p>
          </div>

          {/* Ошибка */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Подсказка */}
          <Alert>
            <AlertDescription>
              <strong>Совет:</strong> Будьте конкретны в своих комментариях.
              Укажите что получилось хорошо и что можно улучшить.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Отмена
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            data-testid="save-review"
          >
            {isSubmitting ? 'Отправка...' : 'Сохранить отзыв'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
