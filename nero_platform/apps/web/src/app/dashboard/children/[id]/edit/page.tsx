'use client'

/**
 * Страница редактирования профиля ребенка
 * 
 * Позволяет редактировать:
 * - Личные данные (ФИО, дата рождения, пол)
 * - Медицинскую информацию (диагноз, примечания)
 */

import { useEffect, useState, FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { childrenApi } from '@/lib/api'

interface Child {
  id: string
  firstName: string
  lastName: string
  middleName?: string
  dateOfBirth: string
  gender: string
  diagnosis?: string
  notes?: string
}

export default function EditChildPage() {
  const params = useParams()
  const router = useRouter()
  const childId = params.id as string

  const [child, setChild] = useState<Child | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Форма
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState('male')
  const [diagnosis, setDiagnosis] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    loadChild()
  }, [childId])

  /**
   * Загрузка данных ребенка
   */
  async function loadChild() {
    try {
      setLoading(true)
      setError(null)

      const res = await childrenApi.getChild(childId)
      const childData = res.data?.data || res.data
      setChild(childData)

      // Заполняем форму
      setFirstName(childData.firstName || '')
      setLastName(childData.lastName || '')
      setMiddleName(childData.middleName || '')
      setDateOfBirth(childData.dateOfBirth?.split('T')[0] || '')
      setGender(childData.gender || 'male')
      setDiagnosis(childData.diagnosis || '')
      setNotes(childData.notes || '')
    } catch (err: any) {
      console.error('Ошибка загрузки ребенка:', err)
      setError(err.response?.data?.message || 'Не удалось загрузить данные ребенка')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Сохранение изменений
   */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!firstName.trim() || !lastName.trim() || !dateOfBirth) {
      setError('Пожалуйста, заполните все обязательные поля')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const updateData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        middleName: middleName.trim() || undefined,
        dateOfBirth,
        gender,
        diagnosis: diagnosis.trim() || undefined,
        notes: notes.trim() || undefined,
      }

      await childrenApi.updateChild(childId, updateData)

      // Перенаправляем на страницу просмотра
      router.push(`/dashboard/children/${childId}`)
    } catch (err: any) {
      console.error('Ошибка сохранения ребенка:', err)
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
              <p className="text-neutral-600">Загрузка данных ребенка...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (!child) {
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
                <p className="text-red-600">{error || 'Ребенок не найден'}</p>
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
              <h1 className="text-3xl font-bold">Редактирование профиля ребенка</h1>
              <p className="text-muted-foreground">
                {child.lastName} {child.firstName}
              </p>
            </div>
            <Button variant="outline" onClick={() => router.back()}>
              Отмена
            </Button>
          </div>

          {/* Форма редактирования */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Основная информация */}
              <Card>
                <CardHeader>
                  <CardTitle>Основная информация</CardTitle>
                  <CardDescription>Личные данные ребенка</CardDescription>
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

                    {/* Дата рождения */}
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">
                        Дата рождения <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        required
                      />
                    </div>

                    {/* Пол */}
                    <div className="space-y-2">
                      <Label htmlFor="gender">
                        Пол <span className="text-red-500">*</span>
                      </Label>
                      <select
                        id="gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      >
                        <option value="male">Мужской</option>
                        <option value="female">Женский</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Медицинская информация */}
              <Card>
                <CardHeader>
                  <CardTitle>Медицинская информация</CardTitle>
                  <CardDescription>Диагнозы и особенности развития</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Диагноз */}
                  <div className="space-y-2">
                    <Label htmlFor="diagnosis">Диагноз</Label>
                    <Input
                      id="diagnosis"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="Например: РАС, СДВГ и т.д."
                    />
                  </div>

                  {/* Примечания */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Примечания</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Дополнительная информация об особенностях развития, поведении и т.д."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Кнопки действий */}
              <div className="flex justify-end gap-2">
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
            </div>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}

