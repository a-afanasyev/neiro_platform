'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { notificationsApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Bell, Check, X } from 'lucide-react'

interface Notification {
  id: string
  userId: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  relatedEntityType?: string
  relatedEntityId?: string
}

interface NotificationSettings {
  email: boolean
  push: boolean
  assignments: boolean
  reports: boolean
  progress: boolean
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [settings, setSettings] = useState<NotificationSettings>({
    email: true,
    push: true,
    assignments: true,
    reports: true,
    progress: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await notificationsApi.getNotifications()
      if (response.success) {
        const raw = response.data as any
        const list = Array.isArray(raw) ? raw : raw?.items ?? []
        setNotifications(list)
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Не удалось загрузить уведомления')
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId)
      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      ))
    } catch (err: any) {
      console.error('Ошибка пометки как прочитанное:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications.filter(n => !n.isRead).map(n => notificationsApi.markAsRead(n.id))
      )
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
    } catch (err: any) {
      console.error('Ошибка пометки всех как прочитанные:', err)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationsApi.deleteNotification(notificationId)
      setNotifications(notifications.filter(n => n.id !== notificationId))
    } catch (err: any) {
      console.error('Ошибка удаления уведомления:', err)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'default'
      case 'warning':
        return 'secondary'
      case 'error':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <ProtectedRoute allowedRoles={['admin', 'specialist', 'supervisor', 'parent']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Уведомления</h1>
              <p className="text-neutral-600 mt-1">
                Важные события и обновления
              </p>
              {unreadCount > 0 && (
                <Badge variant="default" className="mt-2">
                  {unreadCount} непрочитанных
                </Badge>
              )}
            </div>
            {notifications.length > 0 && (
              <Button onClick={markAllAsRead} variant="outline" disabled={unreadCount === 0}>
                Отметить все как прочитанные
              </Button>
            )}
          </div>

          {/* Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle>Настройки уведомлений</CardTitle>
              <CardDescription>
                Управление способами получения уведомлений
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications" className="cursor-pointer">
                  Email уведомления
                </Label>
                <Switch
                  id="email-notifications"
                  checked={settings.email}
                  onCheckedChange={(checked) => setSettings({ ...settings, email: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications" className="cursor-pointer">
                  Push уведомления
                </Label>
                <Switch
                  id="push-notifications"
                  checked={settings.push}
                  onCheckedChange={(checked) => setSettings({ ...settings, push: checked })}
                />
              </div>
              <div className="border-t pt-4 mt-4">
                <p className="text-sm font-medium mb-3">Уведомлять о:</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="assignments-toggle" className="cursor-pointer" data-testid="assignments-toggle-label">
                      Новых назначениях
                    </Label>
                    <Switch
                      id="assignments-toggle"
                      data-testid="assignments-toggle"
                      checked={settings.assignments}
                      onCheckedChange={(checked) => setSettings({ ...settings, assignments: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reports-toggle" className="cursor-pointer">
                      Отчетах родителей
                    </Label>
                    <Switch
                      id="reports-toggle"
                      checked={settings.reports}
                      onCheckedChange={(checked) => setSettings({ ...settings, reports: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="progress-toggle" className="cursor-pointer">
                      Прогрессе детей
                    </Label>
                    <Switch
                      id="progress-toggle"
                      checked={settings.progress}
                      onCheckedChange={(checked) => setSettings({ ...settings, progress: checked })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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

          {/* Notifications List */}
          {!isLoading && !error && (
            <>
              {notifications.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Нет уведомлений</h3>
                    <p className="text-neutral-600">
                      У вас пока нет никаких уведомлений
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`transition-all ${!notification.isRead ? 'border-primary bg-primary-50' : ''}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-base">{notification.title}</CardTitle>
                              {!notification.isRead && (
                                <Badge variant="default" className="text-xs">Новое</Badge>
                              )}
                              <Badge variant={getTypeColor(notification.type)} className="text-xs">
                                {notification.type}
                              </Badge>
                            </div>
                            <CardDescription className="text-sm">
                              {format(new Date(notification.createdAt), 'd MMMM yyyy, HH:mm', { locale: ru })}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            {!notification.isRead && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(notification.id)}
                                title="Отметить как прочитанное"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteNotification(notification.id)}
                              title="Удалить"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-neutral-700">{notification.message}</p>
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
