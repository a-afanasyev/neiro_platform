# Neiro Platform UI Kit

**Версия**: 1.0.0
**Дата**: 28 октября 2025

Практическое руководство по использованию UI компонентов платформы Neiro.

---

## 📖 Содержание

1. [Быстрый старт](#быстрый-старт)
2. [Базовые компоненты](#базовые-компоненты)
3. [Сложные компоненты](#сложные-компоненты)
4. [Композитные паттерны](#композитные-паттерны)
5. [Специфичные для Neiro](#специфичные-для-neiro)
6. [Do's and Don'ts](#dos-and-donts)

---

## 🚀 Быстрый старт

### Установка компонента

Все компоненты находятся в `/src/components/ui/` и уже установлены.

### Импорт компонента

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
```

### Базовое использование

```tsx
export default function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Привет, Neiro!</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Введите имя пациента" />
        <Button className="mt-4">Сохранить</Button>
      </CardContent>
    </Card>
  );
}
```

---

## 🧱 Базовые компоненты

### Button (Кнопка)

#### Варианты

**Default — основная кнопка**
```tsx
<Button>Сохранить изменения</Button>
```
Использование: Главное действие на странице (максимум 1-2)

**Outline — второстепенная кнопка**
```tsx
<Button variant="outline">Отмена</Button>
```
Использование: Действия второй важности, альтернативные пути

**Destructive — удаление**
```tsx
<Button variant="destructive">Удалить пациента</Button>
```
Использование: Только для необратимых действий (удаление, сброс)

**Ghost — тихая кнопка**
```tsx
<Button variant="ghost">Подробнее</Button>
```
Использование: Третьестепенные действия, встроенные в текст

**Link — текстовая ссылка**
```tsx
<Button variant="link">Узнать больше о диагностике</Button>
```
Использование: Переходы на другие страницы, документацию

---

#### Размеры

```tsx
<Button size="sm">Малая</Button>
<Button size="default">Средняя</Button>
<Button size="lg">Большая</Button>
<Button size="icon">
  <Bell className="h-4 w-4" />
</Button>
```

**Рекомендации**:
- Desktop: `size="default"` или `size="lg"`
- Mobile: `size="default"`
- Иконочные кнопки в панелях: `size="icon"`

---

#### С иконками

```tsx
import { Send, Plus, Download } from 'lucide-react';

{/* Иконка слева */}
<Button>
  <Send className="mr-2 h-4 w-4" />
  Отправить отчет
</Button>

{/* Иконка справа */}
<Button>
  Скачать PDF
  <Download className="ml-2 h-4 w-4" />
</Button>

{/* Только иконка */}
<Button size="icon" variant="ghost">
  <Plus className="h-4 w-4" />
</Button>
```

---

#### Состояние загрузки

```tsx
import { Loader2 } from 'lucide-react';

<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Сохранение...
</Button>
```

---

#### Полная ширина (mobile)

```tsx
<Button className="w-full sm:w-auto">
  Создать маршрут
</Button>
```

---

### ✅ Do's and ❌ Don'ts

| ✅ Do | ❌ Don't |
|-------|----------|
| Используйте `variant="default"` для главного действия | Не используйте больше 2 `default` кнопок рядом |
| Добавляйте иконки для узнаваемости действия | Не используйте иконки без текста (кроме `size="icon"`) |
| Используйте `disabled` при загрузке | Не скрывайте кнопку во время загрузки |
| Кнопки удаления всегда `variant="destructive"` | Не используйте `destructive` для отмены |

---

### Input (Поле ввода)

#### Базовое использование

```tsx
<Input
  type="text"
  placeholder="Введите имя пациента"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
```

---

#### С label

```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email специалиста</Label>
  <Input
    id="email"
    type="email"
    placeholder="doctor@example.com"
  />
</div>
```

---

#### С иконкой

```tsx
import { Search, Mail, Lock } from 'lucide-react';

{/* Иконка слева */}
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
  <Input className="pl-10" placeholder="Поиск пациентов..." />
</div>

{/* Иконка справа */}
<div className="relative">
  <Input type="email" placeholder="Email" className="pr-10" />
  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
</div>
```

---

#### С ошибкой

```tsx
<div className="space-y-2">
  <Label htmlFor="age">Возраст</Label>
  <Input
    id="age"
    type="number"
    className={errors.age ? 'border-red-500 focus:ring-red-500' : ''}
  />
  {errors.age && (
    <p className="text-sm text-red-500">{errors.age}</p>
  )}
</div>
```

---

#### Disabled состояние

```tsx
<Input disabled value="Не редактируемое поле" />
```

---

### ✅ Do's and ❌ Don'ts

| ✅ Do | ❌ Don't |
|-------|----------|
| Всегда используйте `<Label>` с `htmlFor` | Не используйте `placeholder` вместо `label` |
| Показывайте ошибки под полем красным текстом | Не скрывайте ошибки в тултипах |
| Используйте правильный `type` (email, tel, number) | Не используйте `type="text"` для всего |
| Иконки помогают понять назначение поля | Не перегружайте иконками каждое поле |

---

### Label (Метка)

```tsx
<Label htmlFor="diagnosis">Диагноз</Label>
<Input id="diagnosis" />
```

**Обязательные поля**:
```tsx
<Label htmlFor="name">
  Имя пациента <span className="text-red-500">*</span>
</Label>
```

---

### Textarea (Текстовая область)

```tsx
<div className="space-y-2">
  <Label htmlFor="notes">Примечания к сеансу</Label>
  <Textarea
    id="notes"
    placeholder="Опишите поведение ребенка, особенности выполнения упражнений..."
    rows={4}
    className="resize-none"
  />
</div>
```

**Рекомендации**:
- Для коротких заметок: `rows={3}`
- Для подробных описаний: `rows={6-8}`
- Всегда `resize-none` для единообразия

---

### Select (Выпадающий список)

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

<Select value={category} onValueChange={setCategory}>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Выберите категорию" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="cognitive">Когнитивное развитие</SelectItem>
    <SelectItem value="speech">Развитие речи</SelectItem>
    <SelectItem value="motor">Моторика</SelectItem>
    <SelectItem value="social">Социальные навыки</SelectItem>
  </SelectContent>
</Select>
```

---

### Checkbox (Чекбокс)

```tsx
import { Checkbox } from '@/components/ui/checkbox';

<div className="flex items-center space-x-2">
  <Checkbox
    id="terms"
    checked={agreed}
    onCheckedChange={setAgreed}
  />
  <Label
    htmlFor="terms"
    className="text-sm font-normal cursor-pointer"
  >
    Я согласен с условиями обработки персональных данных
  </Label>
</div>
```

**Группа чекбоксов**:
```tsx
<div className="space-y-3">
  <Label>Выберите дни занятий:</Label>
  {['Понедельник', 'Среда', 'Пятница'].map((day) => (
    <div key={day} className="flex items-center space-x-2">
      <Checkbox id={day} />
      <Label htmlFor={day} className="font-normal">{day}</Label>
    </div>
  ))}
</div>
```

---

### Radio Group (Радио кнопки)

```tsx
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

<RadioGroup value={difficulty} onValueChange={setDifficulty}>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="easy" id="easy" />
    <Label htmlFor="easy">Легкий</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="medium" id="medium" />
    <Label htmlFor="medium">Средний</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="hard" id="hard" />
    <Label htmlFor="hard">Сложный</Label>
  </div>
</RadioGroup>
```

---

### Switch (Переключатель)

```tsx
import { Switch } from '@/components/ui/switch';

<div className="flex items-center justify-between">
  <div className="space-y-0.5">
    <Label htmlFor="notifications">Уведомления</Label>
    <div className="text-sm text-slate-500">
      Получать оповещения о новых сообщениях
    </div>
  </div>
  <Switch
    id="notifications"
    checked={notificationsEnabled}
    onCheckedChange={setNotificationsEnabled}
  />
</div>
```

---

## 🏗️ Сложные компоненты

### Card (Карточка)

#### Базовая структура

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Иван Петров</CardTitle>
    <CardDescription>5 лет • РАС, уровень 2</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-500">Прогресс:</span>
        <span className="font-medium">65%</span>
      </div>
      <Progress value={65} />
    </div>
  </CardContent>
  <CardFooter>
    <Button className="w-full">Открыть карту</Button>
  </CardFooter>
</Card>
```

---

#### Интерактивная карточка

```tsx
<Card
  className="cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
  onClick={() => navigate(`/patient/${patient.id}`)}
>
  {/* Контент */}
</Card>
```

---

#### Карточка со статусом

```tsx
<Card className="border-l-4 border-l-green-500">
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Упражнение выполнено</CardTitle>
      <Badge variant="default">Сегодня</Badge>
    </div>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-slate-600">
      "Сортировка по цветам" — успешно выполнено без ошибок
    </p>
  </CardContent>
</Card>
```

---

#### Сетка карточек

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {patients.map((patient) => (
    <Card key={patient.id}>
      {/* Контент карточки */}
    </Card>
  ))}
</div>
```

---

### Dialog (Диалоговое окно)

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>Добавить пациента</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Новый пациент</DialogTitle>
      <DialogDescription>
        Заполните основную информацию о ребенке
      </DialogDescription>
    </DialogHeader>

    {/* Форма */}
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Имя</Label>
        <Input id="name" placeholder="Введите имя" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="age">Возраст</Label>
        <Input id="age" type="number" placeholder="5" />
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Отмена
      </Button>
      <Button onClick={handleSave}>Сохранить</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

#### Alert Dialog (Подтверждение)

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Удалить пациента</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Вы абсолютно уверены?</AlertDialogTitle>
      <AlertDialogDescription>
        Это действие необратимо. Все данные о пациенте, включая историю
        упражнений и результаты диагностики, будут удалены навсегда.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Отмена</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete} className="bg-red-500">
        Да, удалить
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

### Tabs (Вкладки)

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

<Tabs defaultValue="overview" className="w-full">
  <TabsList className="grid w-full grid-cols-4">
    <TabsTrigger value="overview">Обзор</TabsTrigger>
    <TabsTrigger value="diagnostics">Диагностика</TabsTrigger>
    <TabsTrigger value="exercises">Упражнения</TabsTrigger>
    <TabsTrigger value="reports">Отчеты</TabsTrigger>
  </TabsList>

  <TabsContent value="overview" className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle>Общая информация</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Контент обзора */}
      </CardContent>
    </Card>
  </TabsContent>

  <TabsContent value="diagnostics">
    {/* Контент диагностики */}
  </TabsContent>

  {/* Остальные вкладки */}
</Tabs>
```

---

### Accordion (Аккордеон)

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

<Accordion type="single" collapsible className="w-full">
  <AccordionItem value="item-1">
    <AccordionTrigger>Когнитивное развитие (12 упражнений)</AccordionTrigger>
    <AccordionContent>
      <div className="space-y-2">
        {exercises.cognitive.map((ex) => (
          <div key={ex.id} className="p-3 border rounded-lg">
            {ex.title}
          </div>
        ))}
      </div>
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="item-2">
    <AccordionTrigger>Развитие речи (8 упражнений)</AccordionTrigger>
    <AccordionContent>
      {/* Контент */}
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

**Множественное раскрытие**:
```tsx
<Accordion type="multiple" className="w-full">
  {/* Можно раскрыть несколько секций одновременно */}
</Accordion>
```

---

### Table (Таблица)

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Имя пациента</TableHead>
      <TableHead>Возраст</TableHead>
      <TableHead>Последний визит</TableHead>
      <TableHead>Статус</TableHead>
      <TableHead className="text-right">Действия</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {patients.map((patient) => (
      <TableRow key={patient.id} className="cursor-pointer hover:bg-slate-50">
        <TableCell className="font-medium">{patient.name}</TableCell>
        <TableCell>{patient.age} лет</TableCell>
        <TableCell>{formatDate(patient.lastVisit)}</TableCell>
        <TableCell>
          <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
            {patient.statusLabel}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

### Badge (Бейдж)

```tsx
import { Badge } from '@/components/ui/badge';

{/* Статусы */}
<Badge variant="default">Активный</Badge>
<Badge variant="secondary">Завершен</Badge>
<Badge variant="destructive">Отменен</Badge>
<Badge variant="outline">Черновик</Badge>

{/* С иконками */}
<Badge className="gap-1">
  <CheckCircle className="h-3 w-3" />
  Выполнено
</Badge>

{/* Цветные */}
<Badge className="bg-green-100 text-green-800 hover:bg-green-200">
  В норме
</Badge>
<Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
  Требует внимания
</Badge>
```

---

### Avatar (Аватар)

```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

<Avatar>
  <AvatarImage src={user.avatar} alt={user.name} />
  <AvatarFallback>ИП</AvatarFallback>
</Avatar>

{/* Размеры */}
<Avatar className="h-8 w-8">  {/* Маленький */}
<Avatar className="h-10 w-10"> {/* Средний (default) */}
<Avatar className="h-16 w-16"> {/* Большой */}
```

**С именем рядом**:
```tsx
<div className="flex items-center gap-3">
  <Avatar>
    <AvatarImage src={specialist.avatar} />
    <AvatarFallback>{specialist.initials}</AvatarFallback>
  </Avatar>
  <div>
    <div className="font-medium">{specialist.name}</div>
    <div className="text-sm text-slate-500">{specialist.role}</div>
  </div>
</div>
```

---

### Progress (Прогресс-бар)

```tsx
import { Progress } from '@/components/ui/progress';

<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span className="text-slate-600">Прогресс выполнения</span>
    <span className="font-medium">{progress}%</span>
  </div>
  <Progress value={progress} className="h-2" />
</div>
```

**Цветной прогресс**:
```tsx
<Progress
  value={85}
  className="h-2 [&>div]:bg-green-500"
/>
```

---

### Calendar (Календарь)

```tsx
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';

const [date, setDate] = useState<Date | undefined>(new Date());

<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  className="rounded-md border"
/>
```

**Диапазон дат**:
```tsx
import { DateRange } from 'react-day-picker';

const [dateRange, setDateRange] = useState<DateRange | undefined>();

<Calendar
  mode="range"
  selected={dateRange}
  onSelect={setDateRange}
/>
```

---

### Popover (Всплывающее окно)

```tsx
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">
      <CalendarIcon className="mr-2 h-4 w-4" />
      {date ? format(date, 'dd.MM.yyyy') : 'Выберите дату'}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0" align="start">
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
    />
  </PopoverContent>
</Popover>
```

---

### Tooltip (Подсказка)

```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon">
        <HelpCircle className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Нажмите для получения помощи</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

### Dropdown Menu (Выпадающее меню)

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreVertical className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>Действия</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={handleEdit}>
      <Edit className="mr-2 h-4 w-4" />
      Редактировать
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleCopy}>
      <Copy className="mr-2 h-4 w-4" />
      Дублировать
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem
      className="text-red-600"
      onClick={handleDelete}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      Удалить
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

### Toast / Sonner (Уведомления)

```tsx
import { toast } from 'sonner';

// Успех
toast.success('Данные пациента сохранены');

// Ошибка
toast.error('Не удалось загрузить данные');

// Предупреждение
toast.warning('Заполните все обязательные поля');

// Информация
toast.info('У вас новое сообщение от специалиста');

// С действием
toast('Упражнение назначено', {
  action: {
    label: 'Отменить',
    onClick: () => handleUndo(),
  },
});

// С описанием
toast.success('Маршрут обновлен', {
  description: 'Изменения будут видны родителю в течение 5 минут',
});
```

---

### Skeleton (Загрузка)

```tsx
import { Skeleton } from '@/components/ui/skeleton';

{/* Загрузка карточки */}
<Card>
  <CardHeader>
    <Skeleton className="h-6 w-32" />
    <Skeleton className="h-4 w-48 mt-2" />
  </CardHeader>
  <CardContent>
    <Skeleton className="h-20 w-full" />
  </CardContent>
</Card>

{/* Загрузка списка */}
<div className="space-y-3">
  {[1, 2, 3].map((i) => (
    <Skeleton key={i} className="h-12 w-full" />
  ))}
</div>
```

---

## 🎭 Композитные паттерны

### Форма регистрации пациента

```tsx
function AddPatientForm() {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    diagnosis: '',
    parentEmail: '',
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">
            Имя ребенка <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Введите имя"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">
            Возраст <span className="text-red-500">*</span>
          </Label>
          <Input
            id="age"
            type="number"
            min="2"
            max="15"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="diagnosis">Диагноз</Label>
        <Select
          value={formData.diagnosis}
          onValueChange={(value) => setFormData({ ...formData, diagnosis: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите диагноз" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asd-1">РАС, уровень 1</SelectItem>
            <SelectItem value="asd-2">РАС, уровень 2</SelectItem>
            <SelectItem value="asd-3">РАС, уровень 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="parentEmail">Email родителя</Label>
        <Input
          id="parentEmail"
          type="email"
          value={formData.parentEmail}
          onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
          placeholder="parent@example.com"
        />
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit">
          Добавить пациента
        </Button>
      </div>
    </form>
  );
}
```

---

### Карточка пациента

```tsx
function PatientCard({ patient, onSelect }: PatientCardProps) {
  return (
    <Card
      className="cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
      onClick={() => onSelect(patient.id)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={patient.avatar} />
              <AvatarFallback>{patient.initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{patient.name}</CardTitle>
              <CardDescription>
                {patient.age} лет • {patient.diagnosis}
              </CardDescription>
            </div>
          </div>
          <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
            {patient.statusLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Прогресс маршрута:</span>
            <span className="font-medium">{patient.progress}%</span>
          </div>
          <Progress value={patient.progress} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2 border-t">
          <div>
            <div className="text-xs text-slate-500">Упражнений</div>
            <div className="text-lg font-semibold">{patient.exercisesCompleted}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Диагностик</div>
            <div className="text-lg font-semibold">{patient.diagnosticsCount}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Дней</div>
            <div className="text-lg font-semibold">{patient.daysInProgram}</div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={(e) => {
          e.stopPropagation();
          handleMessage(patient.id);
        }}>
          <MessageSquare className="mr-2 h-4 w-4" />
          Написать
        </Button>
        <Button className="flex-1">
          Открыть карту
        </Button>
      </CardFooter>
    </Card>
  );
}
```

---

### Статистическая панель

```tsx
function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Всего пациентов</CardDescription>
          <CardTitle className="text-3xl">{stats.totalPatients}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm">
            <Badge className="bg-green-100 text-green-800">
              +12%
            </Badge>
            <span className="text-slate-500">за месяц</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Активные маршруты</CardDescription>
          <CardTitle className="text-3xl">{stats.activeRoutes}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm">
            <Badge className="bg-blue-100 text-blue-800">
              {stats.activeRoutes}/{stats.totalPatients}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Выполнено упражнений</CardDescription>
          <CardTitle className="text-3xl">{stats.completedExercises}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm">
            <Badge className="bg-purple-100 text-purple-800">
              Эта неделя
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardDescription>Средний прогресс</CardDescription>
          <CardTitle className="text-3xl">{stats.avgProgress}%</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={stats.avgProgress} className="h-2" />
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### Пустое состояние

```tsx
function EmptyState({ onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-slate-100 p-6 mb-4">
        <Users className="h-12 w-12 text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">
        Нет пациентов
      </h3>
      <p className="text-slate-500 mb-6 max-w-sm">
        Добавьте первого пациента, чтобы начать работу с коррекционными маршрутами
      </p>
      <Button onClick={onAction}>
        <Plus className="mr-2 h-4 w-4" />
        Добавить пациента
      </Button>
    </div>
  );
}
```

---

### Поиск с фильтрами

```tsx
function SearchAndFilter() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Поиск */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              className="pl-10"
              placeholder="Поиск упражнений..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Фильтр по категории */}
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Категория" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              <SelectItem value="cognitive">Когнитивное</SelectItem>
              <SelectItem value="speech">Речь</SelectItem>
              <SelectItem value="motor">Моторика</SelectItem>
            </SelectContent>
          </Select>

          {/* Фильтр по сложности */}
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Сложность" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Любая</SelectItem>
              <SelectItem value="easy">Легкая</SelectItem>
              <SelectItem value="medium">Средняя</SelectItem>
              <SelectItem value="hard">Сложная</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 🎯 Специфичные для Neiro

### Карточка упражнения

```tsx
function ExerciseCard({ exercise, onAssign }: ExerciseCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{exercise.title}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{exercise.category}</Badge>
              <Badge className={getDifficultyColor(exercise.difficulty)}>
                {exercise.difficultyLabel}
              </Badge>
              <Badge variant="secondary">{exercise.ageRange}</Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm text-slate-600 mb-4">
          {exercise.description}
        </p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Clock className="h-4 w-4" />
            <span>{exercise.duration} минут</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Target className="h-4 w-4" />
            <span>{exercise.goal}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button variant="outline" className="flex-1">
          Подробнее
        </Button>
        <Button className="flex-1" onClick={() => onAssign(exercise.id)}>
          <Plus className="mr-2 h-4 w-4" />
          Назначить
        </Button>
      </CardFooter>
    </Card>
  );
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'hard':
      return 'bg-red-100 text-red-800';
    default:
      return '';
  }
}
```

---

### Таймлайн событий

```tsx
function EventTimeline({ events }: TimelineProps) {
  return (
    <div className="space-y-6">
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-4">
          {/* Линия и точка */}
          <div className="flex flex-col items-center">
            <div className={`rounded-full p-2 ${getEventColor(event.type)}`}>
              {getEventIcon(event.type)}
            </div>
            {index < events.length - 1 && (
              <div className="w-0.5 h-full bg-slate-200 mt-2" />
            )}
          </div>

          {/* Контент */}
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{event.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {formatDate(event.date)}
                  </CardDescription>
                </div>
                <Badge variant="outline">{event.typeLabel}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">{event.description}</p>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
```

---

### Виджет прогресса ребенка

```tsx
function ChildProgressWidget({ child }: ProgressWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Прогресс {child.name}</CardTitle>
        <CardDescription>За последние 30 дней</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Общий прогресс */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Общий прогресс</span>
            <span className="text-sm font-bold">{child.overallProgress}%</span>
          </div>
          <Progress value={child.overallProgress} className="h-3" />
        </div>

        {/* Прогресс по категориям */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">По направлениям:</h4>
          {child.categoryProgress.map((cat) => (
            <div key={cat.category}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-600">{cat.label}</span>
                <span className="text-xs font-medium">{cat.value}%</span>
              </div>
              <Progress
                value={cat.value}
                className="h-2"
              />
            </div>
          ))}
        </div>

        {/* Достижения */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Выполнено упражнений:</span>
            <span className="text-2xl font-bold text-purple-600">
              {child.completedExercises}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## ✅ Do's and ❌ Don'ts

### Общие принципы

| ✅ Do | ❌ Don't |
|-------|----------|
| Используйте компоненты из `/components/ui/` | Не создавайте кастомные компоненты без необходимости |
| Следуйте spacing системе (4px, 8px, 16px, 24px) | Не используйте произвольные значения (13px, 27px) |
| Группируйте связанные элементы в `<Card>` | Не размещайте все на белом фоне без структуры |
| Используйте семантические цвета для статусов | Не используйте красный для нейтральных действий |
| Добавляйте loading состояния | Не оставляйте кнопки без обратной связи |

---

### Формы

| ✅ Do | ❌ Don't |
|-------|----------|
| Всегда используйте `<Label>` с `htmlFor` | Не используйте placeholder вместо label |
| Группируйте поля в `space-y-4` или `grid` | Не размещайте поля без отступов |
| Показывайте ошибки красным текстом под полем | Не скрывайте ошибки в tooltip |
| Отключайте кнопку submit при невалидной форме | Не позволяйте отправку невалидных данных |

---

### Модальные окна

| ✅ Do | ❌ Don't |
|-------|----------|
| Используйте `DialogTitle` и `DialogDescription` | Не пропускайте заголовок диалога |
| Кнопки действий в `DialogFooter` | Не размещайте кнопки вне footer |
| Destructive действия требуют `AlertDialog` | Не используйте обычный Dialog для удаления |
| Закрывайте диалог после успешного действия | Не оставляйте диалог открытым после save |

---

### Списки и таблицы

| ✅ Do | ❌ Don't |
|-------|----------|
| Используйте `grid` для карточек, `Table` для табличных данных | Не используйте таблицы для карточного макета |
| Добавляйте hover эффекты на интерактивные строки | Не делайте статичные списки без обратной связи |
| Показывайте Empty State если данных нет | Не показывайте пустую страницу |
| Используйте Skeleton во время загрузки | Не показывайте пустой экран при загрузке |

---

## 📚 Полезные ссылки

- [Shadcn/ui документация](https://ui.shadcn.com)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Статус**: 🟢 Актуален
**Версия**: 1.0.0
**Обновлено**: 28.10.2025
