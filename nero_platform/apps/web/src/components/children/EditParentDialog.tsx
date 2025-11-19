'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { childrenApi } from '@/lib/api'

interface ParentInfo {
  id: string
  firstName: string
  lastName: string
  email: string
  relationship: 'mother' | 'father' | 'guardian' | 'other'
  legalGuardian: boolean
}

interface EditParentDialogProps {
  childId: string
  parent: ParentInfo | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  /** Количество законных представителей у ребенка (для валидации) */
  legalGuardiansCount?: number
}

const relationshipLabels: Record<string, string> = {
  mother: 'Мать',
  father: 'Отец',
  guardian: 'Опекун',
  other: 'Другое',
}

/**
 * Диалог для редактирования информации о связи родителя с ребенком
 */
export function EditParentDialog({
  childId,
  parent,
  open,
  onOpenChange,
  onSuccess,
  legalGuardiansCount = 1,
}: EditParentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    relationship: 'guardian' as 'mother' | 'father' | 'guardian' | 'other',
    legalGuardian: true,
  })

  useEffect(() => {
    if (open && parent) {
      // Заполнить форму данными родителя
      setFormData({
        relationship: parent.relationship,
        legalGuardian: parent.legalGuardian,
      })
      setError(null)
    }
  }, [open, parent])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (!parent) {
        throw new Error('Родитель не выбран')
      }

      // Проверка: нельзя снять статус законного представителя, если он единственный
      if (
        parent.legalGuardian &&
        !formData.legalGuardian &&
        legalGuardiansCount <= 1
      ) {
        throw new Error(
          'Нельзя снять статус законного представителя у единственного опекуна. У ребенка должен быть хотя бы один законный представитель.'
        )
      }

      const response = await childrenApi.updateParent(childId, parent.id, {
        relationship: formData.relationship,
        legalGuardian: formData.legalGuardian,
      })

      if (response.success) {
        onOpenChange(false)
        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (err: any) {
      console.error('Ошибка обновления родителя:', err)
      const errorMessage =
        err.response?.data?.error?.message ||
        err.message ||
        'Не удалось обновить информацию о родителе/опекуне'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!parent) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Редактировать родителя/опекуна</DialogTitle>
          <DialogDescription>
            Измените информацию о связи {parent.lastName} {parent.firstName} с
            ребенком
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Информация о родителе (только для чтения) */}
          <div className="space-y-2">
            <Label>Родитель/Опекун</Label>
            <div className="p-3 bg-gray-50 rounded-md text-sm">
              <div className="font-medium">
                {parent.lastName} {parent.firstName}
              </div>
              <div className="text-gray-600">{parent.email}</div>
            </div>
          </div>

          {/* Тип отношений */}
          <div className="space-y-2">
            <Label htmlFor="relationship">Тип отношений *</Label>
            <Select
              value={formData.relationship}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  relationship: value as 'mother' | 'father' | 'guardian' | 'other',
                })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(relationshipLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Законный представитель */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="legalGuardian"
              checked={formData.legalGuardian}
              onChange={(e) =>
                setFormData({ ...formData, legalGuardian: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="legalGuardian" className="text-sm font-medium">
              Законный представитель
            </Label>
          </div>

          {/* Предупреждение при снятии статуса законного представителя */}
          {parent.legalGuardian &&
            !formData.legalGuardian &&
            legalGuardiansCount > 1 && (
              <Alert>
                <AlertDescription>
                  Внимание: вы снимаете статус законного представителя. У ребенка
                  останется {legalGuardiansCount - 1} законный представитель(ей).
                </AlertDescription>
              </Alert>
            )}

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
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
