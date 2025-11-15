'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { authApi } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Валидация
      if (!email || !password) {
        throw new Error('Пожалуйста, заполните все поля')
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Пожалуйста, введите корректный email')
      }

      // Отправка запроса
      const response = await authApi.login(email, password)
      
      // API возвращает { success: true, data: { accessToken, refreshToken, user } }
      if (response && response.success && response.data) {
        const { user, accessToken, refreshToken } = response.data
        
        // Сохраняем данные авторизации
        setAuth(user, accessToken, refreshToken)
        
        // Редирект на единый dashboard (роли lowercase из базы)
        router.push('/dashboard')
      } else {
        throw new Error('Неверный формат ответа от сервера')
      }
    } catch (err: any) {
      // API возвращает ошибки в формате RFC 7807 Problem Details
      // { type, title, status, detail, instance }
      // Также может быть ошибка CORS или сетевые ошибки
      let errorMessage = 'Произошла ошибка при входе'
      
      if (err.response) {
        // Ответ от сервера получен
        errorMessage = err.response.data?.detail || err.response.data?.title || err.response.data?.message || errorMessage
      } else if (err.request) {
        // Запрос отправлен, но ответа нет (CORS, сеть)
        errorMessage = 'Не удалось подключиться к серверу. Проверьте подключение к интернету.'
      } else {
        // Ошибка при настройке запроса
        errorMessage = err.message || errorMessage
      }
      
      console.error('Login error:', err)
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
          <p className="text-neutral-600">Вход в систему</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Добро пожаловать</CardTitle>
            <CardDescription>
              Введите свои учетные данные для входа в систему
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <Link href="/forgot-password" className="text-primary hover:underline">
                  Забыли пароль?
                </Link>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Вход...' : 'Войти'}
              </Button>

              <div className="text-center text-sm text-neutral-600">
                Нет аккаунта?{' '}
                <Link href="/register" className="text-primary font-medium hover:underline">
                  Зарегистрироваться
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-8 text-center text-sm text-neutral-500">
          <p>Тестовые аккаунты:</p>
          <p className="mt-2">
            <code className="text-xs bg-neutral-100 px-2 py-1 rounded">admin@neiro.dev</code>
            {' • '}
            <code className="text-xs bg-neutral-100 px-2 py-1 rounded">neuro@neiro.dev</code>
            {' • '}
            <code className="text-xs bg-neutral-100 px-2 py-1 rounded">parent1@example.com</code>
          </p>
        </div>
      </div>
    </div>
  )
}

