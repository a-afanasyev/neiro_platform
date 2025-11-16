'use client'

/**
 * Страница редактирования пользователя
 * 
 * Позволяет редактировать:
 * - Личные данные (имя, фамилия, отчество)
 * - Контактную информацию (email, телефон)
 * - Роль пользователя (только для админов)
 * - Статус пользователя (только для админов)
 */

import { useEffect, useState, FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { usersApi } from '@/lib/api'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  middleName?: string
  phone?: string
  role: string
  status: string
}

export default function EditUserPage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const userId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Форма
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')

  const isAdmin = currentUser?.role === 'admin'

  useEffect(() => {
    loadUser()
  }, [userId])

  /**
   * Загрузка данных пользователя
   */
  async function loadUser() {
    try {
      setLoading(true)
      setError(null)

      const res = await usersApi.getUser(userId)
      const userData = res.data?.data || res.data
      setUser(userData)

      // Заполняем форму
      setFirstName(userData.firstName || '')
      setLastName(userData.lastName || '')
      setMiddleName(userData.middleName || '')
      setEmail(userData.email || '')
      setPhone(userData.phone || '')
      setRole(userData.role || '')
      setStatus(userData.status || '')
    } catch (err: any) {
      console.error('Ошибка загрузки пользователя:', err)
      setError(err.response?.data?.message || 'Не удалось загрузить данные пользователя')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Сохранение изменений
   */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('Пожалуйста, заполните все обязательные поля')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const updateData: any = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        middleName: middleName.trim() || undefined,
        email: email.trim(),
        phone: phone.trim() || undefined,
      }

      // Только админы могут менять роль и статус
      if (isAdmin) {
        updateData.role = role
        updateData.status = status
      }

      await usersApi.updateUser(userId, updateData)

      // Перенаправляем на страницу просмотра
      router.push(`/dashboard/users/${userId}`)
    } catch (err: any) {
      console.error('Ошибка сохранения пользователя:', err)
      setError(err.response?.data?.message || 'Не удалось сохранить изменения')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-neutral-600">Загрузка данных пользователя...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (!user) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Ошибка</h1>
              <Button onClick={() => router.back()}>Назад</Button>
            </div>
            <Card>
              <CardContent className="pt-6">
                <p className="text-red-600">{error || 'Пользователь не найден'}</p>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Заголовок */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Редактирование пользователя</h1>
              <p className="text-muted-foreground">
                {user.lastName} {user.firstName}
              </p>
            </div>
            <Button variant="outline" onClick={() => router.back()}>
              Отмена
            </Button>
          </div>

          {/* Форма редактирования */}
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
                <CardDescription>Редактирование личных данных и контактной информации</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Имя */}
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      Имя <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Введите имя"
                      required
                    />
                  </div>

                  {/* Фамилия */}
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Фамилия <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Введите фамилию"
                      required
                    />
                  </div>

                  {/* Отчество */}
                  <div className="space-y-2">
                    <Label htmlFor="middleName">Отчество</Label>
                    <Input
                      id="middleName"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      placeholder="Введите отчество"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      required
                    />
                  </div>

                  {/* Телефон */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>

                  {/* Роль (только для админов) */}
                  {isAdmin && (
                    <div className="space-y-2">
                      <Label htmlFor="role">Роль</Label>
                      <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="parent">Родитель</option>
                        <option value="specialist">Специалист</option>
                        <option value="admin">Администратор</option>
                      </select>
                    </div>
                  )}

                  {/* Статус (только для админов) */}
                  {isAdmin && (
                    <div className="space-y-2">
                      <Label htmlFor="status">Статус</Label>
                      <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="active">Активен</option>
                        <option value="inactive">Неактивен</option>
                        <option value="blocked">Заблокирован</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Кнопки действий */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={saving}
                  >
                    Отмена
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Сохранение...' : 'Сохранить изменения'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

