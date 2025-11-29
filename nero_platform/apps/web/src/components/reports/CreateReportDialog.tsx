'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { reportsApi } from '@/lib/api'
import { MediaUploader, UploadedMediaMeta } from './MediaUploader'

/**
 * Пропсы компонента CreateReportDialog
 */
interface CreateReportDialogProps {
  /** Видимость диалога */
  open: boolean
  /** Callback для изменения видимости */
  onOpenChange: (open: boolean) => void
  /** ID назначения для которого создается отчет */
  assignmentId: string
  /** Название назначения */
  assignmentTitle?: string
  /** Callback после успешного создания */
  onSuccess?: () => void
}

/**
 * Компонент диалога для создания отчета о выполнении задания
 *
 * Родитель использует этот компонент для:
 * - Отметки о выполнении задания
 * - Описания настроения ребенка
 * - Оставления feedback для специалиста
 * - Прикрепления фото/видео (будущая функция)
 */
export function CreateReportDialog({
  open,
  onOpenChange,
  assignmentId,
  assignmentTitle = 'задание',
  onSuccess,
}: CreateReportDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mediaAttachments, setMediaAttachments] = useState<UploadedMediaMeta[]>([])

  // Форма
  const [formData, setFormData] = useState({
    status: 'completed' as 'completed' | 'partial' | 'failed',
    durationMinutes: 30,
    childMood: 'good' as 'good' | 'neutral' | 'difficult',
    feedbackText: '',
  })

  /**
   * Обработка отправки формы
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Валидация
      if (!formData.feedbackText.trim()) {
        setError('Пожалуйста, опишите как прошло занятие')
        setIsSubmitting(false)
        return
      }

      if (formData.durationMinutes < 1) {
        setError('Длительность должна быть больше 0 минут')
        setIsSubmitting(false)
        return
      }

      // Отправка отчета
      const response = await reportsApi.createReport({
        assignmentId,
        status: formData.status,
        durationMinutes: formData.durationMinutes,
        childMood: formData.childMood,
        feedbackText: formData.feedbackText.trim(),
        ...(mediaAttachments.length > 0 ? { media: mediaAttachments } : {}),
      })

      if (response.success) {
        // Сброс формы
        setFormData({
          status: 'completed',
          durationMinutes: 30,
          childMood: 'good',
          feedbackText: '',
        })
        setMediaAttachments([])

        // Закрытие диалога
        onOpenChange(false)

        // Callback успеха
        if (onSuccess) {
          onSuccess()
        }
      } else {
        setError(response.error?.message || 'Не удалось создать отчет')
      }
    } catch (err: any) {
      console.error('Error creating report:', err)
      setError(
        err.response?.data?.error?.message ||
        err.message ||
        'Произошла ошибка при создании отчета'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Обработка изменения поля формы
   */
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Отчет о выполнении</DialogTitle>
          <DialogDescription>
            Заполните отчет о том, как прошло {assignmentTitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Статус выполнения */}
            <div className="grid gap-2">
              <Label htmlFor="status">Статус выполнения</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Выполнено полностью</SelectItem>
                  <SelectItem value="partial">Выполнено частично</SelectItem>
                  <SelectItem value="failed">Не удалось выполнить</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Длительность */}
            <div className="grid gap-2">
              <Label htmlFor="duration">Длительность (минуты)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                max={240}
                value={formData.durationMinutes}
                onChange={(e) => handleChange('durationMinutes', parseInt(e.target.value) || 0)}
                placeholder="30"
              />
              <p className="text-sm text-muted-foreground">
                Укажите сколько времени заняло занятие
              </p>
            </div>

            {/* Настроение ребенка */}
            <div className="grid gap-2">
              <Label htmlFor="mood">Настроение ребенка</Label>
              <Select
                value={formData.childMood}
                onValueChange={(value) => handleChange('childMood', value)}
              >
                <SelectTrigger id="mood">
                  <SelectValue placeholder="Выберите настроение" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">
                    <span className="flex items-center gap-2">
                      <span>😊</span>
                      <span>Хорошее - был заинтересован и активен</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="neutral">
                    <span className="flex items-center gap-2">
                      <span>😐</span>
                      <span>Нейтральное - спокойно выполнял задание</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="difficult">
                    <span className="flex items-center gap-2">
                      <span>😔</span>
                      <span>Сложное - было трудно или не хотел заниматься</span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Медиа вложения */}
            <div className="grid gap-2">
              <Label>Фото и видео</Label>
              <MediaUploader onChange={setMediaAttachments} />
              <p className="text-sm text-muted-foreground">
                Можно добавить до 5 файлов, чтобы специалист увидел прогресс ребенка
              </p>
            </div>

            {/* Отзыв */}
            <div className="grid gap-2">
              <Label htmlFor="feedback">Отзыв о занятии *</Label>
              <Textarea
                id="feedback"
                value={formData.feedbackText}
                onChange={(e) => handleChange('feedbackText', e.target.value)}
                placeholder="Опишите как прошло занятие, что получилось хорошо, с чем были трудности..."
                rows={5}
                maxLength={2000}
                required
              />
              <p className="text-sm text-muted-foreground">
                {formData.feedbackText.length}/2000 символов
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
                <strong>Совет:</strong> Опишите конкретные достижения ребенка,
                эмоции, реакции. Это поможет специалисту лучше понять прогресс
                и скорректировать программу занятий.
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Отправка...' : 'Отправить отчет'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
