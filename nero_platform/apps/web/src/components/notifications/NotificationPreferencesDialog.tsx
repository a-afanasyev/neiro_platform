'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { notificationsApi } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

/**
 * Интерфейс настроек уведомлений
 */
interface NotificationPreferences {
  emailEnabled: boolean
  inAppEnabled: boolean
  assignmentReminders: boolean
  reportUpdates: boolean
  routeChanges: boolean
}

/**
 * Интерфейс тихих часов
 */
interface QuietHours {
  enabled: boolean
  startTime: string
  endTime: string
}

/**
 * Пропсы компонента NotificationPreferencesDialog
 */
interface NotificationPreferencesDialogProps {
  /** Открыт ли диалог */
  open: boolean
  /** Callback при изменении состояния открытия */
  onOpenChange: (open: boolean) => void
}

/**
 * Компонент диалога настроек уведомлений
 * 
 * Позволяет пользователю настроить:
 * - Каналы доставки (email, in-app)
 * - Типы уведомлений (напоминания, обновления отчетов, изменения маршрута)
 * - Тихие часы (время, когда уведомления не отправляются)
 */
export function NotificationPreferencesDialog({
  open,
  onOpenChange,
}: NotificationPreferencesDialogProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailEnabled: true,
    inAppEnabled: true,
    assignmentReminders: true,
    reportUpdates: true,
    routeChanges: true,
  })

  const [quietHours, setQuietHours] = useState<QuietHours>({
    enabled: false,
    startTime: '22:00',
    endTime: '08:00',
  })

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  /**
   * Загрузить настройки при открытии диалога
   */
  useEffect(() => {
    if (open) {
      loadPreferences()
    }
  }, [open])

  /**
   * Загрузить текущие настройки уведомлений
   */
  const loadPreferences = async () => {
    setLoading(true)
    try {
      const response = await notificationsApi.getPreferences()
      if (response.success && response.data) {
        setPreferences(response.data.preferences || preferences)
        setQuietHours(response.data.quietHours || quietHours)
      }
    } catch (error: any) {
      console.error('Error loading preferences:', error)
      // Используем значения по умолчанию при ошибке
    } finally {
      setLoading(false)
    }
  }

  /**
   * Сохранить настройки уведомлений
   */
  const savePreferences = async () => {
    // Валидация тихих часов
    if (quietHours.enabled && quietHours.startTime === quietHours.endTime) {
      toast.error('Время начала и окончания тихих часов не могут совпадать')
      return
    }

    setSaving(true)
    try {
      await notificationsApi.updatePreferences({
        preferences,
        quietHours,
      })
      toast.success('Настройки уведомлений сохранены')
      onOpenChange(false)
    } catch (error: any) {
      console.error('Error saving preferences:', error)
      toast.error(
        error.response?.data?.error?.message ||
        'Ошибка при сохранении настроек'
      )
    } finally {
      setSaving(false)
    }
  }

  /**
   * Валидация диапазона времени
   */
  const validateTimeRange = () => {
    if (!quietHours.enabled) return true
    return quietHours.startTime !== quietHours.endTime
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Настройки уведомлений</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Каналы доставки */}
          <div>
            <h3 className="font-medium mb-3">Каналы доставки</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="email" className="cursor-pointer">
                  Email уведомления
                </Label>
                <Switch
                  id="email"
                  checked={preferences.emailEnabled}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({ ...prev, emailEnabled: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="inapp" className="cursor-pointer">
                  В приложении
                </Label>
                <Switch
                  id="inapp"
                  checked={preferences.inAppEnabled}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({ ...prev, inAppEnabled: checked }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Типы уведомлений */}
          <div>
            <h3 className="font-medium mb-3">Типы уведомлений</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="assignments" className="cursor-pointer">
                  Напоминания о заданиях
                </Label>
                <Switch
                  id="assignments"
                  checked={preferences.assignmentReminders}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({
                      ...prev,
                      assignmentReminders: checked,
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="reports" className="cursor-pointer">
                  Обновления отчетов
                </Label>
                <Switch
                  id="reports"
                  checked={preferences.reportUpdates}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({
                      ...prev,
                      reportUpdates: checked,
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="routes" className="cursor-pointer">
                  Изменения маршрута
                </Label>
                <Switch
                  id="routes"
                  checked={preferences.routeChanges}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({
                      ...prev,
                      routeChanges: checked,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Тихие часы */}
          <div>
            <h3 className="font-medium mb-3">Тихие часы</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="quiet-enabled" className="cursor-pointer">
                  Включить
                </Label>
                <Switch
                  id="quiet-enabled"
                  checked={quietHours.enabled}
                  onCheckedChange={(checked) =>
                    setQuietHours((prev) => ({ ...prev, enabled: checked }))
                  }
                />
              </div>
              {quietHours.enabled && (
                <div className="grid grid-cols-2 gap-2 pl-4">
                  <div>
                    <Label htmlFor="start-time" className="text-sm">
                      С
                    </Label>
                    <input
                      id="start-time"
                      type="time"
                      value={quietHours.startTime}
                      onChange={(e) =>
                        setQuietHours((prev) => ({
                          ...prev,
                          startTime: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border rounded-md mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-time" className="text-sm">
                      По
                    </Label>
                    <input
                      id="end-time"
                      type="time"
                      value={quietHours.endTime}
                      onChange={(e) =>
                        setQuietHours((prev) => ({
                          ...prev,
                          endTime: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border rounded-md mt-1"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={savePreferences} disabled={saving || !validateTimeRange()}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              'Сохранить'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

