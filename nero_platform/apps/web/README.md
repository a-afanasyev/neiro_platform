# Neiro Platform - Web Application

Next.js 14+ приложение с App Router для платформы Neiro.

## 🎨 Стек технологий

### Core
- **Next.js 14+**: App Router, Server Components
- **React 18**: Hooks, Context
- **TypeScript**: Строгая типизация
- **Tailwind CSS**: Utility-first CSS framework

### UI Components
- **Radix UI**: Headless UI компоненты
- **shadcn/ui**: Готовые компоненты на базе Radix UI
- **Lucide React**: Иконки
- **class-variance-authority**: Управление вариантами компонентов

### State Management
- **Zustand**: Легковесный state management
- **Axios**: HTTP клиент с интерцепторами

### Forms & Validation
- **Zod**: Schema validation
- **React Hook Form**: Управление формами (планируется)

## 📁 Структура проекта

```
apps/web/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   ├── globals.css          # Global styles
│   │   ├── (auth)/              # Auth group
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/         # Dashboard group
│   │   │   ├── children/
│   │   │   ├── diagnostics/
│   │   │   └── routes/
│   │   └── api/                 # API routes (если нужны)
│   ├── components/
│   │   ├── ui/                  # Базовые UI компоненты
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   ├── providers.tsx        # Context providers
│   │   └── ...                  # Бизнес-компоненты
│   ├── hooks/
│   │   ├── useAuth.ts           # Auth hook
│   │   └── ...
│   ├── lib/
│   │   ├── api.ts               # API client
│   │   └── utils.ts             # Utility functions
│   └── types/
│       └── ...                  # TypeScript types
├── public/                       # Static files
├── .env.local.example           # Environment variables example
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── package.json
```

## 🚀 Запуск

### Development

```bash
# Установка зависимостей
pnpm install

# Запуск dev сервера
pnpm dev
```

Приложение будет доступно на `http://localhost:3001`

### Production

```bash
# Сборка
pnpm build

# Запуск production сервера
pnpm start
```

## 🎨 Design System

### Цветовая палитра

- **Primary** (Indigo): Основной цвет бренда
- **Secondary** (Cyan): Дополнительный цвет
- **Success** (Green): Успешные действия
- **Warning** (Amber): Предупреждения
- **Error** (Red): Ошибки
- **Neutral** (Zinc): Нейтральные элементы

### Типографика

- **Font Family**: Inter (основной), Cal Sans (заголовки)
- **Font Sizes**: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl

### Spacing & Layout

- **Grid**: 12-колоночная система
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)

## 🔐 Аутентификация

Приложение использует JWT-based аутентификацию:

1. **Login**: POST `/auth/v1/login` → получаем `accessToken` и `refreshToken`
2. **Refresh**: POST `/auth/v1/refresh` → обновляем токены
3. **Logout**: POST `/auth/v1/logout` → инвалидируем токены

Токены сохраняются в:
- `localStorage` (для axios интерцептора)
- Zustand store (для React компонентов)

### Auto-refresh

Axios интерцептор автоматически:
- Добавляет `accessToken` в заголовок `Authorization`
- При 401 ошибке пытается обновить токен
- При неудачном refresh перенаправляет на `/login`

## 📡 API Integration

API клиенты находятся в `src/lib/api.ts`:

- `authApi`: Аутентификация
- `usersApi`: Управление пользователями
- `childrenApi`: Управление профилями детей
- `diagnosticsApi`: Диагностические сессии

Пример использования:

```typescript
import { childrenApi } from '@/lib/api'

const children = await childrenApi.getChildren({ limit: 10 })
```

## 🧩 Компоненты

### Базовые UI компоненты

- `Button`: Кнопки с вариантами (default, outline, ghost, etc.)
- `Card`: Карточки контента
- Планируются: Input, Select, Dialog, Toast, и др.

### Использование

```typescript
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

<Button variant="primary" size="lg">
  Нажми меня
</Button>

<Card>
  <CardHeader>
    <CardTitle>Заголовок</CardTitle>
  </CardHeader>
  <CardContent>
    Контент карточки
  </CardContent>
</Card>
```

## 📱 Responsive Design

Все компоненты адаптивны и работают на:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large Desktop (1280px+)

## ♿ Accessibility

- Семантический HTML
- ARIA атрибуты (через Radix UI)
- Keyboard navigation
- Screen reader support
- Focus management

## 🔄 Планируемые страницы и функции

### Month 1 (Current)
- ✅ Home page
- ✅ UI Components (Button, Card)
- ✅ API Integration
- ✅ Auth hook
- 🔄 Login page
- 🔄 Dashboard layout
- 🔄 Children list
- 🔄 Diagnostics sessions

### Month 2
- Routes management
- Exercises library
- Assignments

### Month 3
- Reports & analytics
- Media uploads
- Communications

## 🧪 Testing

```bash
# Unit tests (планируется)
pnpm test

# E2E tests (планируется)
pnpm test:e2e
```

## 🔧 Environment Variables

Создайте `.env.local` на основе `.env.local.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4001
NODE_ENV=development
```

## 📚 Ресурсы

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/primitives/docs/overview/introduction)
- [shadcn/ui](https://ui.shadcn.com/)
- [Zustand](https://github.com/pmndrs/zustand)

## ✅ Constitution Check

- ✅ **Next.js 14+ App Router**: Использование современного подхода
- ✅ **TypeScript**: Строгая типизация
- ✅ **Responsive Design**: Адаптивность для всех устройств
- ✅ **Accessibility**: Поддержка a11y через Radix UI
- ✅ **Design System**: Единый стиль и компоненты
- ✅ **API Integration**: Централизованный API клиент
- ✅ **State Management**: Zustand для глобального состояния
- ✅ **Auto-refresh tokens**: Бесшовная работа с JWT

