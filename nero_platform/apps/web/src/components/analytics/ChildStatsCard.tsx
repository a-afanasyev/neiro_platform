'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { analyticsApi } from '@/lib/api'
import { DownloadIcon, Loader2Icon } from 'lucide-react'

interface ChildStatsCardProps {
  /** ID ребенка */
  childId: string
  /** Имя ребенка */
  childName: string
  /** Количество дней для статистики */
  days?: number
  /** Показать кнопку скачивания PDF */
  showPdfDownload?: boolean
}

/**
 * Компонент карточки статистики ребенка
 *
 * Отображает:
 * - Общую статистику (задания, выполнение, процент)
 * - Настроение ребенка
 * - Динамику прогресса
 * - Кнопку скачивания PDF отчета
 */
export function ChildStatsCard({
  childId,
  childName,
  days = 30,
  showPdfDownload = true,
}: ChildStatsCardProps) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  /**
   * Загрузить статистику
   */
  useEffect(() => {
    loadStats()
  }, [childId, days])

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await analyticsApi.getChildStats(childId, days)
      setStats(response.data)
    } catch (err: any) {
      console.error('Error loading child stats:', err)
      setError(err.response?.data?.error?.message || err.message || 'Ошибка загрузки статистики')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Скачать PDF отчет
   */
  const downloadPdf = async () => {
    try {
      setDownloadingPdf(true)
      setError(null)

      const blob = await analyticsApi.generateChildReportPDF(childId, days)

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `child-report-${childId}-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      console.error('Error downloading PDF:', err)
      setError(err.response?.data?.error?.message || err.message || 'Ошибка скачивания PDF')
    } finally {
      setDownloadingPdf(false)
    }
  }

  /**
   * Получить emoji для динамики прогресса
   */
  const getProgressTrendEmoji = (trend: string) => {
    switch (trend) {
      case 'improving':
        return '📈'
      case 'stable':
        return '➡️'
      case 'declining':
        return '📉'
      default:
        return '❓'
    }
  }

  /**
   * Получить текст для динамики прогресса
   */
  const getProgressTrendLabel = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'Улучшение'
      case 'stable':
        return 'Стабильно'
      case 'declining':
        return 'Требует внимания'
      case 'insufficient_data':
        return 'Недостаточно данных'
      default:
        return trend
    }
  }

  /**
   * Получить цвет для динамики прогресса
   */
  const getProgressTrendVariant = (trend: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (trend) {
      case 'improving':
        return 'default'
      case 'stable':
        return 'secondary'
      case 'declining':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{childName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{childName}</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={loadStats} variant="outline" className="mt-4">
            Повторить попытку
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{childName}</CardTitle>
            <CardDescription>Статистика за {days} дней</CardDescription>
          </div>
          <Badge variant={getProgressTrendVariant(stats.progressTrend)}>
            {getProgressTrendEmoji(stats.progressTrend)} {getProgressTrendLabel(stats.progressTrend)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Общая статистика */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalAssignments}</div>
            <div className="text-sm text-muted-foreground">Всего заданий</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.completedAssignments}</div>
            <div className="text-sm text-muted-foreground">Выполнено</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.completionRate}%</div>
            <div className="text-sm text-muted-foreground">Процент выполнения</div>
          </div>
        </div>

        {/* Дополнительная статистика */}
        <div className="grid grid-cols-2 gap-4 border-t pt-4">
          <div>
            <div className="text-sm font-medium mb-1">Отчетов отправлено</div>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
          </div>
          <div>
            <div className="text-sm font-medium mb-1">Средняя длительность</div>
            <div className="text-2xl font-bold">{stats.averageDuration} мин</div>
          </div>
        </div>

        {/* Настроение */}
        <div className="border-t pt-4">
          <div className="text-sm font-medium mb-3">Настроение ребенка</div>
          <div className="flex items-center justify-around">
            <div className="text-center">
              <div className="text-3xl mb-1">😊</div>
              <div className="text-lg font-semibold">{stats.moodDistribution.good}</div>
              <div className="text-xs text-muted-foreground">Хорошее</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">😐</div>
              <div className="text-lg font-semibold">{stats.moodDistribution.neutral}</div>
              <div className="text-xs text-muted-foreground">Нейтральное</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">😔</div>
              <div className="text-lg font-semibold">{stats.moodDistribution.difficult}</div>
              <div className="text-xs text-muted-foreground">Сложное</div>
            </div>
          </div>
        </div>
      </CardContent>

      {showPdfDownload && (
        <CardFooter className="border-t">
          <Button
            onClick={downloadPdf}
            disabled={downloadingPdf}
            variant="outline"
            className="w-full"
          >
            {downloadingPdf ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Генерация PDF...
              </>
            ) : (
              <>
                <DownloadIcon className="mr-2 h-4 w-4" />
                Скачать PDF отчет
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
