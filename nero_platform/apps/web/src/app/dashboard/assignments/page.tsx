'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CreateAssignmentDialog } from '@/components/assignments/CreateAssignmentDialog'
import { assignmentsApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

interface Assignment {
  id: string
  title?: string
  notes?: string
  status: string
  plannedStartDate: string
  dueDate: string
  expectedDurationMinutes: number
  deliveryChannel?: string
  childId: string
  exerciseId: string
  specialistId: string
  routeId: string
  phaseId: string
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
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [actionAssignmentId, setActionAssignmentId] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

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
        // Calendar endpoint возвращает массив назначений в поле data,
        // но для совместимости поддерживаем data.items.
        const raw = response.data as any
        const list = Array.isArray(raw) ? raw : raw?.items ?? []
        setAssignments(list)
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Не удалось загрузить назначения')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Начать выполнение назначения (изменить статус на in_progress)
   */
  const handleStart = async (assignmentId: string) => {
    setIsActionLoading(true)
    setActionAssignmentId(assignmentId)
    try {
      await assignmentsApi.updateAssignment(assignmentId, { status: 'in_progress' })
      await loadAssignments()
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Не удалось начать назначение')
    } finally {
      setIsActionLoading(false)
      setActionAssignmentId(null)
    }
  }

  /**
   * Завершить назначение
   */
  const handleComplete = async (assignmentId: string) => {
    const notes = prompt('Добавить комментарий о выполнении (необязательно):')
    
    setIsActionLoading(true)
    setActionAssignmentId(assignmentId)
    try {
      await assignmentsApi.completeAssignment(assignmentId, { notes: notes || undefined })
      await loadAssignments()
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Не удалось завершить назначение')
    } finally {
      setIsActionLoading(false)
      setActionAssignmentId(null)
    }
  }

  /**
   * Отменить назначение
   */
  const handleCancel = async (assignmentId: string) => {
    const reason = prompt('Укажите причину отмены:')
    
    if (!reason) {
      return
    }
    
    setIsActionLoading(true)
    setActionAssignmentId(assignmentId)
    try {
      await assignmentsApi.cancelAssignment(assignmentId, reason)
      await loadAssignments()
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Не удалось отменить назначение')
    } finally {
      setIsActionLoading(false)
      setActionAssignmentId(null)
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
      const dateKey = formatDateTime(assignment.plannedStartDate).date
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
              <h1 className="text-3xl font-bold text-neutral-900">Задания</h1>
              <p className="text-neutral-600 mt-1">
                Расписание занятий и домашних заданий
              </p>
              {!isLoading && assignments.length > 0 && (
                <div className="mt-2 text-sm text-neutral-600" data-testid="progress-indicator">
                  Выполнено: {assignments.filter(a => a.status === 'completed').length} из {assignments.length}
                </div>
              )}
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              + Создать назначение
            </Button>
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
                    <Button onClick={() => setShowCreateDialog(true)}>
                      Создать назначение
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6" data-testid="assignments-list">
                  {Object.entries(groupedAssignments)
                    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                    .map(([date, dayAssignments]) => (
                      <div key={date}>
                        <h3 className="text-lg font-semibold mb-3">{date}</h3>
                        <div className="space-y-3">
                          {dayAssignments.map((assignment, index) => {
                            const { time } = formatDateTime(assignment.plannedStartDate)
                            return (
                              <Card key={assignment.id} data-testid="assignment-card">
                                <CardContent className="pt-6">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm font-medium text-primary">
                                          {time}
                                        </span>
                                        <h4 className="font-semibold">{assignment.title || assignment.exercise?.title || 'Назначение'}</h4>
                                        <Badge variant={statusColors[assignment.status]} data-testid={`assignment-status-${index}`}>
                                          {statusLabels[assignment.status]}
                                        </Badge>
                                        {assignment.deliveryChannel === 'home' && (
                                          <Badge variant="outline">🏠 Домашнее</Badge>
                                        )}
                                      </div>
                                      {assignment.notes && (
                                        <p className="text-sm text-neutral-600 mb-2">
                                          {assignment.notes}
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
                                        {assignment.deliveryChannel && (
                                          <span>Канал: {assignment.deliveryChannel}</span>
                                        )}
                                        <span>Длительность: {assignment.expectedDurationMinutes} мин</span>
                                      </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                      {assignment.status === 'scheduled' && (
                                        <>
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => handleStart(assignment.id)}
                                            disabled={isActionLoading && actionAssignmentId === assignment.id}
                                          >
                                            {isActionLoading && actionAssignmentId === assignment.id ? 'Начинаем...' : 'Начать'}
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => handleCancel(assignment.id)}
                                            disabled={isActionLoading && actionAssignmentId === assignment.id}
                                          >
                                            Отменить
                                          </Button>
                                        </>
                                      )}
                                      {assignment.status === 'in_progress' && (
                                        <Button
                                          size="sm"
                                          onClick={() => handleComplete(assignment.id)}
                                          disabled={isActionLoading && actionAssignmentId === assignment.id}
                                          data-testid={`complete-assignment-${index}`}
                                        >
                                          {isActionLoading && actionAssignmentId === assignment.id ? 'Завершаем...' : 'Завершить'}
                                        </Button>
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

        {/* Create Assignment Dialog */}
        <CreateAssignmentDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={loadAssignments}
        />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

