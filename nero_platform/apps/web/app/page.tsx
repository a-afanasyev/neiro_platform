/**
 * Главная страница (Landing Page)
 */

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4 text-center">
          Neiro Platform
        </h1>
        <p className="text-xl text-center text-muted-foreground mb-8">
          Комплексная платформа для нейропсихологического сопровождения детей с РАС
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">🔍 Диагностика</h2>
            <p className="text-muted-foreground">
              Стандартизированные опросники и тесты для оценки развития
            </p>
          </div>

          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">📋 Маршруты</h2>
            <p className="text-muted-foreground">
              Индивидуальные планы коррекционного сопровождения
            </p>
          </div>

          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">📊 Аналитика</h2>
            <p className="text-muted-foreground">
              Отслеживание прогресса и эффективности терапии
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-center mt-12">
          <a
            href="/login"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
          >
            Войти
          </a>
          <a
            href="/register"
            className="px-6 py-3 border border-border rounded-lg hover:bg-secondary transition"
          >
            Регистрация
          </a>
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>🐳 Приложение работает в Docker-контейнере</p>
          <p className="mt-2">
            PostgreSQL: localhost:5437 | Redis: localhost:6379 | MinIO: localhost:9000
          </p>
        </div>
      </div>
    </main>
  );
}

