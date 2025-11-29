'use client'

import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

/**
 * Пропсы компонента PieChart
 */
interface PieChartProps {
  /** Данные для графика */
  data: Array<{
    name: string
    value: number
    color?: string
  }>
  /** Название графика */
  title?: string
}

/**
 * Цвета по умолчанию для сегментов
 */
const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

/**
 * Компонент круговой диаграммы для отображения распределения
 * 
 * Использует библиотеку Recharts для визуализации данных
 */
export function PieChart({
  data,
  title,
}: PieChartProps) {
  /**
   * Получить цвет для сегмента
   */
  const getColor = (index: number, itemColor?: string) => {
    return itemColor || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
  }

  /**
   * Форматировать значение для tooltip
   */
  const formatTooltip = (value: number, total: number) => {
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
    return `${value} (${percentage}%)`
  }

  // Если данных нет, показываем пустое состояние
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>Недостаточно данных для отображения</p>
      </div>
    )
  }

  // Вычислить общее значение для процентов
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="w-full" data-testid="pie-chart">
      {title && (
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getColor(index, entry.color)}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatTooltip(value, total)}
          />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}

