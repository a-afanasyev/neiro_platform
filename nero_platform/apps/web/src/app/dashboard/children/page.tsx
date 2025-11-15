'use client'

import { useState, useEffect } from 'react'
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
import { childrenApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

interface Child {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  diagnosis?: string
  age?: number
}

export default function ChildrenPage() {
  const { user } = useAuth()
  const [children, setChildren] = useState<Child[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    diagnosis: '',
  })

  useEffect(() => {
    loadChildren()
  }, [])

  const loadChildren = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await childrenApi.getChildren()
      if (response.success) {
        setChildren(response.data.items)
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
      const response = await childrenApi.createChild(formData)
      if (response.success) {
        await loadChildren()
        setIsDialogOpen(false)
        setFormData({ firstName: '', lastName: '', dateOfBirth: '', diagnosis: '' })
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Не удалось создать профиль ребенка')
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
    <ProtectedRoute>
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
                  <Button>+ Добавить ребенка</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Добавить ребенка</DialogTitle>
                    <DialogDescription>
                      Заполните информацию о ребенке
                    </DialogDescription>
                  </DialogHeader>

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
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Отмена
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Создание...' : 'Создать'}
                      </Button>
                    </DialogFooter>
                  </form>
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
                    <Card key={child.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl">
                              {child.firstName} {child.lastName}
                            </CardTitle>
                            <CardDescription className="mt-2">
                              <div className="space-y-1">
                                <p>
                                  Возраст: {calculateAge(child.dateOfBirth)} {' '}
                                  {calculateAge(child.dateOfBirth) === 1 ? 'год' 
                                    : calculateAge(child.dateOfBirth) < 5 ? 'года' : 'лет'}
                                </p>
                                {child.diagnosis && (
                                  <p className="text-xs">
                                    Диагноз: {child.diagnosis}
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
                          <Button variant="outline" size="sm" className="flex-1">
                            Подробнее
                          </Button>
                          {(user?.role === 'admin' || user?.role === 'specialist') && (
                            <Button variant="outline" size="sm">
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

