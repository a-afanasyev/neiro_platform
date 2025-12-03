/**
 * Страница настроек системы
 * 
 * Функциональность:
 * - Настройки профиля пользователя
 * - Системная информация
 */

'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SettingsPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Настройки</h1>
            <p className="text-muted-foreground">Управление настройками вашего профиля и системы</p>
          </div>

          {/* Личная информация */}
          <Card>
            <CardHeader>
              <CardTitle>Личная информация</CardTitle>
              <CardDescription>
                Обновите свою личную информацию и контактные данные
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Имя</Label>
                  <Input id="firstName" placeholder="Введите имя" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Фамилия</Label>
                  <Input id="lastName" placeholder="Введите фамилию" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input id="phone" type="tel" placeholder="+7 (999) 123-45-67" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Часовой пояс</Label>
                <Input id="timezone" placeholder="Europe/Moscow" />
              </div>
              <Button>Сохранить изменения</Button>
            </CardContent>
          </Card>

          {/* Смена пароля */}
          <Card>
            <CardHeader>
              <CardTitle>Смена пароля</CardTitle>
              <CardDescription>
                Обновите пароль для обеспечения безопасности вашей учетной записи
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Текущий пароль</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Новый пароль</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Подтвердите новый пароль</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <Button>Изменить пароль</Button>
            </CardContent>
          </Card>

          {/* Системная информация */}
          <Card>
            <CardHeader>
              <CardTitle>Системная информация</CardTitle>
              <CardDescription>Информация о версии и состоянии системы</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Версия платформы:</span>
                  <span className="text-sm text-muted-foreground">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Последнее обновление:</span>
                  <span className="text-sm text-muted-foreground">16.11.2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Статус системы:</span>
                  <span className="text-sm text-green-600">Работает нормально</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">API Gateway:</span>
                  <span className="text-sm text-green-600">Активен (nginx:8080)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Backend сервисы:</span>
                  <span className="text-sm text-green-600">8/8 работают</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
