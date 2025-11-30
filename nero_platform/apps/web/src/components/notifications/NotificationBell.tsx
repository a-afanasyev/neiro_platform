'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { notificationsApi } from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

interface Notification {
  id: string
  type: 'assignment' | 'report_reviewed' | 'message' | 'system'
  title: string
  body: string
  actionUrl?: string
  isRead: boolean
  createdAt: string
}

/**
 * Компонент NotificationBell
 *
 * Отображает иконку уведомлений с счетчиком непрочитанных
 * При клике показывает dropdown с последними уведомлениями
 */
export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  /**
   * Загрузить количество непрочитанных
   */
  const loadUnreadCount = async () => {
    try {
      const response = await notificationsApi.getUnreadCount()
      setUnreadCount(response.data.count)
    } catch (error) {
      console.error('Error loading unread count:', error)
    }
  }

  /**
   * Загрузить последние уведомления
   */
  const loadNotifications = async () => {
    try {
      setLoading(true)
      const response = await notificationsApi.getUserNotifications({
        limit: 3,
        offset: 0,
      })
      setNotifications(response.data)
      setUnreadCount(response.pagination.unreadCount)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Отметить как прочитанное
   */
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId)

      // Обновить локальное состояние
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  /**
   * Отметить все как прочитанные
   */
  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead()

      // Обновить локальное состояние
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  /**
   * Обработка клика на уведомление
   */
  const handleNotificationClick = (notification: Notification) => {
    // Отметить как прочитанное
    if (!notification.isRead) {
      handleMarkAsRead(notification.id)
    }

    // Перейти по ссылке, если есть
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }

    setOpen(false)
  }

  /**
   * Загрузить при первом рендере
   */
  useEffect(() => {
    loadUnreadCount()

    // Обновлять счетчик каждые 30 секунд
    const interval = setInterval(loadUnreadCount, 30000)

    return () => clearInterval(interval)
  }, [])

  /**
   * Загрузить уведомления при открытии dropdown
   */
  useEffect(() => {
    if (open) {
      loadNotifications()
    }
  }, [open])

  /**
   * Получить цвет иконки по типу
   */
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'assignment':
        return 'text-blue-600'
      case 'report_reviewed':
        return 'text-green-600'
      case 'message':
        return 'text-purple-600'
      case 'system':
        return 'text-gray-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" data-testid="notification-bell">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              data-testid="notification-badge"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80" data-testid="notification-dropdown">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Уведомления</span>
          {unreadCount > 0 && (
            <Button variant="link" size="sm" className="h-auto p-0" onClick={handleMarkAllAsRead} data-testid="mark-all-read">
              Отметить все как прочитанные
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">Загрузка...</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Нет уведомлений
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification, index) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start p-3 cursor-pointer notification-item ${
                  !notification.isRead ? 'bg-blue-50 hover:bg-blue-100 unread' : 'read'
                }`}
                onClick={() => handleNotificationClick(notification)}
                data-testid={`notification-item-${index}`}
                data-notification-item="true"
              >
                <div className="flex items-start gap-2 w-full">
                  <div className={`mt-1 ${getTypeColor(notification.type)}`}>
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`font-medium text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>
                        {notification.title}
                      </span>
                      {!notification.isRead && (
                        <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {notification.body}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: ru,
                      })}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-center cursor-pointer">
              <a href="/dashboard/notifications" className="w-full">
                Посмотреть все уведомления
              </a>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
