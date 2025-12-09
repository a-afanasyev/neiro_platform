/**
 * Страница профиля пользователя
 * 
 * Функциональность:
 * - Отображение личной информации
 * - Возможность редактирования
 */

'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'

export default function ProfilePage() {
  const { user } = useAuth()

  return (
    <ProtectedRoute allowedRoles={['admin', 'specialist', 'supervisor', 'parent']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Мой профиль</h1>
            <p className="text-muted-foreground">Просмотр и редактирование вашей личной информации</p>
          </div>

          {/* Личная информация */}
          <Card>
            <CardHeader>
              <CardTitle>Личная информация</CardTitle>
              <CardDescription>
                Основная информация о вашем профиле
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Имя</Label>
                  <Input 
                    id="firstName" 
                    value={user?.firstName || ''} 
                    readOnly 
                    data-testid="profile-first-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Фамилия</Label>
                  <Input 
                    id="lastName" 
                    value={user?.lastName || ''} 
                    readOnly 
                    data-testid="profile-last-name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={user?.email || ''} 
                  readOnly 
                  data-testid="profile-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Роль</Label>
                <Input 
                  id="role" 
                  value={
                    user?.role === 'admin' ? 'Администратор' :
                    user?.role === 'specialist' ? 'Специалист' :
                    user?.role === 'supervisor' ? 'Супервизор' :
                    user?.role === 'parent' ? 'Родитель' : 'Неизвестно'
                  } 
                  readOnly 
                  data-testid="profile-role"
                />
              </div>
              <div className="pt-4">
                <Button data-testid="profile-edit-button">Редактировать профиль</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}





