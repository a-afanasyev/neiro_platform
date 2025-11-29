'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateRangeFilter } from './DateRangeFilter'
import { childrenApi } from '@/lib/api'
import { Loader2 } from 'lucide-react'

/**
 * Пропсы компонента ProgressHeader
 */
interface ProgressHeaderProps {
  /** ID выбранного ребенка */
  selectedChildId: string | null
  /** Callback при изменении выбранного ребенка */
  onChildChange: (childId: string | null) => void
  /** Выбранный диапазон дней */
  days: number
  /** Callback при изменении диапазона дней */
  onDaysChange: (days: number) => void
  /** Показать состояние загрузки */
  loading?: boolean
}

/**
 * Компонент заголовка страницы прогресса
 * 
 * Содержит:
 * - Выбор ребенка
 * - Фильтр по диапазону дат
 */
export function ProgressHeader({
  selectedChildId,
  onChildChange,
  days,
  onDaysChange,
  loading = false,
}: ProgressHeaderProps) {
  const [children, setChildren] = useState<Array<{ id: string; firstName: string; lastName: string }>>([])
  const [loadingChildren, setLoadingChildren] = useState(true)

  /**
   * Загрузить список детей
   */
  useEffect(() => {
    loadChildren()
  }, [])

  const loadChildren = async () => {
    try {
      setLoadingChildren(true)
      const response = await childrenApi.getChildren({ limit: 100 })
      setChildren(response.data || [])
      
      // Если ребенок не выбран, выбрать первого
      if (!selectedChildId && response.data && response.data.length > 0) {
        onChildChange(response.data[0].id)
      }
    } catch (error) {
      console.error('Error loading children:', error)
    } finally {
      setLoadingChildren(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4 flex-1">
        <h1 className="text-2xl font-bold">Прогресс ребенка</h1>
        
        {loadingChildren ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <Select
            value={selectedChildId || ''}
            onValueChange={(value) => onChildChange(value || null)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Выберите ребенка" />
            </SelectTrigger>
            <SelectContent>
              {children.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  {child.firstName} {child.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <DateRangeFilter days={days} onDaysChange={onDaysChange} />
    </div>
  )
}

