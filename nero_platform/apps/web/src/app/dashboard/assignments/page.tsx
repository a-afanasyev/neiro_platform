'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { assignmentsApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

interface Assignment {
  id: string
  title: string
  description?: string
  status: string
  scheduledFor: string
  durationMinutes: number
  location?: string
  isHomework: boolean
  child?: {
    firstName: string
    lastName: string
  }
  specialist?: {
    firstName: string
    lastName: string
  }
  exercise?: {
    title: string
  }
}

const statusLabels: Record<string, string> = {
  scheduled: 'Запланировано',
  in_progress: 'В процессе',
  completed: 'Завершено',
  cancelled: 'Отменено',
  skipped: 'Пропущено',
  overdue: 'Просрочено',
}

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  scheduled: 'default',
  in_progress: 'secondary',
  completed: 'outline',
  cancelled: 'destructive',
  skipped: 'outline',
  overdue: 'destructive',
}

export default function AssignmentsPage() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    loadAssignments()
  }, [selectedDate])

  const loadAssignments = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const startDate = new Date(selectedDate)
      startDate.setDate(startDate.getDate() - 7)
      const endDate = new Date(selectedDate)
      endDate.setDate(endDate.getDate() + 7)

      const response = await assignmentsApi.getCalendar({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      })

      if (response.success) {
        setAssignments(response.data.items || [])
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Не удалось загрузить назначения')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('ru-RU'),
      time: date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    }
  }

  const groupedAssignments = assignments.reduce(
    (acc, assignment) => {
      const dateKey = formatDateTime(assignment.scheduledFor).date
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(assignment)
      return acc
    },
    {} as Record<string, Assignment[]>
  )

  return (
    <ProtectedRoute allowedRoles={['admin', 'specialist', 'supervisor', 'parent']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Календарь назначений</h1>
              <p className="text-neutral-600 mt-1">
                Расписание занятий и домашних заданий
              </p>
            </div>
            <Button>+ Создать назначение</Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-neutral-600">Загрузка...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Assignments List */}
          {!isLoading && !error && (
            <>
              {Object.keys(groupedAssignments).length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="text-6xl mb-4">📅</div>
                    <h3 className="text-xl font-semibold mb-2">Нет назначений</h3>
                    <p className="text-neutral-600 mb-4">
                      На выбранный период нет запланированных занятий
                    </p>
                    <Button>Создать назначение</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedAssignments)
                    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                    .map(([date, dayAssignments]) => (
                      <div key={date}>
                        <h3 className="text-lg font-semibold mb-3">{date}</h3>
                        <div className="space-y-3">
                          {dayAssignments.map((assignment) => {
                            const { time } = formatDateTime(assignment.scheduledFor)
                            return (
                              <Card key={assignment.id}>
                                <CardContent className="pt-6">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm font-medium text-primary">
                                          {time}
                                        </span>
                                        <h4 className="font-semibold">{assignment.title}</h4>
                                        <Badge variant={statusColors[assignment.status]}>
                                          {statusLabels[assignment.status]}
                                        </Badge>
                                        {assignment.isHomework && (
                                          <Badge variant="outline">🏠 Домашнее</Badge>
                                        )}
                                      </div>
                                      {assignment.description && (
                                        <p className="text-sm text-neutral-600 mb-2">
                                          {assignment.description}
                                        </p>
                                      )}
                                      <div className="flex flex-wrap gap-3 text-sm text-neutral-600">
                                        {assignment.child && (
                                          <span>
                                            Ребенок: {assignment.child.firstName}{' '}
                                            {assignment.child.lastName}
                                          </span>
                                        )}
                                        {assignment.specialist && (
                                          <span>
                                            Специалист: {assignment.specialist.firstName}{' '}
                                            {assignment.specialist.lastName}
                                          </span>
                                        )}
                                        {assignment.location && (
                                          <span>Место: {assignment.location}</span>
                                        )}
                                        <span>Длительность: {assignment.durationMinutes} мин</span>
                                      </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                      {assignment.status === 'scheduled' && (
                                        <>
                                          <Button size="sm" variant="outline">
                                            Начать
                                          </Button>
                                          <Button size="sm" variant="outline">
                                            Отменить
                                          </Button>
                                        </>
                                      )}
                                      {assignment.status === 'in_progress' && (
                                        <Button size="sm">Завершить</Button>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

