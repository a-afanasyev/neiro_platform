'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { diagnosticsApi, childrenApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface DiagnosticSession {
  id: string
  childId: string
  questionnaireCode: string
  status: string
  createdAt: string
  completedAt?: string
  child?: {
    firstName: string
    lastName: string
  }
}

interface Questionnaire {
  code: string
  name: string
  description: string
  ageMin?: number
  ageMax?: number
}

export default function DiagnosticsPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<DiagnosticSession[]>([])
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [children, setChildren] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedChild, setSelectedChild] = useState<string>('')
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<string>('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [sessionsRes, questionnairesRes, childrenRes] = await Promise.all([
        diagnosticsApi.getSessions(),
        diagnosticsApi.getQuestionnaires(),
        childrenApi.getChildren(),
      ])

      if (sessionsRes.success) {
        setSessions(sessionsRes.data.items)
      }

      if (questionnairesRes.success) {
        setQuestionnaires(questionnairesRes.data)
      }

      if (childrenRes.success) {
        setChildren(childrenRes.data.items)
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Не удалось загрузить данные')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateSession = async () => {
    if (!selectedChild || !selectedQuestionnaire) {
      setError('Пожалуйста, выберите ребенка и опросник')
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const response = await diagnosticsApi.createSession({
        childId: selectedChild,
        questionnaireCode: selectedQuestionnaire,
      })

      if (response.success) {
        await loadData()
        setIsDialogOpen(false)
        setSelectedChild('')
        setSelectedQuestionnaire('')
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Не удалось создать сессию')
    } finally {
      setIsCreating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-warning-100 text-warning-800',
      IN_PROGRESS: 'bg-primary-100 text-primary-800',
      COMPLETED: 'bg-success-100 text-success-800',
    }

    const labels = {
      PENDING: 'Ожидает',
      IN_PROGRESS: 'В процессе',
      COMPLETED: 'Завершена',
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-neutral-100 text-neutral-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'specialist', 'supervisor']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Диагностика</h1>
              <p className="text-neutral-600 mt-1">
                Управление диагностическими сессиями и опросниками
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>+ Новая диагностика</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Создать диагностическую сессию</DialogTitle>
                  <DialogDescription>
                    Выберите ребенка и опросник для диагностики
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label>Ребенок</Label>
                    <select
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={selectedChild}
                      onChange={(e) => setSelectedChild(e.target.value)}
                    >
                      <option value="">Выберите ребенка</option>
                      {children.map((child) => (
                        <option key={child.id} value={child.id}>
                          {child.firstName} {child.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Опросник</Label>
                    <select
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={selectedQuestionnaire}
                      onChange={(e) => setSelectedQuestionnaire(e.target.value)}
                    >
                      <option value="">Выберите опросник</option>
                      {questionnaires.map((q) => (
                        <option key={q.code} value={q.code}>
                          {q.name} - {q.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button onClick={handleCreateSession} disabled={isCreating}>
                    {isCreating ? 'Создание...' : 'Создать'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Available Questionnaires */}
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              Доступные опросники
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {questionnaires.map((q) => (
                <Card key={q.code}>
                  <CardHeader>
                    <CardTitle className="text-lg">{q.name}</CardTitle>
                    <CardDescription>{q.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-neutral-600">
                      {q.ageMin && q.ageMax && (
                        <p>Возраст: {q.ageMin}-{q.ageMax} лет</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sessions List */}
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              Диагностические сессии
            </h2>

            {isLoading && (
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-neutral-600">Загрузка...</p>
                </div>
              </div>
            )}

            {!isLoading && sessions.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold mb-2">Нет диагностических сессий</h3>
                  <p className="text-neutral-600 mb-4">
                    Создайте первую диагностическую сессию
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    Создать сессию
                  </Button>
                </CardContent>
              </Card>
            )}

            {!isLoading && sessions.length > 0 && (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <Card key={session.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {session.questionnaireCode}
                              </h3>
                              <p className="text-sm text-neutral-600">
                                {session.child?.firstName} {session.child?.lastName}
                              </p>
                              <p className="text-xs text-neutral-500 mt-1">
                                Создано: {formatDate(session.createdAt)}
                                {session.completedAt && ` • Завершено: ${formatDate(session.completedAt)}`}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          {getStatusBadge(session.status)}
                          <div className="flex space-x-2">
                            {session.status === 'COMPLETED' ? (
                              <Button variant="outline" size="sm">
                                Просмотр результатов
                              </Button>
                            ) : (
                              <Button size="sm">
                                Продолжить
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

