'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, TrendingUp, Smile, Calendar } from 'lucide-react'

/**
 * Пропсы компонента KPICard
 */
interface KPICardProps {
  /** Заголовок карточки */
  title: string
  /** Значение для отображения */
  value: string | number
  /** Общее значение (опционально, для процентов) */
  total?: number
  /** Иконка для отображения */
  icon?: 'check-circle' | 'trending-up' | 'smile' | 'calendar'
  /** Тенденция (опционально) */
  trend?: {
    value: number
    label: string
  }
}

/**
 * Компонент карточки KPI (Key Performance Indicator)
 * 
 * Отображает ключевые метрики с иконками и тенденциями
 */
export function KPICard({
  title,
  value,
  total,
  icon = 'check-circle',
  trend,
}: KPICardProps) {
  /**
   * Получить иконку по типу
   */
  const getIcon = () => {
    const iconClass = 'h-5 w-5 text-muted-foreground'
    switch (icon) {
      case 'check-circle':
        return <CheckCircle2 className={iconClass} />
      case 'trending-up':
        return <TrendingUp className={iconClass} />
      case 'smile':
        return <Smile className={iconClass} />
      case 'calendar':
        return <Calendar className={iconClass} />
      default:
        return <CheckCircle2 className={iconClass} />
    }
  }

  /**
   * Форматировать значение
   */
  const formatValue = () => {
    if (typeof value === 'number' && total !== undefined) {
      return `${value} / ${total}`
    }
    return value
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {getIcon()}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue()}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">
            <span className={trend.value >= 0 ? 'text-green-600' : 'text-red-600'}>
              {trend.value >= 0 ? '+' : ''}{trend.value}%
            </span>{' '}
            {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

