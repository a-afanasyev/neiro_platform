"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { UploadCloud, X, FileVideo, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { mediaApi } from "@/lib/api"

export interface UploadedMediaMeta {
  mediaId: string
  fileKey: string
  fileName: string
  fileType: string
  fileSize: number
  url?: string
}

type UploadStatus = "idle" | "uploading" | "success" | "error"

interface UploadItem {
  id: string
  file: File
  preview?: string
  progress: number
  status: UploadStatus
  error?: string
  uploaded?: UploadedMediaMeta
}

interface MediaUploaderProps {
  maxFiles?: number
  onChange?: (media: UploadedMediaMeta[]) => void
}

const IMAGE_MAX_SIZE = 10 * 1024 * 1024 // 10MB
const VIDEO_MAX_SIZE = 100 * 1024 * 1024 // 100MB
const ACCEPTED_TYPES = ["image/", "video/"]

export function MediaUploader({ maxFiles = 5, onChange }: MediaUploaderProps) {
  const [items, setItems] = useState<UploadItem[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const usedSlots = items.length
  const availableSlots = Math.max(0, maxFiles - usedSlots)

  const notifyChange = useCallback(
    (nextItems: UploadItem[]) => {
      const uploaded = nextItems
        .filter((item) => item.status === "success" && item.uploaded)
        .map((item) => item.uploaded!) // eslint-disable-line @typescript-eslint/no-non-null-assertion
      onChange?.(uploaded)
    },
    [onChange],
  )

  useEffect(() => {
    notifyChange(items)
  }, [items, notifyChange])

  useEffect(() => {
    return () => {
      items.forEach((item) => {
        if (item.preview) {
          URL.revokeObjectURL(item.preview)
        }
      })
    }
  }, [items])

  const validateFile = (file: File) => {
    const typeValid = ACCEPTED_TYPES.some((type) => file.type.startsWith(type))
    if (!typeValid) {
      return "Поддерживаются только фото и видео"
    }

    const isImage = file.type.startsWith("image/")
    const maxSize = isImage ? IMAGE_MAX_SIZE : VIDEO_MAX_SIZE
    if (file.size > maxSize) {
      return isImage
        ? "Фотографии должны быть меньше 10 МБ"
        : "Видео должно быть меньше 100 МБ"
    }

    return null
  }

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const incoming = Array.from(files)
    const allowedCount = Math.min(incoming.length, availableSlots)

    if (incoming.length > allowedCount) {
      setError(`Можно загрузить максимум ${maxFiles} файлов`)
    }

    incoming.slice(0, allowedCount).forEach((file) => {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      const id = crypto.randomUUID()
      const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined

      const newItem: UploadItem = {
        id,
        file,
        preview,
        progress: 0,
        status: "idle",
      }

      setItems((prev) => [...prev, newItem])
      uploadFile(id, file)
    })
  }

  const uploadFile = async (id: string, file: File) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "uploading", progress: 10 } : item)),
    )
    setError(null)

    try {
      const { data } = await mediaApi.generateUploadUrl({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      })

      await uploadWithProgress(data.uploadUrl, file, (progress) => {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, progress } : item)),
        )
      })

      const confirm = await mediaApi.confirmUpload(data.mediaId, { fileKey: data.fileKey })
      const uploadedMeta: UploadedMediaMeta = {
        mediaId: data.mediaId,
        fileKey: data.fileKey,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        url: confirm?.data?.url,
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "success",
                progress: 100,
                uploaded: uploadedMeta,
              }
            : item,
        ),
      )
    } catch (err: any) {
      console.error("Failed to upload media", err)
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "error",
                error:
                  err?.response?.data?.error?.message ||
                  err?.message ||
                  "Не удалось загрузить файл",
              }
            : item,
        ),
      )
    }
  }

  const uploadWithProgress = (url: string, file: File, onProgress: (value: number) => void) => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("PUT", url, true)
      xhr.setRequestHeader("Content-Type", file.type)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100)
          onProgress(percent)
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress(100)
          resolve()
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      }

      xhr.onerror = () => reject(new Error("Network error during upload"))
      xhr.send(file)
    })
  }

  const removeItem = (id: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id)
      const removed = prev.find((item) => item.id === id)
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview)
      }
      return next
    })
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragActive(false)
    handleFiles(event.dataTransfer.files)
  }

  const handleDrag = (event: React.DragEvent<HTMLDivElement>, isActive: boolean) => {
    event.preventDefault()
    setDragActive(isActive)
  }

  const inProgress = useMemo(
    () => items.some((item) => item.status === "uploading"),
    [items],
  )

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/30",
          availableSlots === 0 && "pointer-events-none opacity-60",
        )}
        onDragOver={(event) => handleDrag(event, true)}
        onDragLeave={(event) => handleDrag(event, false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        aria-disabled={availableSlots === 0}
      >
        <UploadCloud className="h-10 w-10 text-primary" />
        <div>
          <p className="font-medium">Перетащите файлы сюда или нажмите для выбора</p>
          <p className="text-sm text-muted-foreground">
            Изображения до 10 МБ, видео до 100 МБ. Осталось слотов: {availableSlots}
          </p>
        </div>
        <Button type="button" variant="secondary" disabled={availableSlots === 0}>
          Выбрать файлы
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept="image/*,video/*"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/60 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {items.length > 0 && (
        <div className="grid gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-border/80 p-3"
            >
              <div className="h-16 w-20 overflow-hidden rounded-md bg-muted">
                {item.file.type.startsWith("image/") && item.preview ? (
                  <img
                    src={item.preview}
                    alt={item.file.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <FileVideo className="h-6 w-6" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(item.file.size / (1024 * 1024)).toFixed(1)} МБ
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeItem(item.id)}
                    aria-label="Удалить файл"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {item.status === "uploading" && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Загрузка {item.progress}%</span>
                  </div>
                )}

                {item.status === "error" && (
                  <p className="text-xs text-destructive">{item.error}</p>
                )}

                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      item.status === "error"
                        ? "bg-destructive"
                        : item.status === "success"
                          ? "bg-emerald-500"
                          : "bg-primary",
                    )}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {inProgress && (
        <p className="text-xs text-muted-foreground">
          Не закрывайте окно до завершения загрузки всех файлов
        </p>
      )}
    </div>
  )
}

