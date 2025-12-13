'use client'

import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

/**
 * Пропсы компонента LineChart
 */
interface LineChartProps {
  /** Данные для графика */
  data: Array<{
    date: string
    value: number
    label?: string
  }>
  /** Название графика */
  title?: string
  /** Цвет линии */
  color?: string
  /** Единица измерения */
  unit?: string
}

/**
 * Компонент линейного графика для отображения прогресса
 * 
 * Использует библиотеку Recharts для визуализации данных
 */
export function LineChart({
  data,
  title,
  color = '#3b82f6',
  unit = '',
}: LineChartProps) {
  /**
   * Форматировать дату для отображения
   */
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
    } catch {
      return dateString
    }
  }

  /**
   * Форматировать значение для tooltip
   */
  const formatTooltip = (value: number) => {
    return `${value}${unit ? ` ${unit}` : ''}`
  }

  // Если данных нет, показываем пустое состояние
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground" data-testid="line-chart">
        <p>Недостаточно данных для отображения</p>
      </div>
    )
  }

  return (
    <div className="w-full" data-testid="line-chart">
      {title && (
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            style={{ fontSize: '12px' }}
          />
          <YAxis style={{ fontSize: '12px' }} />
          <Tooltip
            formatter={(value: number) => formatTooltip(value)}
            labelFormatter={(label) => `Дата: ${formatDate(label)}`}
            wrapperStyle={{ zIndex: 1000 }}
            content={({ active, payload, label }) => {
              if (!active || !payload || !payload.length) return null
              return (
                <div
                  data-testid="chart-tooltip"
                  className="bg-white p-3 border border-gray-200 rounded shadow-lg"
                >
                  <p className="text-sm font-semibold mb-1">
                    Дата: {formatDate(label)}
                  </p>
                  <p className="text-sm text-blue-600">
                    {formatTooltip(payload[0].value as number)}
                  </p>
                </div>
              )
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={(props: any) => {
              const { cx, cy, index } = props
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill={color}
                  data-testid={`line-chart-point-${index}`}
                />
              )
            }}
            activeDot={{ r: 6 }}
            name={title || 'Значение'}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}

