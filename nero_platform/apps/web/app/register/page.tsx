/**
 * Страница регистрации
 */

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Регистрация в Neiro</h1>
          <p className="mt-2 text-muted-foreground">
            Создайте аккаунт для начала работы
          </p>
        </div>

        <form className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                  Имя
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Анвар"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                  Фамилия
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Иванов"
                />
              </div>
            </div>

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
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Телефон (опционально)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="+998901234567"
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
              <p className="mt-1 text-xs text-muted-foreground">
                Минимум 8 символов, буквы и цифры
              </p>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium mb-2">
                Я регистрируюсь как
              </label>
              <select
                id="role"
                name="role"
                required
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="parent">Родитель</option>
                <option value="specialist">Специалист</option>
              </select>
            </div>
          </div>

          <div className="flex items-start">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="terms" className="ml-2 block text-sm">
              Я согласен с{' '}
              <a href="/terms" className="text-primary hover:underline">
                условиями использования
              </a>{' '}
              и{' '}
              <a href="/privacy" className="text-primary hover:underline">
                политикой конфиденциальности
              </a>
            </label>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition font-semibold"
          >
            Зарегистрироваться
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Уже есть аккаунт?{' '}
          <a href="/login" className="text-primary hover:underline">
            Войти
          </a>
        </p>
      </div>
    </div>
  );
}

