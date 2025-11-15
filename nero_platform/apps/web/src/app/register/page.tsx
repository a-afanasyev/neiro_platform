'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function RegisterPage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    const { firstName, lastName, email, password, confirmPassword, phone } = formData

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      throw new Error('Пожалуйста, заполните все обязательные поля')
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Пожалуйста, введите корректный email')
    }

    if (password.length < 8) {
      throw new Error('Пароль должен содержать минимум 8 символов')
    }

    if (password !== confirmPassword) {
      throw new Error('Пароли не совпадают')
    }

    if (phone && !/^\+?[0-9]{10,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      throw new Error('Пожалуйста, введите корректный номер телефона')
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
      validateForm()

      // В MVP регистрация доступна только через приглашение админом
      // Для демонстрации показываем информационное сообщение
      setSuccess(
        'Регистрация новых пользователей доступна только по приглашению администратора. ' +
        'Пожалуйста, обратитесь к администратору системы для получения доступа.'
      )

      // В будущем здесь будет вызов API
      // const response = await authApi.register(formData)
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Произошла ошибка при регистрации'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-900 mb-2">Neiro Platform</h1>
          <p className="text-neutral-600">Регистрация в системе</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Создание аккаунта</CardTitle>
            <CardDescription>
              Заполните форму для регистрации в системе
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert variant="default">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Имя *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Иван"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Фамилия *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Иванов"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+7 (999) 123-45-67"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  disabled={isLoading}
                  required
                />
                <p className="text-xs text-neutral-500">Минимум 8 символов</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Подтвердите пароль *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
              </Button>

              <div className="text-center text-sm text-neutral-600">
                Уже есть аккаунт?{' '}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Войти
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-6 text-center text-xs text-neutral-500 bg-warning-50 border border-warning-200 rounded-lg p-4">
          <p className="font-medium text-warning-800 mb-1">⚠️ Обратите внимание</p>
          <p className="text-warning-700">
            В текущей версии регистрация доступна только через приглашение администратора.
            Для получения доступа к системе обратитесь к администратору.
          </p>
        </div>
      </div>
    </div>
  )
}

