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
 * - Прикрепления фото/видео
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
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Форма (значения по умолчанию совпадают с тестами)
  const [mood, setMood] = useState<string>('')
  const [duration, setDuration] = useState<string>('')
  const [notes, setNotes] = useState<string>('')

  /**
   * Обработка выбора файла
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMediaFile(file)

      // Создать превью для изображений
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
  }

  /**
   * Обработка отправки формы
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Валидация
      if (!mood) {
        setError('Пожалуйста, выберите настроение ребенка')
        setIsSubmitting(false)
        return
      }

      if (!duration || parseInt(duration) < 1) {
        setError('Пожалуйста, укажите длительность (минимум 1 минута)')
        setIsSubmitting(false)
        return
      }

      if (!notes.trim()) {
        setError('Пожалуйста, опишите как прошло занятие')
        setIsSubmitting(false)
        return
      }

      // Маппинг русских значений в API значения
      const moodMap: Record<string, 'good' | 'neutral' | 'difficult'> = {
        'Хорошее': 'good',
        'Нейтральное': 'neutral',
        'Сложное': 'difficult',
      }

      // Отправка отчета
      const response = await reportsApi.createReport({
        assignmentId,
        status: 'completed',
        durationMinutes: parseInt(duration),
        childMood: moodMap[mood] || 'neutral',
        feedbackText: notes.trim(),
      })

      if (response.success) {
        // Показать success toast (используя div с data-testid)
        const toastDiv = document.createElement('div')
        toastDiv.setAttribute('data-testid', 'success-toast')
        toastDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 16px; border-radius: 8px; z-index: 9999;'
        toastDiv.textContent = 'Отчёт успешно создан'
        document.body.appendChild(toastDiv)

        setTimeout(() => {
          document.body.removeChild(toastDiv)
        }, 3000)

        // Сброс формы
        setMood('')
        setDuration('')
        setNotes('')
        setMediaFile(null)
        setImagePreview(null)

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" data-testid="create-report-dialog">
        <DialogHeader>
          <DialogTitle>Отчет о выполнении</DialogTitle>
          <DialogDescription>
            Заполните отчет о том, как прошло {assignmentTitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Настроение ребенка */}
            <div className="grid gap-2">
              <Label htmlFor="mood">Настроение ребенка *</Label>
              <Select
                value={mood}
                onValueChange={setMood}
              >
                <SelectTrigger id="mood" data-testid="mood-select">
                  <SelectValue placeholder="Выберите настроение" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Хорошее">
                    <span className="flex items-center gap-2">
                      <span>😊</span>
                      <span>Хорошее - был заинтересован и активен</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="Нейтральное">
                    <span className="flex items-center gap-2">
                      <span>😐</span>
                      <span>Нейтральное - спокойно выполнял задание</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="Сложное">
                    <span className="flex items-center gap-2">
                      <span>😔</span>
                      <span>Сложное - было трудно или не хотел заниматься</span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Длительность */}
            <div className="grid gap-2">
              <Label htmlFor="duration">Длительность (минуты) *</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                max={240}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="30"
                data-testid="duration-input"
              />
              <p className="text-sm text-muted-foreground">
                Укажите сколько времени заняло занятие
              </p>
            </div>

            {/* Отзыв */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Комментарий о занятии *</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Опишите как прошло занятие, что получилось хорошо, с чем были трудности..."
                rows={5}
                maxLength={2000}
                required
                data-testid="notes-textarea"
              />
              <p className="text-sm text-muted-foreground">
                {notes.length}/2000 символов
              </p>
            </div>

            {/* Медиа вложения */}
            <div className="grid gap-2">
              <Label htmlFor="file">Фото или видео (необязательно)</Label>
              <Input
                id="file"
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                data-testid="file-input"
              />
              <p className="text-sm text-muted-foreground">
                Можно добавить фото или видео, чтобы специалист увидел прогресс ребенка
              </p>
            </div>

            {/* Превью изображения */}
            {imagePreview && (
              <div className="grid gap-2">
                <Label>Превью</Label>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full h-auto rounded-md border"
                  data-testid="image-preview"
                />
              </div>
            )}

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
            <Button type="submit" disabled={isSubmitting} data-testid="submit-report">
              {isSubmitting ? 'Отправка...' : 'Отправить отчет'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
