'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { templatesApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

interface Template {
  id: string
  title: string
  slug: string
  description?: string
  targetAudience?: string
  ageMin: number
  ageMax: number
  durationWeeks?: number
  status: string
  tags?: string[]
  createdAt: string
}

const statusLabels: Record<string, string> = {
  draft: 'Черновик',
  published: 'Опубликован',
  archived: 'Архивный',
}

const statusColors: Record<string, 'default' | 'secondary' | 'outline'> = {
  draft: 'outline',
  published: 'default',
  archived: 'secondary',
}

export default function TemplatesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await templatesApi.getTemplates()
      if (response.success) {
        setTemplates(response.data.items)
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Не удалось загрузить шаблоны')
    } finally {
      setIsLoading(false)
    }
  }

  const canManageTemplates = user?.role === 'admin' || user?.role === 'specialist'

  return (
    <ProtectedRoute allowedRoles={['admin', 'specialist']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Шаблоны маршрутов</h1>
              <p className="text-neutral-600 mt-1">
                Готовые шаблоны коррекционных программ
              </p>
            </div>

            {canManageTemplates && (
              <Button onClick={() => router.push('/dashboard/templates/new')}>
                + Создать шаблон
              </Button>
            )}
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

          {/* Templates List */}
          {!isLoading && !error && (
            <>
              {templates.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold mb-2">Нет шаблонов</h3>
                    <p className="text-neutral-600 mb-4">
                      В системе пока нет шаблонов маршрутов
                    </p>
                    {canManageTemplates && (
                      <Button onClick={() => router.push('/dashboard/templates/new')}>
                        Создать первый шаблон
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <Card
                      key={template.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(`/dashboard/templates/${template.id}`)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-xl">{template.title}</CardTitle>
                              <Badge variant={statusColors[template.status]}>
                                {statusLabels[template.status]}
                              </Badge>
                            </div>
                            {template.description && (
                              <CardDescription className="mb-3">
                                {template.description}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {template.targetAudience && (
                          <p className="text-sm text-neutral-600 mb-3">
                            <span className="font-medium">Целевая аудитория:</span>{' '}
                            {template.targetAudience}
                          </p>
                        )}
                        <div className="space-y-1 text-sm text-neutral-600 mb-3">
                          <p>
                            <span className="font-medium">Возраст:</span> {template.ageMin}-
                            {template.ageMax} лет
                          </p>
                          {template.durationWeeks && (
                            <p>
                              <span className="font-medium">Длительность:</span>{' '}
                              {template.durationWeeks} недель
                            </p>
                          )}
                        </div>
                        {template.tags && template.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {template.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {template.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{template.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
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

