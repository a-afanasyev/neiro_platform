'use client'

import { useState, useEffect } from 'react'
import { ReportCard } from '@/components/reports/ReportCard'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { reportsApi } from '@/lib/api'
import { childrenApi } from '@/lib/api'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

/**
 * Страница списка отчетов
 * 
 * Отображает:
 * - Список отчетов с фильтрами
 * - Фильтры по ребенку, статусу, статусу проверки
 * - Пагинацию или бесконечную прокрутку
 */
export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [children, setChildren] = useState<Array<{ id: string; firstName: string; lastName: string }>>([])
  const [filters, setFilters] = useState({
    childId: '',
    status: '',
    reviewStatus: 'unreviewed', // По умолчанию показывать непроверенные
  })
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)

  /**
   * Загрузить список детей для фильтра
   */
  useEffect(() => {
    loadChildren()
  }, [])

  /**
   * Загрузить отчеты при изменении фильтров или страницы
   */
  useEffect(() => {
    loadReports(true)
  }, [filters])

  useEffect(() => {
    if (page > 1) {
      loadReports(false)
    }
  }, [page])

  /**
   * Загрузить список детей
   */
  const loadChildren = async () => {
    try {
      const response = await childrenApi.getChildren({ limit: 100 })
      setChildren(response.data || [])
    } catch (error) {
      console.error('Error loading children:', error)
    }
  }

  /**
   * Загрузить список отчетов
   */
  const loadReports = async (reset = false) => {
    if (reset) {
      setLoading(true)
      setPage(1)
    } else {
      setLoadingMore(true)
    }

    setError(null)

    try {
      const params: any = {
        page: reset ? 1 : page,
        limit: 20,
      }

      if (filters.childId) {
        params.childId = filters.childId
      }

      if (filters.status) {
        params.status = filters.status
      }

      if (filters.reviewStatus) {
        params.reviewStatus = filters.reviewStatus === 'unreviewed' ? 'not_reviewed' : filters.reviewStatus
      }

      const response = await reportsApi.getReports(params)

      if (response.success && response.data) {
        if (reset) {
          setReports(response.data)
        } else {
          setReports((prev) => [...prev, ...response.data])
        }

        // Проверяем, есть ли еще данные
        setHasMore(response.data.length === 20)
      }
    } catch (err: any) {
      console.error('Error loading reports:', err)
      setError(
        err.response?.data?.error?.message ||
        err.message ||
        'Ошибка загрузки отчетов'
      )
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  /**
   * Загрузить еще отчетов (пагинация)
   */
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setPage((prev) => prev + 1)
    }
  }

  /**
   * Обработчик изменения фильтров
   */
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1) // Сбрасываем страницу при изменении фильтров
  }

  /**
   * Обработчик просмотра отчета
   */
  const handleViewReport = (reportId: string) => {
    setSelectedReportId(reportId)
    // TODO: Открыть модальное окно или перейти на страницу детального просмотра
  }

  /**
   * Обработчик проверки отчета
   */
  const handleReviewReport = (reportId: string) => {
    // TODO: Открыть диалог проверки отчета
    console.log('Review report:', reportId)
  }

  /**
   * Обработчик удаления отчета
   */
  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот отчет?')) {
      return
    }

    try {
      await reportsApi.deleteReport(reportId)
      toast.success('Отчет удален')
      // Обновляем список отчетов
      setReports((prev) => prev.filter((r) => r.id !== reportId))
    } catch (error: any) {
      console.error('Error deleting report:', error)
      toast.error(
        error.response?.data?.error?.message ||
        'Ошибка при удалении отчета'
      )
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Отчеты</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadReports(true)}
            className="mt-2"
          >
            Повторить попытку
          </Button>
        </Alert>
      )}

      {/* Фильтры */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Select
          value={filters.childId}
          onValueChange={(value) => handleFilterChange('childId', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Все дети" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Все дети</SelectItem>
            {children.map((child) => (
              <SelectItem key={child.id} value={child.id}>
                {child.firstName} {child.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Все статусы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Все статусы</SelectItem>
            <SelectItem value="completed">Завершены</SelectItem>
            <SelectItem value="partial">Частично выполнены</SelectItem>
            <SelectItem value="failed">Не выполнены</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.reviewStatus}
          onValueChange={(value) => handleFilterChange('reviewStatus', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Все отзывы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Все отзывы</SelectItem>
            <SelectItem value="unreviewed">Без отзыва</SelectItem>
            <SelectItem value="approved">Одобрено</SelectItem>
            <SelectItem value="needs_attention">Требует внимания</SelectItem>
            <SelectItem value="rejected">Отклонено</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Список отчетов */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Нет отчетов для отображения</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                showActions={true}
                onReview={() => handleReviewReport(report.id)}
                onDelete={() => handleDeleteReport(report.id)}
              />
            ))}
          </div>

          {/* Кнопка "Загрузить еще" */}
          {hasMore && (
            <div className="text-center mt-6">
              <Button
                onClick={loadMore}
                variant="outline"
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  'Загрузить еще'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

