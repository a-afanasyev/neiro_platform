"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { UploadedMediaMeta } from "./MediaUploader"

type ReviewStatus = "approved" | "needs_attention" | "rejected"

export interface ReportDetails {
  id: string
  submittedAt: string
  status: "completed" | "partial" | "failed"
  durationMinutes: number
  childMood: "good" | "neutral" | "difficult"
  feedbackText: string
  media?: UploadedMediaMeta[]
  parent?: {
    firstName: string
    lastName: string
    email?: string
  }
  assignment?: {
    id: string
    title?: string
    notes?: string
    child?: {
      firstName: string
      lastName: string
    }
  }
}

interface ReviewReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  report: ReportDetails | null
  onSubmit: (payload: { reviewStatus: ReviewStatus; reviewComments: string }) => Promise<void> | void
  isSubmitting?: boolean
}

const REVIEW_OPTIONS: Array<{ value: ReviewStatus; label: string; helper: string }> = [
  {
    value: "approved",
    label: "Одобрено",
    helper: "Отчет соответствует требованиям и может быть закрыт",
  },
  {
    value: "needs_attention",
    label: "Нужна доработка",
    helper: "Попросить родителя дополнить отчет или дать рекомендации",
  },
  {
    value: "rejected",
    label: "Отклонено",
    helper: "Отчет не соответствует требованиям и должен быть пересдан",
  },
]

const moodLabel = (mood: ReportDetails["childMood"]) => {
  switch (mood) {
    case "good":
      return "Хорошее"
    case "neutral":
      return "Нейтральное"
    case "difficult":
      return "Сложное"
    default:
      return mood
  }
}

export function ReviewReportDialog({
  open,
  onOpenChange,
  report,
  onSubmit,
  isSubmitting = false,
}: ReviewReportDialogProps) {
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>("approved")
  const [comments, setComments] = useState("")
  const [error, setError] = useState<string | null>(null)

  const mediaFiles = useMemo(() => {
    if (!report?.media || !Array.isArray(report.media)) {
      return []
    }
    return report.media as UploadedMediaMeta[]
  }, [report])

  useEffect(() => {
    if (open) {
      setReviewStatus("approved")
      setComments("")
      setError(null)
    }
  }, [open, report?.id])

  if (!report) {
    return null
  }

  const handleSubmit = async () => {
    if (comments.trim().length < 10) {
      setError("Комментарий должен содержать минимум 10 символов")
      return
    }

    setError(null)
    await onSubmit({
      reviewStatus,
      reviewComments: comments.trim(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-3xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Проверка отчета</DialogTitle>
          <DialogDescription>
            Отчет от {format(new Date(report.submittedAt), "d MMMM yyyy, HH:mm", { locale: ru })}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[65vh] pr-4">
          <div className="space-y-5 py-1">
            <section className="space-y-2 rounded-lg border p-3">
              <p className="text-sm font-medium">Информация</p>
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">Ребенок:</span>{" "}
                  {report.assignment?.child
                    ? `${report.assignment.child.firstName} ${report.assignment.child.lastName}`
                    : "—"}
                </div>
                <div>
                  <span className="font-medium text-foreground">Настроение:</span>{" "}
                  {moodLabel(report.childMood)}
                </div>
                <div>
                  <span className="font-medium text-foreground">Длительность:</span>{" "}
                  {report.durationMinutes} мин
                </div>
                <div>
                  <span className="font-medium text-foreground">Родитель:</span>{" "}
                  {report.parent
                    ? `${report.parent.firstName} ${report.parent.lastName}`
                    : "—"}
                </div>
              </div>
            </section>

            <section className="space-y-2 rounded-lg border p-3">
              <p className="text-sm font-medium">Отзыв родителя</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {report.feedbackText}
              </p>
            </section>

            {mediaFiles.length > 0 && (
              <section className="space-y-2 rounded-lg border p-3">
                <p className="text-sm font-medium">Медиа материалы</p>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {mediaFiles.map((media) => (
                    <figure
                      key={media.mediaId}
                      className="group relative overflow-hidden rounded-md border"
                    >
                      {media.fileType.startsWith("image/") && media.url ? (
                        <img
                          src={media.url}
                          alt={media.fileName}
                          className="h-40 w-full object-cover transition group-hover:scale-105"
                        />
                      ) : media.fileType.startsWith("video/") && media.url ? (
                        <video
                          controls
                          className="h-40 w-full object-cover"
                          preload="metadata"
                          src={media.url}
                        />
                      ) : (
                        <div className="flex h-40 w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                          Нет предпросмотра
                        </div>
                      )}
                      <figcaption className="px-2 py-1 text-xs text-muted-foreground">
                        {media.fileName}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-4 rounded-lg border p-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Статус проверки</Label>
                <RadioGroup
                  value={reviewStatus}
                  onValueChange={(value: ReviewStatus) => setReviewStatus(value)}
                  className="space-y-3"
                >
                  {REVIEW_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-start gap-3 rounded-lg border p-3">
                      <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                      <div>
                        <Label htmlFor={option.value} className="font-medium">
                          {option.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">{option.helper}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-notes">Комментарий специалиста *</Label>
                <Textarea
                  id="review-notes"
                  rows={4}
                  value={comments}
                  onChange={(event) => setComments(event.target.value)}
                  placeholder="Опишите выводы по отчету, рекомендации для родителя или шаги, которые нужно предпринять дальше."
                />
                <p className="text-xs text-muted-foreground">
                  Минимум 10 символов. Комментарий увидит родитель.
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </section>
          </div>
        </ScrollArea>

        <DialogFooter className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Отмена
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Сохранение..." : "Сохранить отзыв"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

