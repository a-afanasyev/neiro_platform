/**
 * Страница входа в систему
 */

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Вход в Neiro</h1>
          <p className="mt-2 text-muted-foreground">
            Введите ваши учетные данные для входа
          </p>
        </div>

        <form className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="remember" className="ml-2 block text-sm">
                Запомнить меня
              </label>
            </div>

            <a href="/forgot-password" className="text-sm text-primary hover:underline">
              Забыли пароль?
            </a>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition font-semibold"
          >
            Войти
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Нет аккаунта?{' '}
          <a href="/register" className="text-primary hover:underline">
            Зарегистрироваться
          </a>
        </p>
      </div>
    </div>
  );
}

