import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-primary-900 mb-4">
            Neiro Platform
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Платформа для создания и сопровождения индивидуальных коррекционных маршрутов 
            для детей с расстройствами аутистического спектра
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Диагностика</CardTitle>
              <CardDescription>
                Комплексная оценка развития ребенка с использованием стандартизированных опросников
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600">
                CARS, ABC, ATEC, Vineland-3, SPM-2, M-CHAT-R
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Коррекционные маршруты</CardTitle>
              <CardDescription>
                Индивидуальные программы развития с учетом особенностей каждого ребенка
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600">
                Персонализированные цели, этапы и упражнения
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Отслеживание прогресса</CardTitle>
              <CardDescription>
                Детальная аналитика и отчеты о динамике развития ребенка
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600">
                Графики, диаграммы, сравнительный анализ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Библиотека упражнений</CardTitle>
              <CardDescription>
                Более 500 коррекционных упражнений с мультимедийными материалами
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600">
                Видео, аудио, интерактивные задания
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Коммуникация</CardTitle>
              <CardDescription>
                Инструменты для связи между специалистами, родителями и детьми
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600">
                Чат, уведомления, обратная связь
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Аналитика</CardTitle>
              <CardDescription>
                Глубокая аналитика эффективности коррекционных программ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600">
                ML-рекомендации, сравнение методик
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="space-x-4">
            <Link href="/login">
              <Button size="lg" className="bg-primary hover:bg-primary-700">
                Войти
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline">
                Зарегистрироваться
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-24 text-center text-neutral-500 text-sm">
          <p>&copy; 2025 Neiro Platform. Все права защищены.</p>
          <p className="mt-2">
            Создано с заботой о детях с РАС и их семьях
          </p>
        </footer>
      </div>
    </main>
  )
}

