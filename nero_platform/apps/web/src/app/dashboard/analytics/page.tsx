'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { KPICard } from '@/components/analytics/KPICard'
import { analyticsApi, childrenApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

interface AnalyticsStats {
  completedAssignments: number
  totalAssignments: number
  completionRate: number
  averageDuration: number
  moodDistribution: {
    good: number
    neutral: number
    difficult: number
  }
  recentActivity: Array<{
    date: string
    assignmentsCompleted: number
  }>
}

interface Child {
  id: string
  firstName: string
  lastName: string
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string>('')
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState('30') // days

  useEffect(() => {
    loadChildren()
  }, [])

  useEffect(() => {
    if (selectedChildId) {
      loadAnalytics()
    }
  }, [selectedChildId, period])

  const loadChildren = async () => {
    try {
      const response = await childrenApi.getChildren()
      if (response.success) {
        const raw = response.data as any
        const list = Array.isArray(raw) ? raw : raw?.items ?? []
        setChildren(list)

        // Auto-select first child
        if (list.length > 0) {
          setSelectedChildId(list[0].id)
        }
      }
    } catch (err: any) {
      console.error('Ошибка загрузки детей:', err)
    }
  }

  const loadAnalytics = async () => {
    if (!selectedChildId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await analyticsApi.getChildStats(selectedChildId, {
        period: parseInt(period),
      })

      if (response.success) {
        setStats(response.data as AnalyticsStats)
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Не удалось загрузить аналитику')
    } finally {
      setIsLoading(false)
    }
  }

  const getMoodLabel = () => {
    if (!stats) return 'Нет данных'

    const { good, neutral, difficult } = stats.moodDistribution || { good: 0, neutral: 0, difficult: 0 }

    if (good > neutral && good > difficult) return 'Хорошее 😊'
    if (difficult > good && difficult > neutral) return 'Сложное 😔'
    return 'Нейтральное 😐'
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'specialist', 'supervisor', 'parent']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Аналитика</h1>
            <p className="text-neutral-600 mt-1">
              Подробная статистика прогресса и активности
            </p>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Фильтры</CardTitle>
              <CardDescription>Выберите ребенка и период для анализа</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="child">Ребенок</Label>
                  <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                    <SelectTrigger id="child">
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period">Период</Label>
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger id="period">
                      <SelectValue placeholder="Выберите период" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Последние 7 дней</SelectItem>
                      <SelectItem value="30">Последние 30 дней</SelectItem>
                      <SelectItem value="90">Последние 3 месяца</SelectItem>
                      <SelectItem value="365">Последний год</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Analytics Content */}
          {!isLoading && !error && stats && (
            <div className="space-y-6" data-testid="children-overview">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                  title="Выполнено заданий"
                  value={stats.completedAssignments || 0}
                  total={stats.totalAssignments || 0}
                  icon="check-circle"
                  testId="analytics-kpi-completed"
                />
                <KPICard
                  title="Процент выполнения"
                  value={`${Math.round(stats.completionRate || 0)}%`}
                  icon="trending-up"
                  testId="analytics-kpi-rate"
                />
                <KPICard
                  title="Среднее настроение"
                  value={getMoodLabel()}
                  icon="smile"
                  testId="analytics-kpi-mood"
                />
                <KPICard
                  title="Средняя длительность"
                  value={`${Math.round(stats.averageDuration || 0)} мин`}
                  icon="calendar"
                  testId="analytics-kpi-duration"
                />
              </div>

              {/* Details Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mood Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Распределение настроения</CardTitle>
                    <CardDescription>За выбранный период</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">😊</span>
                          <span className="text-sm font-medium">Хорошее</span>
                        </div>
                        <span className="text-2xl font-bold">
                          {stats.moodDistribution?.good || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">😐</span>
                          <span className="text-sm font-medium">Нейтральное</span>
                        </div>
                        <span className="text-2xl font-bold">
                          {stats.moodDistribution?.neutral || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">😔</span>
                          <span className="text-sm font-medium">Сложное</span>
                        </div>
                        <span className="text-2xl font-bold">
                          {stats.moodDistribution?.difficult || 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card data-testid="top-performers">
                  <CardHeader>
                    <CardTitle>Недавняя активность</CardTitle>
                    <CardDescription>Последние дни</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats.recentActivity && stats.recentActivity.length > 0 ? (
                      <div className="space-y-3">
                        {stats.recentActivity.slice(0, 7).map((activity, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">
                              {new Date(activity.date).toLocaleDateString('ru-RU')}
                            </span>
                            <span className="text-sm font-medium">
                              {activity.assignmentsCompleted} заданий
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Нет данных об активности</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Info Alert */}
              <Alert>
                <AlertDescription>
                  <strong>Совет:</strong> Регулярно проверяйте аналитику для отслеживания прогресса
                  и корректировки программы занятий.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* No child selected */}
          {!isLoading && !error && !stats && children.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <h3 className="text-xl font-semibold mb-2">Нет данных</h3>
                <p className="text-neutral-600">
                  В системе пока нет детей для отображения аналитики
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
