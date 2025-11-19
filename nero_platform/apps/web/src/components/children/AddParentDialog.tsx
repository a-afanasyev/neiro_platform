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
import { childrenApi, usersApi } from '@/lib/api'

interface Parent {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface AddParentDialogProps {
  childId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  /** Список уже привязанных родителей (для исключения из выбора) */
  existingParentIds?: string[]
}

const relationshipLabels: Record<string, string> = {
  mother: 'Мать',
  father: 'Отец',
  guardian: 'Опекун',
  other: 'Другое',
}

/**
 * Диалог для добавления родителя/опекуна к ребенку
 */
export function AddParentDialog({
  childId,
  open,
  onOpenChange,
  onSuccess,
  existingParentIds = [],
}: AddParentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingParents, setIsLoadingParents] = useState(false)

  const [availableParents, setAvailableParents] = useState<Parent[]>([])

  const [formData, setFormData] = useState({
    parentUserId: '',
    relationship: 'guardian' as 'mother' | 'father' | 'guardian' | 'other',
    legalGuardian: true,
  })

  useEffect(() => {
    if (open) {
      loadParents()
      // Сбросить форму при открытии
      setFormData({
        parentUserId: '',
        relationship: 'guardian',
        legalGuardian: true,
      })
      setError(null)
    }
  }, [open])

  const loadParents = async () => {
    setIsLoadingParents(true)
    try {
      const response = await usersApi.getParents()
      if (response.success) {
        const allParents = response.data?.items || response.data || []
        // Исключить уже привязанных родителей
        const filtered = allParents.filter(
          (parent: Parent) => !existingParentIds.includes(parent.id)
        )
        setAvailableParents(filtered)
      }
    } catch (err: any) {
      console.error('Ошибка загрузки родителей:', err)
      setError('Не удалось загрузить список родителей')
    } finally {
      setIsLoadingParents(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (!formData.parentUserId) {
        throw new Error('Выберите родителя/опекуна')
      }

      const response = await childrenApi.addParent(childId, {
        parentUserId: formData.parentUserId,
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
      console.error('Ошибка добавления родителя:', err)
      const errorMessage =
        err.response?.data?.error?.message ||
        err.message ||
        'Не удалось добавить родителя/опекуна'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Добавить родителя/опекуна</DialogTitle>
          <DialogDescription>
            Привяжите родителя или опекуна к профилю ребенка
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoadingParents ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : availableParents.length === 0 ? (
          <Alert>
            <AlertDescription>
              Нет доступных пользователей с ролью &quot;Родитель&quot;. Сначала создайте
              пользователя с этой ролью.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Выбор родителя */}
            <div className="space-y-2">
              <Label htmlFor="parentUserId">Родитель/Опекун *</Label>
              <Select
                value={formData.parentUserId}
                onValueChange={(value) => setFormData({ ...formData, parentUserId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите пользователя" />
                </SelectTrigger>
                <SelectContent>
                  {availableParents.map((parent) => (
                    <SelectItem key={parent.id} value={parent.id}>
                      {parent.lastName} {parent.firstName} ({parent.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                onChange={(e) => setFormData({ ...formData, legalGuardian: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="legalGuardian" className="text-sm font-medium">
                Законный представитель
              </Label>
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
              <Button type="submit" disabled={isSubmitting || !formData.parentUserId}>
                {isSubmitting ? 'Добавление...' : 'Добавить'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
