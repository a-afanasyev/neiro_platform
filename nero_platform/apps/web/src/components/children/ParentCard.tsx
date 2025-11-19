'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { childrenApi } from '@/lib/api'

interface ParentInfo {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  relationship: 'mother' | 'father' | 'guardian' | 'other'
  legalGuardian: boolean
}

interface ParentCardProps {
  parent: ParentInfo
  childId: string
  onEdit?: (parent: ParentInfo) => void
  onRemove?: () => void
  /** Можно ли удалить этого родителя (false если единственный законный представитель) */
  canRemove?: boolean
  /** Количество законных представителей у ребенка */
  legalGuardiansCount?: number
}

const relationshipLabels: Record<string, string> = {
  mother: 'Мать',
  father: 'Отец',
  guardian: 'Опекун',
  other: 'Другое',
}

/**
 * Карточка родителя/опекуна для отображения на странице ребенка
 */
export function ParentCard({
  parent,
  childId,
  onEdit,
  onRemove,
  canRemove = true,
  legalGuardiansCount = 1,
}: ParentCardProps) {
  const [isRemoving, setIsRemoving] = useState(false)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRemove = async () => {
    setIsRemoving(true)
    setError(null)

    try {
      const response = await childrenApi.removeParent(childId, parent.id)
      if (response.success) {
        setShowRemoveDialog(false)
        if (onRemove) {
          onRemove()
        }
      }
    } catch (err: any) {
      console.error('Ошибка удаления родителя:', err)
      const errorMessage =
        err.response?.data?.error?.message ||
        err.message ||
        'Не удалось удалить связь с родителем/опекуном'
      setError(errorMessage)
    } finally {
      setIsRemoving(false)
    }
  }

  const canActuallyRemove =
    canRemove && !(parent.legalGuardian && legalGuardiansCount <= 1)

  return (
    <>
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-lg">
                {parent.lastName} {parent.firstName}
              </h4>
              <Badge variant="outline">{relationshipLabels[parent.relationship]}</Badge>
              {parent.legalGuardian && (
                <Badge variant="default" className="bg-green-600">
                  Законный представитель
                </Badge>
              )}
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <div>
                <span className="font-medium">Email:</span> {parent.email}
              </div>
              {parent.phone && (
                <div>
                  <span className="font-medium">Телефон:</span> {parent.phone}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(parent)}>
                Редактировать
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowRemoveDialog(true)}
              disabled={!canActuallyRemove}
              title={
                !canActuallyRemove
                  ? 'Нельзя удалить единственного законного представителя'
                  : undefined
              }
            >
              Удалить
            </Button>
          </div>
        </div>

        {!canActuallyRemove && parent.legalGuardian && legalGuardiansCount <= 1 && (
          <div className="mt-3 text-xs text-amber-600 bg-amber-50 p-2 rounded">
            Этот родитель/опекун является единственным законным представителем ребенка
            и не может быть удален.
          </div>
        )}
      </div>

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить связь с родителем?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить связь с {parent.lastName}{' '}
              {parent.firstName}? Это действие можно отменить, добавив родителя
              снова.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isRemoving}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRemoving ? 'Удаление...' : 'Удалить'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
