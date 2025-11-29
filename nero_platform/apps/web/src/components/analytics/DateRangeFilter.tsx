'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'

/**
 * Пропсы компонента DateRangeFilter
 */
interface DateRangeFilterProps {
  /** Выбранный диапазон дней */
  days: number
  /** Callback при изменении диапазона */
  onDaysChange: (days: number) => void
}

/**
 * Предустановленные диапазоны дней
 */
const PRESET_RANGES = [
  { label: '7 дней', days: 7 },
  { label: '30 дней', days: 30 },
  { label: '90 дней', days: 90 },
]

/**
 * Компонент фильтра по диапазону дат
 * 
 * Позволяет выбрать предустановленный диапазон дней для аналитики
 */
export function DateRangeFilter({
  days,
  onDaysChange,
}: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <div className="flex gap-1">
        {PRESET_RANGES.map((range) => (
          <Button
            key={range.days}
            variant={days === range.days ? 'default' : 'outline'}
            size="sm"
            onClick={() => onDaysChange(range.days)}
          >
            {range.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

