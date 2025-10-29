# Neiro Platform Design System

**Версия**: 1.0.0
**Дата последнего обновления**: 28 октября 2025
**Статус**: В разработке

---

## 📖 Содержание

1. [Принципы дизайна](#принципы-дизайна)
2. [Цветовая система](#цветовая-система)
3. [Типографика](#типографика)
4. [Сетка и отступы](#сетка-и-отступы)
5. [Компоненты](#компоненты)
6. [Иконография](#иконография)
7. [Анимация и переходы](#анимация-и-переходы)
8. [Accessibility](#accessibility)
9. [Темизация](#темизация)
10. [Паттерны использования](#паттерны-использования)

---

## 🎨 Принципы дизайна

### 1. Clarity First (Ясность прежде всего)
Интерфейс должен быть понятен пользователю без дополнительных объяснений. Используйте четкую иерархию, понятные метафоры и минимум визуального шума.

### 2. Empathy-Driven (Эмпатия к пользователю)
Дизайн создается для родителей детей с РАС и специалистов. Учитывайте:
- Эмоциональное состояние родителей
- Когнитивную нагрузку специалистов
- Необходимость быстрого доступа к критической информации

### 3. Progressive Disclosure (Постепенное раскрытие)
Не показывайте всю информацию сразу. Используйте:
- Аккордеоны для длинных списков
- Вкладки для группировки связанного контента
- Модальные окна для второстепенных действий

### 4. Consistency & Predictability (Последовательность и предсказуемость)
- Одинаковые действия выглядят одинаково
- Кнопки всегда в одном месте
- Цвета несут постоянное значение (зеленый = успех, красный = ошибка)

### 5. Accessibility by Default (Доступность по умолчанию)
- Минимальный контраст 4.5:1 для текста
- Все интерактивные элементы доступны с клавиатуры
- Скринридеры корректно читают интерфейс

---

## 🎨 Цветовая система

### Основная палитра

#### Primary (Основной)
Используется для ключевых действий, активных состояний и акцентов.

```css
--primary: #030213; /* Темно-фиолетовый, почти черный */
--primary-foreground: oklch(1 0 0); /* Белый текст на primary */
```

**Применение**:
- Главные CTA кнопки
- Активные элементы навигации
- Выделение важной информации

#### Secondary (Вторичный)
Для менее важных действий и вспомогательных элементов.

```css
--secondary: oklch(0.95 0.0058 264.53); /* Светло-фиолетовый */
--secondary-foreground: oklch(0.1 0.002 264.53); /* Темный текст */
```

**Применение**:
- Второстепенные кнопки
- Фоны карточек
- Неактивные вкладки

#### Accent (Акцент)
Для привлечения внимания к важным элементам.

```css
--accent: #e9ebef; /* Светло-серый */
--accent-foreground: oklch(0.1 0.002 264.53);
```

**Применение**:
- Hover состояния
- Выделение в таблицах
- Фоны уведомлений

---

### Семантические цвета

#### Success (Успех)
```css
--success: oklch(0.723 0.219 149.579); /* Зеленый-500 */
--success-light: oklch(0.851 0.178 149.327); /* Зеленый-300 */
--success-dark: oklch(0.593 0.241 150.07); /* Зеленый-700 */
```

**Применение**:
- Успешные действия
- Прогресс выполнения
- Положительные показатели

#### Destructive (Ошибка/удаление)
```css
--destructive: #d4183d; /* Красный */
--destructive-foreground: oklch(1 0 0); /* Белый */
```

**Применение**:
- Критические ошибки
- Удаление данных
- Предупреждения

#### Warning (Предупреждение)
```css
--warning: oklch(0.646 0.222 41.116); /* Оранжевый-600 */
--warning-light: oklch(0.868 0.174 58.994); /* Оранжевый-200 */
```

**Применение**:
- Важные уведомления
- Требуют внимания
- Промежуточные состояния

#### Info (Информация)
```css
--info: oklch(0.623 0.214 259.815); /* Синий-500 */
--info-light: oklch(0.875 0.106 254.604); /* Синий-200 */
```

**Применение**:
- Подсказки
- Информационные сообщения
- Обучающие элементы

---

### Нейтральные цвета

#### Slate (Основная шкала серого)
```css
--slate-50: oklch(0.984 0.003 264.53);
--slate-100: oklch(0.967 0.007 264.53);
--slate-200: oklch(0.929 0.013 264.53); /* Границы */
--slate-300: oklch(0.869 0.022 264.53);
--slate-400: oklch(0.705 0.04 264.53);
--slate-500: oklch(0.554 0.046 264.53); /* Вторичный текст */
--slate-600: oklch(0.446 0.043 264.53);
--slate-700: oklch(0.378 0.044 264.53);
--slate-800: oklch(0.267 0.042 264.53);
--slate-900: oklch(0.156 0.041 264.53); /* Основной текст */
```

**Применение**:
- Границы карточек: slate-200
- Вторичный текст: slate-500
- Основной текст: slate-900

#### Muted (Приглушенные)
```css
--muted: #ececf0; /* Фон */
--muted-foreground: #717182; /* Текст */
```

**Применение**:
- Неактивные элементы
- Вспомогательный текст
- Фоны полей ввода

---

### Градиенты

#### Primary Gradient (Основной)
```css
background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
/* От синего-500 до фиолетового-500 */
```

**Применение**:
- Главные CTA кнопки
- Hero секции
- Важные заголовки

#### Subtle Gradient (Мягкий)
```css
background: linear-gradient(180deg,
  oklch(0.984 0.003 264.53) 0%,
  oklch(0.967 0.028 264.53) 50%,
  oklch(0.953 0.054 285.885) 100%
);
/* От slate-50 через blue-50 до purple-50 */
```

**Применение**:
- Фоны страниц
- Hero секции лендинга
- Декоративные элементы

---

### Темная тема

В темной теме цвета инвертируются:

```css
.dark {
  --primary: oklch(1 0 0); /* Белый */
  --primary-foreground: oklch(0.15 0.002 264.53); /* Темный */

  --background: oklch(0.15 0.002 264.53); /* Темный фон */
  --foreground: oklch(0.984 0.003 264.53); /* Светлый текст */

  --muted: oklch(0.267 0.042 264.53); /* Темный фон элементов */
  --muted-foreground: oklch(0.705 0.04 264.53); /* Серый текст */
}
```

---

### Цветовая матрица доступности

| Комбинация | Контраст | WCAG AA | WCAG AAA |
|------------|----------|---------|----------|
| slate-900 / white | 19.2:1 | ✅ | ✅ |
| primary / primary-foreground | 21:1 | ✅ | ✅ |
| slate-500 / white | 4.6:1 | ✅ | ❌ |
| destructive / white | 7.8:1 | ✅ | ✅ |
| success / white | 3.8:1 | ❌ | ❌ |
| success-dark / white | 5.2:1 | ✅ | ✅ |

**Рекомендации**:
- Для основного текста используйте slate-900 или темнее
- Для вторичного текста — минимум slate-500
- При использовании цветных фонов проверяйте контраст

---

## 📝 Типографика

### Шрифты

#### Основной шрифт
```css
font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
             "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

**Преимущества системных шрифтов**:
- Мгновенная загрузка (0 мс)
- Привычность для пользователей ОС
- Оптимизация под экран устройства
- Экономия трафика

#### Моноширинный шрифт (для кода)
```css
font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
             "Liberation Mono", monospace;
```

**Применение**: Коды пациентов, технические данные

---

### Шкала размеров

| Название | Размер | Line Height | Применение |
|----------|--------|-------------|------------|
| `text-xs` | 0.75rem (12px) | 1rem | Подписи, метки, мелкий текст |
| `text-sm` | 0.875rem (14px) | 1.25rem | Вторичный текст, подсказки |
| `text-base` | 1rem (16px) | 1.5rem | **Основной текст** |
| `text-lg` | 1.125rem (18px) | 1.75rem | Лиды, подзаголовки |
| `text-xl` | 1.25rem (20px) | 1.75rem | Заголовки карточек |
| `text-2xl` | 1.5rem (24px) | 2rem | H3, крупные заголовки |
| `text-3xl` | 1.875rem (30px) | 2.25rem | H2 |
| `text-4xl` | 2.25rem (36px) | 2.5rem | H1 на страницах |
| `text-5xl` | 3rem (48px) | 1 | Hero заголовки |
| `text-6xl` | 3.75rem (60px) | 1 | Лендинг hero |

**Правила использования**:
- Основной текст всегда `text-base` (16px)
- Каждый уровень заголовков на 1-2 ступени больше предыдущего
- Мобильные заголовки на 1 ступень меньше десктопных

---

### Насыщенность шрифта

```css
font-weight: 400; /* Normal - основной текст */
font-weight: 500; /* Medium - подзаголовки, метки, кнопки */
font-weight: 600; /* Semibold - заголовки, акценты */
font-weight: 700; /* Bold - НЕ используется (избыточно) */
```

**Маппинг Tailwind**:
- `font-normal` → 400
- `font-medium` → 500
- `font-semibold` → 600

**Применение**:
- Обычный текст: `font-normal`
- Кнопки, метки форм: `font-medium`
- Заголовки: `font-semibold`

---

### Межстрочный интервал

```css
line-height: 1.25; /* Tight - заголовки */
line-height: 1.5;  /* Normal - основной текст */
line-height: 1.625; /* Relaxed - длинные тексты */
line-height: 2;    /* Loose - НЕ используется */
```

**Правила**:
- Заголовки (H1-H6): `leading-tight` или `leading-snug`
- Основной текст: `leading-normal`
- Длинные абзацы (>3 строк): `leading-relaxed`

---

### Цвет текста

```css
/* Основной текст */
color: oklch(0.156 0.041 264.53); /* slate-900 */

/* Вторичный текст */
color: oklch(0.554 0.046 264.53); /* slate-500 */

/* Приглушенный текст */
color: #717182; /* muted-foreground */

/* Текст на цветном фоне */
color: oklch(1 0 0); /* white */
```

**Tailwind классы**:
- `text-slate-900` — основной
- `text-slate-500` — вторичный
- `text-muted-foreground` — подписи
- `text-white` — на темном фоне

---

### Типографические паттерны

#### Заголовок страницы
```tsx
<h1 className="text-4xl font-semibold text-slate-900 leading-tight">
  Коррекционный маршрут
</h1>
```

#### Заголовок секции
```tsx
<h2 className="text-2xl font-semibold text-slate-900 mb-4">
  Активные упражнения
</h2>
```

#### Заголовок карточки
```tsx
<h3 className="text-xl font-medium text-slate-900">
  Имя пациента
</h3>
```

#### Основной текст
```tsx
<p className="text-base text-slate-700 leading-relaxed">
  Описание упражнения или длинный текст...
</p>
```

#### Вторичный текст
```tsx
<span className="text-sm text-slate-500">
  Последнее обновление: 2 часа назад
</span>
```

#### Подпись/метка
```tsx
<label className="text-xs font-medium text-slate-600 uppercase tracking-wider">
  Категория
</label>
```

---

## 📐 Сетка и отступы

### Базовая единица

```css
--spacing-unit: 0.25rem; /* 4px */
```

**Все отступы кратны 4px**:
- 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

---

### Шкала отступов

| Класс | Размер | Пиксели | Применение |
|-------|--------|---------|------------|
| `0` | 0 | 0px | Сброс отступов |
| `1` | 0.25rem | 4px | Мелкие элементы |
| `2` | 0.5rem | 8px | Между иконкой и текстом |
| `3` | 0.75rem | 12px | Внутренние отступы кнопок |
| `4` | 1rem | 16px | **Базовый отступ** |
| `5` | 1.25rem | 20px | - |
| `6` | 1.5rem | 24px | Между секциями карточки |
| `8` | 2rem | 32px | Между карточками |
| `10` | 2.5rem | 40px | - |
| `12` | 3rem | 48px | Между блоками |
| `16` | 4rem | 64px | Между крупными секциями |
| `20` | 5rem | 80px | - |
| `24` | 6rem | 96px | Вертикальные отступы страниц |

---

### Сеточная система

#### Desktop (1280px+)
```tsx
<div className="grid grid-cols-12 gap-6">
  {/* 12 колонок, 24px gap */}
</div>
```

#### Tablet (768px - 1279px)
```tsx
<div className="grid grid-cols-8 gap-4">
  {/* 8 колонок, 16px gap */}
</div>
```

#### Mobile (< 768px)
```tsx
<div className="grid grid-cols-4 gap-3">
  {/* 4 колонки, 12px gap */}
</div>
```

---

### Контейнеры

#### Максимальная ширина контента

```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* 1280px max-width с адаптивными падингами */}
</div>
```

**Ширины контейнеров**:
- `max-w-sm` — 384px (формы, модалки)
- `max-w-2xl` — 672px (статьи, тексты)
- `max-w-4xl` — 896px (дашборды)
- `max-w-7xl` — 1280px (основной контент)
- `max-w-full` — без ограничения (таблицы)

---

### Паддинги компонентов

#### Кнопки
```css
padding: 0.5rem 1rem; /* py-2 px-4 — small */
padding: 0.75rem 1.5rem; /* py-3 px-6 — default */
padding: 1rem 2rem; /* py-4 px-8 — large */
```

#### Карточки
```css
padding: 1.5rem; /* p-6 — default */
padding: 2rem; /* p-8 — spacious */
```

#### Поля ввода
```css
padding: 0.5rem 0.75rem; /* py-2 px-3 — default */
padding: 0.75rem 1rem; /* py-3 px-4 — large */
```

#### Модальные окна
```css
padding: 1.5rem; /* p-6 — header/footer */
padding: 1.5rem 1.5rem 2rem; /* px-6 py-6 pb-8 — content */
```

---

### Правила использования

1. **Вертикальные отступы больше горизонтальных**: `mb-6` вместо `mx-4`
2. **Между блоками — кратно 8**: 16px, 24px, 32px
3. **Внутри блоков — кратно 4**: 4px, 8px, 12px, 16px
4. **Используйте gap вместо margin в grid/flex**: `gap-4` вместо `space-x-4`

---

## 🧩 Компоненты

### Анатомия компонента

Каждый компонент состоит из:
1. **Структура** — HTML разметка
2. **Варианты** — размеры, цвета, состояния
3. **Свойства** — кастомизация через props
4. **Поведение** — интерактивность

---

### Кнопки (Button)

#### Варианты

**Default (Основная)**
```tsx
<Button variant="default">Сохранить</Button>
```
Стиль:
- Фон: Градиент `from-blue-500 to-purple-500`
- Текст: Белый, `font-medium`
- Тень: `shadow-lg shadow-purple-200/50`
- Hover: `from-blue-600 to-purple-600`

**Destructive (Удаление)**
```tsx
<Button variant="destructive">Удалить</Button>
```
Стиль:
- Фон: `bg-destructive` (#d4183d)
- Текст: Белый
- Hover: Темнее на 10%

**Outline (Второстепенная)**
```tsx
<Button variant="outline">Отмена</Button>
```
Стиль:
- Фон: Прозрачный
- Граница: `border border-slate-200`
- Текст: `text-slate-700`
- Hover: `bg-slate-50`

**Ghost (Без обводки)**
```tsx
<Button variant="ghost">Подробнее</Button>
```
Стиль:
- Фон: Прозрачный
- Граница: Нет
- Hover: `bg-accent`

**Link (Текстовая)**
```tsx
<Button variant="link">Узнать больше</Button>
```
Стиль:
- Как ссылка: `underline-offset-4 hover:underline`
- Цвет: `text-primary`

---

#### Размеры

```tsx
<Button size="sm">Малая</Button>      {/* h-9, px-3, text-sm */}
<Button size="default">Средняя</Button> {/* h-10, px-4, text-base */}
<Button size="lg">Большая</Button>     {/* h-11, px-8, text-lg */}
<Button size="icon">🔔</Button>        {/* h-10 w-10, квадрат */}
```

---

#### С иконками

```tsx
import { Send } from 'lucide-react';

<Button>
  <Send className="mr-2 h-4 w-4" />
  Отправить
</Button>
```

**Правила иконок в кнопках**:
- Размер иконки: `h-4 w-4` (16px)
- Отступ от текста: `mr-2` (8px)
- Иконка слева от текста (обычно)

---

#### Состояния

**Disabled**
```tsx
<Button disabled>Недоступно</Button>
```
Стиль: `opacity-50 pointer-events-none`

**Loading**
```tsx
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Загрузка...
</Button>
```

---

### Карточки (Card)

#### Базовая структура

```tsx
<Card className="border border-slate-200 shadow-sm bg-white">
  <CardHeader>
    <CardTitle>Заголовок</CardTitle>
    <CardDescription>Описание</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Основной контент */}
  </CardContent>
  <CardFooter>
    {/* Действия или дополнительная информация */}
  </CardFooter>
</Card>
```

**Стилизация**:
- Граница: `border-slate-200`
- Фон: `bg-white`
- Тень: `shadow-sm`
- Скругление: `rounded-xl` (12px)
- Отступы: `p-6` (24px)

---

#### Варианты карточек

**Интерактивная карточка**
```tsx
<Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer">
  {/* Контент */}
</Card>
```

**Карточка с рамкой**
```tsx
<Card className="border-2 border-purple-200">
  {/* Контент */}
</Card>
```

**Карточка с акцентом**
```tsx
<Card className="border-l-4 border-l-blue-500">
  {/* Левая полоса для статуса */}
</Card>
```

---

### Формы (Input, Label, Textarea)

#### Поле ввода

```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="your@email.com"
    className="border-slate-200 focus:border-purple-300 focus:ring-purple-200"
  />
</div>
```

**Стили Input**:
- Высота: `h-10` (40px)
- Паддинг: `px-3 py-2`
- Граница: `border border-slate-200`
- Focus: `focus:border-purple-300 focus:ring-2 focus:ring-purple-200`
- Скругление: `rounded-md`

---

#### Текстовая область

```tsx
<Textarea
  placeholder="Введите комментарий"
  rows={4}
  className="resize-none"
/>
```

**Стили Textarea**:
- Минимальная высота: `min-h-[80px]`
- Отключение изменения размера: `resize-none`
- Остальное как у Input

---

#### Поле с иконкой

```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
  <Input className="pl-10" placeholder="Поиск..." />
</div>
```

---

### Диалоги (Dialog)

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>Открыть диалог</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Заголовок</DialogTitle>
      <DialogDescription>
        Описание действия
      </DialogDescription>
    </DialogHeader>
    {/* Контент */}
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Отмена
      </Button>
      <Button onClick={handleSave}>Сохранить</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Размеры диалогов**:
- `sm:max-w-sm` — 384px (маленькие формы)
- `sm:max-w-md` — 448px (стандарт)
- `sm:max-w-lg` — 512px (большие формы)
- `sm:max-w-4xl` — 896px (сложные интерфейсы)

---

### Бейджи (Badge)

```tsx
<Badge variant="default">Активный</Badge>
<Badge variant="secondary">Завершен</Badge>
<Badge variant="destructive">Отменен</Badge>
<Badge variant="outline">Черновик</Badge>
```

**Применение**:
- Статусы пациентов
- Категории упражнений
- Приоритеты задач
- Теги

---

### Вкладки (Tabs)

```tsx
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Обзор</TabsTrigger>
    <TabsTrigger value="diagnostics">Диагностика</TabsTrigger>
    <TabsTrigger value="exercises">Упражнения</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">
    {/* Контент обзора */}
  </TabsContent>
  <TabsContent value="diagnostics">
    {/* Контент диагностики */}
  </TabsContent>
</Tabs>
```

**Стили TabsTrigger**:
- Неактивная: `text-slate-600`
- Активная: `text-slate-900 border-b-2 border-purple-500`
- Hover: `text-slate-900`

---

### Таблицы (Table)

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Имя</TableHead>
      <TableHead>Возраст</TableHead>
      <TableHead>Статус</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">Иван Иванов</TableCell>
      <TableCell>5 лет</TableCell>
      <TableCell><Badge>Активный</Badge></TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Стилизация**:
- Граница строк: `border-b border-slate-200`
- Hover строки: `hover:bg-slate-50`
- Паддинг ячейки: `p-4`
- Заголовок: `font-medium text-slate-900`

---

### Прогресс-бар (Progress)

```tsx
<Progress value={65} className="h-2" />
```

**Цвета по значению**:
- 0-33%: Красный (`bg-red-500`)
- 34-66%: Желтый (`bg-yellow-500`)
- 67-100%: Зеленый (`bg-green-500`)

---

### Календарь (Calendar)

```tsx
<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  className="rounded-md border"
/>
```

**Применение**:
- Выбор даты консультации
- Планирование упражнений
- Просмотр истории

---

### Уведомления (Toast / Sonner)

```tsx
import { toast } from 'sonner';

// Успех
toast.success('Данные сохранены');

// Ошибка
toast.error('Не удалось сохранить');

// Предупреждение
toast.warning('Проверьте введенные данные');

// Информация
toast.info('Новое сообщение от специалиста');
```

**Позиционирование**: Правый верхний угол
**Длительность**: 3 секунды
**Анимация**: Slide-in from right

---

## 🎯 Иконография

### Библиотека иконок

**Lucide React** — 280+ минималистичных SVG иконок

```tsx
import {
  Users, Calendar, MessageSquare,
  Bell, Settings, LogOut
} from 'lucide-react';
```

---

### Размеры иконок

| Размер | Класс | Пиксели | Применение |
|--------|-------|---------|------------|
| XS | `h-3 w-3` | 12px | Индикаторы в бейджах |
| SM | `h-4 w-4` | 16px | **Стандарт** в кнопках, меню |
| MD | `h-5 w-5` | 20px | Навигация, заголовки |
| LG | `h-6 w-6` | 24px | Главные действия |
| XL | `h-8 w-8` | 32px | Декоративные, hero |

---

### Цвета иконок

```tsx
/* Основная иконка */
<Calendar className="h-5 w-5 text-slate-700" />

/* Вторичная иконка */
<Bell className="h-5 w-5 text-slate-400" />

/* Иконка на цветном фоне */
<Settings className="h-5 w-5 text-white" />

/* Семантическая иконка */
<CheckCircle className="h-5 w-5 text-green-500" />
```

---

### Часто используемые иконки

#### Навигация
- `Home` — Главная
- `Users` — Пациенты
- `Calendar` — Календарь
- `MessageSquare` — Сообщения
- `Book` — Библиотека упражнений

#### Действия
- `Plus` — Добавить
- `Edit` — Редактировать
- `Trash2` — Удалить
- `Save` — Сохранить
- `X` — Закрыть

#### Статусы
- `CheckCircle` — Выполнено
- `Clock` — В процессе
- `AlertCircle` — Внимание
- `XCircle` — Ошибка

#### Интерфейс
- `Search` — Поиск
- `Filter` — Фильтр
- `ChevronDown` — Раскрыть
- `MoreVertical` — Меню действий
- `Eye` — Просмотр

---

## 🎬 Анимация и переходы

### Принципы

1. **Быстрые, но заметные**: 200-300ms
2. **Естественные кривые**: `ease-in-out`, `ease-out`
3. **Только когда нужно**: Не анимируйте все подряд
4. **Респект к пользователю**: `prefers-reduced-motion`

---

### Базовые переходы

```css
/* Универсальный переход */
transition: all 0.2s ease-in-out;

/* Специфичный переход */
transition: opacity 0.3s ease-out, transform 0.3s ease-out;
```

**Tailwind классы**:
```tsx
className="transition-all duration-200 ease-in-out"
className="transition-colors duration-150"
className="transition-transform duration-300"
```

---

### Hover эффекты

#### Карточки
```tsx
<Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
```

#### Кнопки
```tsx
<Button className="hover:scale-105 transition-transform duration-200">
```

#### Ссылки
```tsx
<a className="hover:text-purple-600 transition-colors duration-150">
```

---

### Анимация появления

```tsx
/* Fade in */
<div className="animate-in fade-in duration-300">

/* Slide in from bottom */
<div className="animate-in slide-in-from-bottom-4 duration-500">

/* Slide in from right */
<div className="animate-in slide-in-from-right-4 duration-300">
```

---

### Скелетоны загрузки

```tsx
<Skeleton className="h-12 w-full" />

/* Анимация пульсации */
.skeleton {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

---

### Респект к доступности

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## ♿ Accessibility (Доступность)

### Контраст

**Минимальные требования WCAG 2.1 AA**:
- Обычный текст: **4.5:1**
- Крупный текст (18px+): **3:1**
- Интерактивные элементы: **3:1**

**Проверка**: Используйте [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

### Клавиатурная навигация

**Все интерактивные элементы должны**:
1. Быть доступными через `Tab`
2. Иметь видимый фокус: `focus:ring-2 focus:ring-purple-500`
3. Активироваться через `Enter` или `Space`

```tsx
/* Правильный фокус */
<Button className="focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
  Действие
</Button>
```

---

### ARIA атрибуты

#### Кнопки
```tsx
<Button aria-label="Удалить пациента">
  <Trash2 className="h-4 w-4" />
</Button>
```

#### Диалоги
```tsx
<Dialog>
  <DialogContent aria-describedby="dialog-description">
    <DialogTitle>Заголовок</DialogTitle>
    <DialogDescription id="dialog-description">
      Описание
    </DialogDescription>
  </DialogContent>
</Dialog>
```

#### Формы
```tsx
<Input
  aria-invalid={hasError}
  aria-describedby="email-error"
/>
{hasError && (
  <span id="email-error" className="text-sm text-red-500">
    Некорректный email
  </span>
)}
```

---

### Семантическая HTML

```tsx
/* ❌ Плохо */
<div onClick={handleClick}>Кликни меня</div>

/* ✅ Хорошо */
<button onClick={handleClick}>Кликни меня</button>
```

**Используйте правильные теги**:
- `<button>` для кнопок
- `<a>` для ссылок
- `<nav>` для навигации
- `<main>` для основного контента
- `<h1>-<h6>` для заголовков

---

### Альтернативный текст

```tsx
/* Декоративные изображения */
<img src="..." alt="" role="presentation" />

/* Информативные изображения */
<img src="avatar.jpg" alt="Фото пациента Ив��н Иванов" />
```

---

## 🎨 Темизация

### Переключение темы

```tsx
import { useTheme } from 'next-themes';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  );
}
```

---

### CSS переменные для темизации

```css
/* Light mode */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.156 0.041 264.53);
  --primary: #030213;
  --primary-foreground: oklch(1 0 0);
}

/* Dark mode */
.dark {
  --background: oklch(0.15 0.002 264.53);
  --foreground: oklch(0.984 0.003 264.53);
  --primary: oklch(1 0 0);
  --primary-foreground: oklch(0.15 0.002 264.53);
}
```

---

### Рекомендации по темной теме

1. **Не используйте чистый черный**: `oklch(0.15 ...)` вместо `#000000`
2. **Снизьте насыщенность цветов**: Яркие цвета режут глаза
3. **Увеличьте контраст текста**: Белый на темном сложнее читать
4. **Тестируйте в темноте**: Реальные условия использования

---

## 📚 Паттерны использования

### Списки пациентов/карточек

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {patients.map(patient => (
    <Card key={patient.id} className="hover:-translate-y-1 transition-all">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{patient.name}</CardTitle>
          <Badge>{patient.status}</Badge>
        </div>
        <CardDescription>
          {patient.age} лет • {patient.diagnosis}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Прогресс, последняя активность */}
      </CardContent>
      <CardFooter>
        <Button className="w-full">Открыть карту</Button>
      </CardFooter>
    </Card>
  ))}
</div>
```

---

### Формы с валидацией

```tsx
<form onSubmit={handleSubmit} className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="name">Имя пациента *</Label>
    <Input
      id="name"
      value={name}
      onChange={(e) => setName(e.target.value)}
      className={errors.name ? 'border-red-500' : ''}
    />
    {errors.name && (
      <p className="text-sm text-red-500">{errors.name}</p>
    )}
  </div>

  <div className="flex gap-3 justify-end">
    <Button type="button" variant="outline" onClick={onCancel}>
      Отмена
    </Button>
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? 'Сохранение...' : 'Сохранить'}
    </Button>
  </div>
</form>
```

---

### Пустые состояния (Empty States)

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <Users className="h-12 w-12 text-slate-300 mb-4" />
  <h3 className="text-lg font-semibold text-slate-900 mb-2">
    Нет пациентов
  </h3>
  <p className="text-sm text-slate-500 mb-6">
    Добавьте первого пациента, чтобы начать работу
  </p>
  <Button onClick={handleAddPatient}>
    <Plus className="mr-2 h-4 w-4" />
    Добавить пациента
  </Button>
</div>
```

---

### Состояния загрузки

```tsx
{isLoading ? (
  <div className="space-y-4">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-16 w-2/3" />
  </div>
) : (
  <div>{/* Реальный контент */}</div>
)}
```

---

### Подтверждающие диалоги

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Удалить</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
      <AlertDialogDescription>
        Это действие необратимо. Данные пациента будут удалены навсегда.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Отмена</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>
        Удалить
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## 📦 Экспорт токенов для дизайнеров

### Figma Tokens (JSON)

```json
{
  "colors": {
    "primary": {
      "value": "#030213",
      "type": "color"
    },
    "slate": {
      "50": { "value": "oklch(0.984 0.003 264.53)", "type": "color" },
      "900": { "value": "oklch(0.156 0.041 264.53)", "type": "color" }
    }
  },
  "spacing": {
    "1": { "value": "4px", "type": "spacing" },
    "4": { "value": "16px", "type": "spacing" },
    "6": { "value": "24px", "type": "spacing" }
  },
  "typography": {
    "base": {
      "fontSize": { "value": "16px" },
      "lineHeight": { "value": "1.5" }
    }
  }
}
```

---

## 🚦 Состояния компонентов

### Ошибки
- **Токены:** фон `--destructive`/`--destructive-light`, текст `--destructive-foreground`, иконка `AlertTriangle` 20px.  
- **Формы:** сообщение об ошибке под полем `text-sm text-destructive`, обязательно содержит указание, как исправить. Граница поля: `border-destructive` + `focus:ring-destructive/20`.  
- **Глобальные ошибки:** `Alert` компонент с действиями «Повторить» или «Связаться с поддержкой». На мобильных размещается под заголовком экрана.  
- **Чек-лист для дизайнеров:**  
  1. Ошибка содержит заголовок, описание и CTA.  
  2. Есть иконка с семантическим цветом.  
  3. Для критических ошибок предусмотрены fallback-логи (код ошибки).  
- **Состояние CJM:** при назначении упражнений ошибка коммуникации показывает блок «Сохранено как черновик» и предлагает повторить отправку.

### Загрузка
- **Типы:** inline spinner (`Loader2`), skeleton (`Skeleton` компонент), progress bar.  
- **Правила:** загрузка > 500 мс — skeleton; < 500 мс — спиннер. Skeleton повторяет структуру контента (3-5 строк, круги для аватаров).  
- **Кнопки:** `disabled` + `animate-spin`, текст всегда `Загрузка…`.  
- **Страницы:** полноэкранный loader с логотипом использовать только при первой сессии.  
- **Чек-лист:**  
  1. Кнопка с загрузкой блокирует повторное действие.  
  2. На мобильном skeleton не должен вызывать скролл.  
  3. Для долгих процессов отображается прогресс в процентах или количестве шагов.  
- **Состояние CJM:** в онбординге родителя прогресс-бар показывает шаг/из шага, кнопка «Далее» меняет текст на «Сохраняем…».

### Пустые экраны
- **Компоненты:** `EmptyState` (иконка, заголовок, описание, CTA). Иконка 64px, фон `--accent`.  
- **Правила:** у пустого состояния всегда есть действие: «Назначить упражнение», «Добавить ребенка», «Загрузить отчет».  
- **Тон сообщений:** поддерживающий, без технического жаргона.  
- **Чек-лист:**  
  1. Отображается иллюстрация или контурная иконка.  
  2. Описание объясняет, почему экран пустой.  
  3. CTA ведёт к основному действию, вторичное — к обучающему материалу.  
- **Состояние CJM:** в модуле отчетов пустой экран предлагает посмотреть видео-инструкцию и отправить тестовый отчет.

### Успех
- **Цвета:** `--success` для иконки/рамки, фон `--success-light/20`.  
- **Компонент:** `InlineBanner` с иконкой `CheckCircle`.  
- **Поведение:** баннер скрывается автоматически через 4 с или по действию пользователя; на мобильном появляется в верхней части экрана.  
- **Чек-лист:**  
  1. Сообщение говорит, что сделано, и что делать дальше.  
  2. Не перекрывает основной контент.  
  3. Для завершения маршрута сопровождается подсказкой «Поделитесь результатами с родителями».

---

## 📱 Адаптивность

### Breakpoints
| Breakpoint | Размер | Основные сценарии |
| --- | --- | --- |
| `lg` (≥1280px) | Рабочие станции специалистов | Многоколонные дашборды, таблицы, расширенные фильтры |
| `md` (768–1279px) | Планшеты, ноутбуки | 2-колоночные формы, боковые панели складываются в аккордеон |
| `sm` (<768px) | Смартфоны родителей | Одноколоночные списки, крупные CTA |

### Правила
- **Сетка:** колонки перестраиваются 12 → 8 → 4. Карточки занимают `col-span-12`/`8`/`4` соответственно.  
- **Типографика:** H1 уменьшается на 1 шаг на мобильном (например, `text-3xl` вместо `text-4xl`). Вторичный текст не ниже 14px.  
- **Интерактив:** минимальная площадь тапа 44×44px, отступы между CTA ≥ 12px.  
- **Навигация:** на мобильном persistent bottom bar с ключевыми разделами (Дом, Задания, Сообщения, Профиль). На desktop — side nav с hover/tooltip.  
- **Диаграммы:** на устройствах < 360px переключаются в stacked-list.  
- **Проверка:** каждый экран проходит контроль по чек-листу адаптивности:
  1. Контент читаем без горизонтального скролла.  
  2. Основное действие находится в зоне большого пальца (нижняя половина).  
  3. Формы имеют автоподстановку клавиатур (email, number).  
  4. Модальные окна на мобильном превращаются в full-screen sheet.

---

## 🧭 Контрольные паттерны CJM

### CJM 1 — Онбординг родителя
- **Структура:** ProgressStepper (4 шага), карточки с выбором (checkbox cards), подтверждение данных ребенка.  
- **Состояния:** сохранение черновика (`toast` успеха), ошибки сети → сохраняем локально и предлагаем повторить.  
- **Контент:** тон «поддерживающий», минимизация медицинских терминов, подсказки со ссылками на FAQ.  
- **Чек-лист дизайнера:**  
  1. Каждый шаг занимает ≤15 элементов ввода.  
  2. CTA «Далее»/«Назад» всегда доступны; на мобильном закреплены внизу.  
  3. Предусмотрен шаг подтверждения согласий (checkbox + ссылка на политику).  
- **Empty state:** если нет добавленных детей — карточка «Добавьте ребенка», кнопка открывает модал с формой.

### CJM 5 — Назначение упражнения
- **Компоненты:** Drawer из списка упражнений, фильтры по цели/возрасту, превью карточка.  
- **Поток:** выбор упражнения → настройка частоты → подтверждение.  
- **Состояния:**  
  - При длинной загрузке списка: skeleton из 3 карточек.  
  - Ошибка сохранения → баннер «Упражнение сохранено как черновик».  
  - Успех → toast + redirect на карточку маршрута.  
- **Чек-лист:**  
  1. Фильтры доступны без скролла; на мобильном сворачиваются в `FilterSheet`.  
  2. Обязательные поля помечены `*` и валидируются inline.  
  3. Внизу показывается резюме назначения (частота, длительность, дедлайн).

### CJM 11 — Отчет родителя
- **Интерфейс:** Wizard с тремя секциями (прогресс, настроение, медиа).  
- **Состояния:**  
  - Загрузка медиа — прогресс-бар + возможность продолжить в фоне.  
  - Пустой отчет → подсказка с примером текста и видео.  
  - Отправка — кнопка «Отправить» переходит в «Отправляем…», после успеха показываем экран благодарности и CTA «Посмотреть рекомендации».  
- **Доступность:** большие кликабельные карточки настроения, голосовой ввод на мобильном.  
- **Чек-лист:**  
  1. Каждое поле имеет placeholder и helper text.  
  2. Есть индикатор затраченного времени (`duration`), собираемый автоматически.  
  3. После отправки отчет можно отредактировать в течение 1 часа (баннер с таймером).

---

## 🔄 История изменений

### v1.0.0 (28.10.2025)
- Первая версия дизайн-системы
- Определены цветовая палитра, типографика, отступы
- Документированы 50+ компонентов Shadcn/ui
- Добавлены паттерны использования
- Рекомендации по accessibility

---

## 📞 Поддержка

Вопросы по дизайн-системе:
- GitHub Issues: [ссылка на репозиторий]
- Email: design@neiro.app
- Figma: [ссылка на дизайн-файл]

---

**Статус документа**: 🟢 Актуален
**Следующий пересмотр**: 28.01.2026
