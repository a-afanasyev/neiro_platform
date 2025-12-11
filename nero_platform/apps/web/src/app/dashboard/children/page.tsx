'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { childrenApi, usersApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

interface Child {
  id: string
  firstName: string
  lastName: string
  birthDate: string
  diagnosisSummary?: string
  age?: number
}

interface Parent {
  id: string
  firstName: string
  lastName: string
  email: string
}

const relationshipLabels: Record<string, string> = {
  mother: 'Мать',
  father: 'Отец',
  guardian: 'Опекун',
  other: 'Другое',
}

export default function ChildrenPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [children, setChildren] = useState<Child[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingParents, setIsLoadingParents] = useState(false)
  const [availableParents, setAvailableParents] = useState<Parent[]>([])

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    diagnosis: '',
    parentUserId: '',
    relationship: 'guardian' as 'mother' | 'father' | 'guardian' | 'other',
    legalGuardian: true,
  })

  useEffect(() => {
    loadChildren()
  }, [])

  useEffect(() => {
    if (isDialogOpen) {
      loadParents()
    }
  }, [isDialogOpen])

  const loadParents = async () => {
    setIsLoadingParents(true)
    try {
      const response = await usersApi.getParents()
      if (response.success) {
        const allParents = response.data?.items || response.data || []
        setAvailableParents(allParents)
      }
    } catch (err: any) {
      console.error('Ошибка загрузки родителей:', err)
      setError('Не удалось загрузить список родителей')
    } finally {
      setIsLoadingParents(false)
    }
  }

  const loadChildren = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await childrenApi.getChildren()

      if (response.success) {
        // Backend Children Service возвращает массив детей напрямую в поле data
        // В более старых версиях здесь мог быть объект { items: [...] }, поэтому
        // на всякий случай поддерживаем оба варианта.
        const raw = response.data as any
        const list = Array.isArray(raw) ? raw : raw?.items ?? []

        setChildren(list)
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Не удалось загрузить список детей')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (!formData.parentUserId) {
        throw new Error('Необходимо выбрать родителя/опекуна')
      }

      // Создаем ребенка с родителем
      const childData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        birthDate: new Date(formData.dateOfBirth).toISOString(),
        diagnosisSummary: formData.diagnosis || undefined,
        parentUserId: formData.parentUserId,
        relationship: formData.relationship,
        legalGuardian: formData.legalGuardian,
      }

      const childResponse = await childrenApi.createChild(childData)

      if (childResponse.success) {
        // Родитель уже привязан при создании

        await loadChildren()
        setIsDialogOpen(false)
        setFormData({
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          diagnosis: '',
          parentUserId: '',
          relationship: 'guardian',
          legalGuardian: true,
        })
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Не удалось создать профиль ребенка')
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'specialist', 'supervisor', 'parent']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                {user?.role === 'parent' ? 'Мои дети' : 'Дети'}
              </h1>
              <p className="text-neutral-600 mt-1">
                {user?.role === 'parent' 
                  ? 'Профили ваших детей и их прогресс'
                  : 'Управление профилями детей в системе'
                }
              </p>
            </div>

            {(user?.role === 'admin' || user?.role === 'specialist') && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="add-child-button">+ Добавить ребенка</Button>
                </DialogTrigger>
                <DialogContent data-testid="create-child-dialog">
                  <DialogHeader>
                    <DialogTitle>Добавить ребенка</DialogTitle>
                    <DialogDescription>
                      Заполните информацию о ребенке
                    </DialogDescription>
                  </DialogHeader>

                  {isLoadingParents ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : availableParents.length === 0 ? (
                    <Alert>
                      <AlertDescription>
                        Нет доступных пользователей с ролью "Родитель". Сначала создайте
                        пользователя с этой ролью в разделе "Пользователи".
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4 py-4">
                        {error && (
                          <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="firstName">Имя *</Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lastName">Фамилия *</Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="dateOfBirth">Дата рождения *</Label>
                          <Input
                            id="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="diagnosis">Диагноз</Label>
                          <Input
                            id="diagnosis"
                            value={formData.diagnosis}
                            onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                            placeholder="Например: РАС средней степени"
                          />
                        </div>

                        <div className="border-t pt-4 mt-4">
                          <h4 className="font-medium mb-4">Родитель/Опекун *</h4>

                          <div className="space-y-2">
                            <Label htmlFor="parentUserId">Выберите родителя/опекуна *</Label>
                            <Select
                              value={formData.parentUserId}
                              onValueChange={(value) => setFormData({ ...formData, parentUserId: value })}
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите пользователя" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableParents.map((parent) => (
                                  <SelectItem key={parent.id} value={parent.id}>
                                    {parent.lastName} {parent.firstName} ({parent.email})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2 mt-4">
                            <Label htmlFor="relationship">Тип отношений *</Label>
                            <Select
                              value={formData.relationship}
                              onValueChange={(value) =>
                                setFormData({
                                  ...formData,
                                  relationship: value as 'mother' | 'father' | 'guardian' | 'other',
                                })
                              }
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите тип" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(relationshipLabels).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center space-x-2 mt-4">
                            <input
                              type="checkbox"
                              id="legalGuardian"
                              checked={formData.legalGuardian}
                              onChange={(e) =>
                                setFormData({ ...formData, legalGuardian: e.target.checked })
                              }
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <Label htmlFor="legalGuardian" className="text-sm font-medium">
                              Законный представитель
                            </Label>
                          </div>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Отмена
                        </Button>
                        <Button type="submit" disabled={isSubmitting || !formData.parentUserId}>
                          {isSubmitting ? 'Добавление...' : 'Добавить'}
                        </Button>
                      </DialogFooter>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
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

          {/* Children List */}
          {!isLoading && !error && (
            <>
              {children.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="text-6xl mb-4">👶</div>
                    <h3 className="text-xl font-semibold mb-2">Нет детей</h3>
                    <p className="text-neutral-600 mb-4">
                      {user?.role === 'parent' 
                        ? 'У вас пока нет добавленных детей'
                        : 'В системе пока нет зарегистрированных детей'
                      }
                    </p>
                    {(user?.role === 'admin' || user?.role === 'specialist') && (
                      <Button onClick={() => setIsDialogOpen(true)}>
                        Добавить первого ребенка
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {children.map((child) => (
                    <Card key={child.id} data-testid="child-card" className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl">
                              {child.firstName} {child.lastName}
                            </CardTitle>
                            <CardDescription className="mt-2">
                              <div className="space-y-1">
                                <p>
                                  Возраст: {calculateAge(child.birthDate)} {' '}
                                  {calculateAge(child.birthDate) === 1 ? 'год'
                                    : calculateAge(child.birthDate) < 5 ? 'года' : 'лет'}
                                </p>
                                {child.diagnosisSummary && (
                                  <p className="text-xs">
                                    Диагноз: {child.diagnosisSummary}
                                  </p>
                                )}
                              </div>
                            </CardDescription>
                          </div>
                          <div className="text-4xl">👶</div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex space-x-2">
                          <Button
                            data-testid="view-child-button"
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => router.push(`/dashboard/children/${child.id}`)}
                          >
                            Подробнее
                          </Button>
                          {(user?.role === 'admin' || user?.role === 'specialist') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/dashboard/children/${child.id}/edit`)}
                            >
                              Редактировать
                            </Button>
                          )}
                        </div>
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

