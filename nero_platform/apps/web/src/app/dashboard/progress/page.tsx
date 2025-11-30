'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProgressHeader } from '@/components/analytics/ProgressHeader'
import { KPICard } from '@/components/analytics/KPICard'
import { LineChart } from '@/components/analytics/LineChart'
import { PieChart } from '@/components/analytics/PieChart'
import { analyticsApi } from '@/lib/api'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

/**
 * Страница прогресса ребенка
 * 
 * Отображает:
 * - KPI карточки с основными метриками
 * - График выполнения заданий (линейный)
 * - Распределение настроения (круговая диаграмма)
 */
export default function ProgressPage() {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [days, setDays] = useState(30)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Загрузить статистику при изменении ребенка или диапазона дней
   */
  useEffect(() => {
    if (selectedChildId) {
      loadStats()
    }
  }, [selectedChildId, days])

  /**
   * Загрузить статистику ребенка
   */
  const loadStats = async () => {
    if (!selectedChildId) return

    setLoading(true)
    setError(null)

    try {
      const response = await analyticsApi.getChildStats(selectedChildId, days)
      setStats(response.data)
    } catch (err: any) {
      console.error('Error loading stats:', err)
      setError(
        err.response?.data?.error?.message ||
        err.message ||
        'Ошибка загрузки статистики'
      )
    } finally {
      setLoading(false)
    }
  }

  /**
   * Подготовить данные для линейного графика
   */
  const prepareTimelineData = () => {
    if (!stats?.recentActivity) return []

    return stats.recentActivity.map((activity: any) => ({
      date: activity.date,
      value: activity.assignmentsCompleted,
      label: `Выполнено заданий: ${activity.assignmentsCompleted}`,
    }))
  }

  /**
   * Подготовить данные для круговой диаграммы настроения
   */
  const prepareMoodData = () => {
    if (!stats?.moodDistribution) return []

    return [
      {
        name: 'Хорошее',
        value: stats.moodDistribution.good || 0,
        color: '#10b981',
      },
      {
        name: 'Нейтральное',
        value: stats.moodDistribution.neutral || 0,
        color: '#f59e0b',
      },
      {
        name: 'Сложное',
        value: stats.moodDistribution.difficult || 0,
        color: '#ef4444',
      },
    ].filter((item) => item.value > 0)
  }

  // Если ребенок не выбран, показываем заголовок
  if (!selectedChildId) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="container mx-auto py-6">
            <ProgressHeader
              selectedChildId={selectedChildId}
              onChildChange={setSelectedChildId}
              days={days}
              onDaysChange={setDays}
              loading={loading}
            />
            <div className="text-center py-12 text-muted-foreground">
              <p>Выберите ребенка для просмотра статистики</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <ProgressHeader
            selectedChildId={selectedChildId}
            onChildChange={setSelectedChildId}
            days={days}
            onDaysChange={setDays}
            loading={loading}
          />

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
              <Button
                variant="outline"
                size="sm"
                onClick={loadStats}
                className="mt-2"
              >
                Повторить попытку
              </Button>
            </Alert>
          )}

          {loading && !stats ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : stats ? (
            <div className="space-y-6">
              {/* KPI карточки */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                  title="Выполнено заданий"
                  value={stats.completedAssignments || 0}
                  total={stats.totalAssignments || 0}
                  icon="check-circle"
                />
                <KPICard
                  title="Общий прогресс"
                  value={`${stats.completionRate || 0}%`}
                  icon="trending-up"
                />
                <KPICard
                  title="Среднее настроение"
                  value={
                    stats.moodDistribution?.good > stats.moodDistribution?.difficult
                      ? 'Хорошее'
                      : stats.moodDistribution?.difficult > stats.moodDistribution?.good
                      ? 'Сложное'
                      : 'Нейтральное'
                  }
                  icon="smile"
                />
                <KPICard
                  title="Активных дней"
                  value={
                    stats.recentActivity?.filter((a: any) => a.assignmentsCompleted > 0).length || 0
                  }
                  icon="calendar"
                />
              </div>

              {/* Графики */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <LineChart
                    data={prepareTimelineData()}
                    title="Прогресс выполнения"
                    color="#3b82f6"
                    unit="заданий"
                  />
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <PieChart
                    data={prepareMoodData()}
                    title="Распределение настроения"
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

