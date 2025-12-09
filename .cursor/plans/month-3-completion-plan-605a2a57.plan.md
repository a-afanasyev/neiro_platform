---
name: Улучшенный план завершения Month 3 - Neiro Platform
overview: ""
todos:
  - id: cbd4b2c0-8d62-45a0-8f51-9b002004e437
    content: "Фаза 1.1: MinIO Setup - создать buckets и настроить политики"
    status: pending
  - id: a8e3e9bd-bcc9-43ae-bccb-9833a0233292
    content: "Фаза 2.1: Analytics Endpoint Naming Fix - исправить /child на /children"
    status: pending
  - id: 0fbae717-d9eb-435c-aa64-d14acc797e5a
    content: "Фаза 2.2: Analytics Granular Endpoints - добавить 4 новых endpoints"
    status: pending
  - id: 0b6bfdea-ba97-447c-a279-6f6e753a7810
    content: "Фаза 2.3: Notification Preferences API - создать routes, controllers, services"
    status: pending
  - id: 8b781642-b78e-4483-82a1-d812d7f96138
    content: "Фаза 3.1.1: MediaUploader Component - создать компонент с drag&drop"
    status: pending
  - id: df5f15bf-135a-4f1d-94a2-fdb29fc50574
    content: "Фаза 3.1.2: ReviewReportDialog Component - создать диалог просмотра отчета"
    status: pending
  - id: 8c72ce15-4c2b-4038-9894-16ecbe619305
    content: "Фаза 3.2.1: Progress Dashboard Page - создать страницу с KPI и графиками"
    status: pending
  - id: 2f42ce11-a8cb-46f5-988a-5203e953dfc2
    content: "Фаза 3.2.2: Charts Implementation - создать LineChart и PieChart компоненты"
    status: pending
  - id: 2f6082d4-2eb3-47a0-ab01-431399bf55b8
    content: "Фаза 3.3.1: NotificationPreferencesDialog - создать диалог настроек уведомлений"
    status: pending
  - id: 7de5f5e9-0486-4774-9acc-43cbc35dd7a3
    content: "Фаза 4.1: Reports List Page - создать страницу со списком отчетов"
    status: pending
  - id: dd390fe9-8c6f-4d8f-919e-76205a645c0c
    content: "Фаза 5.1: Reports E2E Tests - создать 4 теста для reports"
    status: pending
  - id: 83d0dc4c-c30e-4a75-856a-10f5f35a2213
    content: "Фаза 5.2: Progress E2E Tests - создать 3 теста для progress dashboard"
    status: pending
  - id: a7e46af7-2471-4c9b-955e-5854b46f72fe
    content: "Фаза 5.3: Notifications E2E Tests - создать 3 теста для notifications"
    status: pending
---

# Улучшенный план завершения Month 3 - Neiro Platform

**Дата создания:** 2025-11-27

**Текущий статус:** 88% выполнено (36/41 задач)

**Цель:** Завершить оставшиеся 12% для production-ready состояния

**Подход:** По фазам с учетом зависимостей между задачами

---

## ФАЗА 1: Инфраструктура (P0 - Блокеры)

### 1.1 MinIO Setup

**Приоритет:** P0 (блокирует media upload)

**Время:** 10 минут

**Файлы для проверки:** `nero_platform/docker-compose.yml`, `nginx/nginx.conf`

#### Команды выполнения:

```bash
# Проверить статус
docker ps | grep minio

# Если не запущен:
docker-compose up -d minio

# Создать buckets
docker exec neiro_minio mc mb minio/neiro-reports
docker exec neiro_minio mc mb minio/neiro-reports-thumbnails

# Настроить политики
docker exec neiro_minio mc anonymous set download minio/neiro-reports-thumbnails
docker exec neiro_minio mc anonymous set none minio/neiro-reports

# Проверка
docker exec neiro_minio mc ls minio/
```

#### Acceptance Criteria:

- [ ] MinIO доступен на порту 9000
- [ ] Console доступна на порту 9001
- [ ] 2 buckets созданы и видны
- [ ] Thumbnails bucket публичный, reports приватный

#### Риски и митигация:

- **Риск:** Buckets могут удаляться при рестарте Docker
- **Митигация:** Использовать volume mapping в docker-compose.yml

---

## ФАЗА 2: Backend Fixes (P0-P1)

### 2.1 Analytics API - Endpoint Naming Fix

**Приоритет:** P0 (блокирует frontend integration)

**Время:** 30 минут

**Файл:** `nero_platform/services/analytics/src/routes/stats.routes.ts`

#### Проблема:

- Текущий endpoint: `/analytics/v1/child/:childId`
- План требует: `/analytics/v1/children/:childId`
- Frontend ожидает: `/analytics/v1/children/:childId`

#### Решение:

```typescript
// Файл: services/analytics/src/routes/stats.routes.ts
// Строка ~12

// БЫЛО:
router.get('/child/:childId', statsController.getChildStats.bind(statsController));

// СТАНЕТ:
router.get('/children/:childId', statsController.getChildStats.bind(statsController));
```

#### Acceptance Criteria:

- [ ] Endpoint доступен по `/analytics/v1/children/:childId`
- [ ] Старый endpoint удален или deprecated
- [ ] Frontend API client работает без изменений

#### Риски и митигация:

- **Риск:** Frontend может кэшировать старые URL
- **Митигация:** Проверить и очистить кэш после изменения

### 2.2 Analytics API - Granular Endpoints

**Приоритет:** P0 (требуется для детальных dashboard'ов)

**Время:** 3 часа

**Файлы для изменения:**

- `nero_platform/services/analytics/src/routes/stats.routes.ts`
- `nero_platform/services/analytics/src/controllers/stats.controller.ts`
- `nero_platform/services/analytics/src/services/aggregation.service.ts`

#### Решение:

```typescript
// Файл: services/analytics/src/routes/stats.routes.ts
// Добавить после существующих routes

// Detailed assignments statistics
router.get(
  '/children/:childId/assignments-stats',
  statsController.getAssignmentsStats.bind(statsController)
);

// Goals progress tracking
router.get(
  '/children/:childId/goals-progress',
  statsController.getGoalsProgress.bind(statsController)
);

// Timeline of key events
router.get(
  '/children/:childId/timeline',
  statsController.getTimeline.bind(statsController)
);

// Route progress
router.get(
  '/routes/:routeId/progress',
  statsController.getRouteProgress.bind(statsController)
);
```
```typescript
// Файл: services/analytics/src/controllers/stats.controller.ts
// Добавить методы

async getAssignmentsStats(req: Request, res: Response) {
  try {
    const { childId } = req.params;
    const { startDate, endDate } = req.query;
    
    const stats = await this.analyticsService.getAssignmentsStats(
      childId, 
      { startDate: new Date(startDate as string), endDate: new Date(endDate as string) }
    );
    
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async getGoalsProgress(req: Request, res: Response) {
  // Аналогичная реализация
}

async getTimeline(req: Request, res: Response) {
  // Аналогичная реализация
}

async getRouteProgress(req: Request, res: Response) {
  // Аналогичная реализация
}
```

#### Acceptance Criteria:

- [ ] 4 новых endpoints работают
- [ ] Возвращают данные согласно API_CONTRACTS_MVP.md
- [ ] RBAC проверки (parent/specialist) работают
- [ ] Redis caching для тяжелых агрегаций

#### Риски и митигация:

- **Риск:** Высокая нагрузка на БД при агрегациях
- **Митигация:** Добавить Redis кэширование для агрегированных данных

### 2.3 Notification Preferences API

**Приоритет:** P0 (критично для Month 3)

**Время:** 2 часа

**Файлы для создания:**

- `nero_platform/services/notifications/src/routes/preferences.routes.ts` - NEW
- `nero_platform/services/notifications/src/controllers/preferences.controller.ts` - NEW
- `nero_platform/services/notifications/src/services/preferences.service.ts` - NEW

#### Решение:

```typescript
// Файл: services/notifications/src/routes/preferences.routes.ts - NEW
import { Router } from 'express';
import { preferencesController } from '../controllers/preferences.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// Get user's notification preferences
router.get('/', preferencesController.getPreferences.bind(preferencesController));

// Update user's notification preferences
router.patch('/', preferencesController.updatePreferences.bind(preferencesController));

export default router;
```
```typescript
// Файл: services/notifications/src/controllers/preferences.controller.ts - NEW
import { Request, Response } from 'express';
import { preferencesService } from '../services/preferences.service';

export const preferencesController = {
  async getPreferences(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const preferences = await preferencesService.getPreferences(userId);
      
      res.json({ 
        success: true, 
        data: {
          userId,
          preferences: preferences.preferences || {
            emailEnabled: true,
            inAppEnabled: true,
            assignmentReminders: true,
            reportUpdates: true,
            routeChanges: true
          },
          quietHours: preferences.quietHours || {
            enabled: false,
            startTime: "22:00",
            endTime: "08:00"
          }
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async updatePreferences(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { preferences, quietHours } = req.body;
      
      await preferencesService.updatePreferences(userId, { preferences, quietHours });
      
      res.json({ success: true, message: "Preferences updated successfully" });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};
```

#### Acceptance Criteria:

- [ ] GET endpoint возвращает текущие preferences или defaults
- [ ] PATCH endpoint обновляет preferences и validates
- [ ] Quiet hours учитываются в is_notification_allowed() function
- [ ] Unit tests для preferences service

#### Риски и митигация:

- **Риск:** Конфликт preferences при одновременном обновлении
- **Митигация:** Добавить optimistic locking в БД

---

## ФАЗА 3: Frontend Components (P0-P1)

### 3.1 Reports Components (5 компонентов)

#### 3.1.1 MediaUploader.tsx

**Приоритет:** P0 (критично для Week 1)

**Время:** 4 часа

**Путь:** `nero_platform/apps/web/src/components/reports/MediaUploader.tsx` - NEW

#### Решение:

```typescript
// Файл: apps/web/src/components/reports/MediaUploader.tsx - NEW
"use client";

import React, { useState, useCallback } from 'react';
import { Upload, X, FileImage, Video } from 'lucide-react';

interface MediaFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
}

export const MediaUploader: React.FC = () => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const validateFile = (file: File): boolean => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) return false;
    
    const maxSize = isImage ? 10 * 1024 * 1024 : 100 * 1024 * 1024; // 10MB for images, 100MB for videos
    return file.size <= maxSize;
  };

  const generatePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve(''); // Для видео можно добавить плейсхолдер
      }
    });
  };

  const handleFiles = useCallback((newFiles: File[]) => {
    const validFiles = newFiles.filter(validateFile).slice(0, 5 - files.length);
    
    Promise.all(
      validFiles.map(async (file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: await generatePreview(file),
        progress: 0,
        status: 'pending' as const
      }))
    ).then(setFiles);
  }, [files.length]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(Array.from(e.dataTransfer.files));
  }, [handleFiles]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const uploadFile = useCallback(async (file: MediaFile) => {
    // TODO: Интегрировать с mediaApi.generateUploadUrl()
    // TODO: Загрузить в MinIO через presigned URL
    // TODO: Вызвать mediaApi.confirmUpload()
  }, []);

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
      <div
        className={`text-center ${dragActive ? 'bg-blue-50' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-lg">Перетащите файлы сюда</p>
        <p className="text-sm text-gray-500">или нажмите для выбора</p>
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => handleFiles(Array.from(e.target.files || []))}
        />
      </div>
      
      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          {files.map((file) => (
            <div key={file.id} className="relative border rounded-lg p-2">
              {file.preview && (
                <img src={file.preview} alt="Preview" className="h-20 w-full object-cover rounded" />
              )}
              <button
                onClick={() => removeFile(file.id)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
              >
                <X size={12} />
              </button>
              {file.status === 'uploading' && (
                <div className="mt-2">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

#### Acceptance Criteria:

- [ ] Drag & drop работает с визуальным feedback
- [ ] File picker работает
- [ ] Preview отображается для фото
- [ ] Progress bar показывает процент загрузки
- [ ] Валидация размера файла на клиенте
- [ ] Можно удалить файл до отправки формы
- [ ] Limit 5 файлов работает

#### Риски и митигация:

- **Риск:** Presigned URL может истечь во время загрузки
- **Митигация:** Обновлять URL каждые 5 минут для больших файлов

#### 3.1.2 ReviewReportDialog.tsx

**Приоритет:** P1

**Время:** 3 часа

**Путь:** `nero_platform/apps/web/src/components/reports/ReviewReportDialog.tsx` - NEW

#### Решение:

```typescript
// Файл: apps/web/src/components/reports/ReviewReportDialog.tsx - NEW
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ReviewReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  reportData: any;
  onSave: (review: { reviewStatus: string; notes: string }) => void;
}

export const ReviewReportDialog: React.FC<ReviewReportDialogProps> = ({
  open,
  onOpenChange,
  reportId,
  reportData,
  onSave
}) => {
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (notes.length < 10) {
      // Показать ошибку валидации
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({ reviewStatus, notes });
      onOpenChange(false);
    } catch (error) {
      // Показать ошибку
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Отчет по заданию</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Детали отчета */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Детали отчета</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Ребенок:</span> {reportData.childName}
              </div>
              <div>
                <span className="font-medium">Дата:</span> {new Date(reportData.date).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Задание:</span> {reportData.assignmentTitle}
              </div>
              <div>
                <span className="font-medium">Настроение:</span> {reportData.mood}
              </div>
            </div>
          </div>

          {/* Галерея медиа */}
          {reportData.media && reportData.media.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Медиа материалы</h3>
              <div className="grid grid-cols-3 gap-2">
                {reportData.media.map((item: any, index: number) => (
                  <div key={index} className="relative">
                    {item.type.startsWith('image/') ? (
                      <img 
                        src={item.url} 
                        alt="Report media" 
                        className="w-full h-24 object-cover rounded cursor-pointer"
                        onClick={() => {/* Открыть в lightbox */}}
                      />
                    ) : (
                      <div className="w-full h-24 bg-gray-200 rounded flex items-center justify-center">
                        <Video size={24} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Форма отзыва */}
          <div>
            <h3 className="font-semibold mb-2">Отзыв специалиста</h3>
            
            <RadioGroup value={reviewStatus} onValueChange={setReviewStatus}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="approved" id="approved" />
                <label htmlFor="approved">Одобрено</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="needs_revision" id="needs_revision" />
                <label htmlFor="needs_revision">Требует доработки</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rejected" id="rejected" />
                <label htmlFor="rejected">Отклонено</label>
              </div>
            </RadioGroup>
            
            <div className="mt-4">
              <label htmlFor="notes" className="block text-sm font-medium mb-2">
                Комментарий (минимум 10 символов)
              </label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Введите комментарий к отчету..."
                rows={4}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Сохранение...' : 'Сохранить отзыв'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

#### Acceptance Criteria:

- [ ] Все данные отчета отображаются
- [ ] Медиа в галерее (lightbox для фото)
- [ ] Форма валидируется (min 10 символов)
- [ ] Success toast после сохранения

#### Риски и митигация:

- **Риск:** Большое количество медиа может замедлить загрузку
- **Митигация:** Ленивая загрузка и виртуализация списка

### 3.2 Analytics Components (5 компонентов)

#### 3.2.1 Progress Dashboard Page

**Приоритет:** P1

**Время:** 6 часов

**Путь:** `nero_platform/apps/web/src/app/dashboard/progress/page.tsx` - NEW

#### Решение:

```typescript
// Файл: apps/web/src/app/dashboard/progress/page.tsx - NEW
"use client";

import React, { useState, useEffect } from 'react';
import { KPICard } from '@/components/analytics/KPICard';
import { LineChart } from '@/components/analytics/LineChart';
import { PieChart } from '@/components/analytics/PieChart';
import { DateRangeFilter } from '@/components/analytics/DateRangeFilter';
import { ProgressHeader } from '@/components/analytics/ProgressHeader';
import { analyticsApi } from '@/lib/api';

export default function ProgressPage() {
  const [selectedChild, setSelectedChild] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedChild) {
      loadStats();
    }
  }, [selectedChild, dateRange]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await analyticsApi.getChildStats(selectedChild.id, dateRange);
      setStats(data);
    } catch (error) {
      // Обработка ошибки
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <ProgressHeader loading={true} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProgressHeader
        selectedChild={selectedChild}
        onChildChange={setSelectedChild}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Выполнено заданий"
          value={stats?.completedAssignments || 0}
          total={stats?.totalAssignments || 0}
          icon="check-circle"
        />
        <KPICard
          title="Общий прогресс"
          value={`${stats?.overallProgress || 0}%`}
          icon="trending-up"
        />
        <KPICard
          title="Среднее настроение"
          value={stats?.averageMood || 'Н/Д'}
          icon="smile"
        />
        <KPICard
          title="Активных дней"
          value={stats?.activeDays || 0}
          icon="calendar"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Прогресс выполнения</h3>
          <LineChart data={stats?.timeline || []} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Распределение настроения</h3>
          <PieChart data={stats?.moodDistribution || []} />
        </div>
      </div>
    </div>
  );
}
```

#### Acceptance Criteria:

- [ ] Responsive layout (mobile/tablet/desktop)
- [ ] Loading skeletons для всех секций
- [ ] Date range picker работает
- [ ] Charts рендерятся с данными
- [ ] Error states с retry кнопками

#### Риски и митигация:

- **Риск:** Большое количество данных может замедлить рендеринг
- **Митигация:** Использовать React.memo и виртуализацию для списков

### 3.3 Notifications Components (2 компонента)

#### 3.3.1 NotificationPreferencesDialog.tsx

**Приоритет:** P0 (критично для Month 3)

**Время:** 3 часа

**Путь:** `nero_platform/apps/web/src/components/notifications/NotificationPreferencesDialog.tsx` - NEW

#### Решение:

```typescript
// Файл: apps/web/src/components/notifications/NotificationPreferencesDialog.tsx - NEW
"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { notificationsApi } from '@/lib/api';

interface NotificationPreferences {
  emailEnabled: boolean;
  inAppEnabled: boolean;
  assignmentReminders: boolean;
  reportUpdates: boolean;
  routeChanges: boolean;
}

interface QuietHours {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export const NotificationPreferencesDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailEnabled: true,
    inAppEnabled: true,
    assignmentReminders: true,
    reportUpdates: true,
    routeChanges: true
  });
  
  const [quietHours, setQuietHours] = useState<QuietHours>({
    enabled: false,
    startTime: "22:00",
    endTime: "08:00"
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadPreferences();
    }
  }, [open]);

  const loadPreferences = async () => {
    try {
      const data = await notificationsApi.getPreferences();
      setPreferences(data.data.preferences);
      setQuietHours(data.data.quietHours);
    } catch (error) {
      // Обработка ошибки
    }
  };

  const savePreferences = async () => {
    setLoading(true);
    try {
      await notificationsApi.updatePreferences({ preferences, quietHours });
      onOpenChange(false);
      // Показать success toast
    } catch (error) {
      // Показать ошибку
    } finally {
      setLoading(false);
    }
  };

  const validateTimeRange = () => {
    if (!quietHours.enabled) return true;
    return quietHours.startTime !== quietHours.endTime;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Настройки уведомлений</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Каналы доставки</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="email">Email уведомления</Label>
                <Switch
                  id="email"
                  checked={preferences.emailEnabled}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, emailEnabled: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="inapp">В приложении</Label>
                <Switch
                  id="inapp"
                  checked={preferences.inAppEnabled}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, inAppEnabled: checked }))
                  }
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Типы уведомлений</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="assignments">Напоминания о заданиях</Label>
                <Switch
                  id="assignments"
                  checked={preferences.assignmentReminders}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, assignmentReminders: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="reports">Обновления отчетов</Label>
                <Switch
                  id="reports"
                  checked={preferences.reportUpdates}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, reportUpdates: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="routes">Изменения маршрута</Label>
                <Switch
                  id="routes"
                  checked={preferences.routeChanges}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, routeChanges: checked }))
                  }
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Тихие часы</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="quiet-enabled">Включить</Label>
                <Switch
                  id="quiet-enabled"
                  checked={quietHours.enabled}
                  onCheckedChange={(checked) =>
                    setQuietHours(prev => ({ ...prev, enabled: checked }))
                  }
                />
              </div>
              {quietHours.enabled && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="start-time">С</Label>
                    <input
                      id="start-time"
                      type="time"
                      value={quietHours.startTime}
                      onChange={(e) =>
                        setQuietHours(prev => ({ ...prev, startTime: e.target.value }))
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-time">По</Label>
                    <input
                      id="end-time"
                      type="time"
                      value={quietHours.endTime}
                      onChange={(e) =>
                        setQuietHours(prev => ({ ...prev, endTime: e.target.value }))
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button 
            onClick={savePreferences} 
            disabled={loading || !validateTimeRange()}
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

#### Acceptance Criteria:

- [ ] Dialog открывается из profile menu
- [ ] Все toggles работают
- [ ] Quiet hours time picker работает
- [ ] Валидация: end time > start time
- [ ] Success toast после сохранения
- [ ] Settings загружаются при открытии

#### Риски и митигация:

- **Риск:** Конфликт preferences при одновременном обновлении
- **Митигация:** Добавить optimistic locking в БД

---

## ФАЗА 4: Pages (P1)

### 4.1 Reports List Page

**Приоритет:** P1

**Время:** 3 часа

**Путь:** `nero_platform/apps/web/src/app/dashboard/reports/page.tsx` - NEW

#### Решение:

```typescript
// Файл: apps/web/src/app/dashboard/reports/page.tsx - NEW
"use client";

import React, { useState, useEffect } from 'react';
import { ReportCard } from '@/components/reports/ReportCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { reportsApi } from '@/lib/api';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    childId: '',
    status: '',
    reviewStatus: 'unreviewed' // По умолчанию показывать непроверенные
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadReports();
  }, [filters, page]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await reportsApi.getReports({
        ...filters,
        page,
        limit: 20
      });
      
      if (page === 1) {
        setReports(data.data);
      } else {
        setReports(prev => [...prev, ...data.data]);
      }
      
      setHasMore(data.data.length === 20);
    } catch (error) {
      // Обработка ошибки
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Отчеты</h1>
        <Button onClick={() => {/* Открыть фильтры */}}>
          Фильтры
        </Button>
      </div>

      {/* Фильтры */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select value={filters.childId} onValueChange={(value) => 
          setFilters(prev => ({ ...prev, childId: value }))
        }>
          <SelectTrigger>
            <SelectValue placeholder="Все дети" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Все дети</SelectItem>
            {/* Список детей */}
          </SelectContent>
        </Select>
        
        <Select value={filters.status} onValueChange={(value) => 
          setFilters(prev => ({ ...prev, status: value }))
        }>
          <SelectTrigger>
            <SelectValue placeholder="Все статусы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Все статусы</SelectItem>
            <SelectItem value="completed">Завершены</SelectItem>
            <SelectItem value="pending">В процессе</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filters.reviewStatus} onValueChange={(value) => 
          setFilters(prev => ({ ...prev, reviewStatus: value }))
        }>
          <SelectTrigger>
            <SelectValue placeholder="Все отзывы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Все отзывы</SelectItem>
            <SelectItem value="unreviewed">Без отзыва</SelectItem>
            <SelectItem value="reviewed">С отзывом</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Список отчетов */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report: any) => (
          <ReportCard
            key={report.id}
            report={report}
            onView={() => {/* Открыть детальный просмотр */}}
            onReview={() => {/* Открыть форму отзыва */}}
          />
        ))}
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!loading && reports.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Нет отчетов для отображения
        </div>
      )}

      {hasMore && !loading && (
        <div className="text-center mt-4">
          <Button onClick={loadMore} variant="outline">
            Загрузить еще
          </Button>
        </div>
      )}
    </div>
  );
}
```

#### Acceptance Criteria:

- [ ] Фильтры работают
- [ ] Pagination или infinite scroll
- [ ] Loading states
- [ ] Empty state: "Нет отчетов"

#### Риски и митигация:

- **Риск:** Большое количество отчетов может замедлить загрузку
- **Митигация:** Использовать виртуализацию списка

---

## ФАЗА 5: E2E Tests (P0-P1)

### 5.1 Reports Tests

**Приоритет:** P0

**Время:** 4 часа

**Файл:** `nero_platform/apps/web/e2e/reports.spec.ts` - NEW

#### Решение:

```typescript
// Файл: apps/web/e2e/reports.spec.ts - NEW
import { test, expect } from '@playwright/test';

test.describe('Reports Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as parent
    await page.goto('/login');
    await page.fill('[data-testid=email]', 'parent1@example.com');
    await page.fill('[data-testid=password]', 'password123');
    await page.click('[data-testid=login-button]');
    await page.waitForURL('/dashboard');
  });

  test('R-1: Родитель может создать отчет', async ({ page }) => {
    // Navigate to assignments
    await page.click('[data-testid=assignments-menu]');
    await page.click('[data-testid=assignments-link]');
    await page.waitForURL('/dashboard/assignments');
    
    // Click "Завершить" на первом задании
    await page.click('[data-testid=complete-assignment-0]');
    await page.waitForSelector('[data-testid=create-report-dialog]');
    
    // Fill form
    await page.fill('[data-testid=mood-select]', 'Хорошее');
    await page.fill('[data-testid=duration-input]', '30');
    await page.fill('[data-testid=notes-textarea]', 'Ребенок с удовольствием выполнил задание');
    
    // Submit report
    await page.click('[data-testid=submit-report]');
    await page.waitForSelector('[data-testid=success-toast]');
    
    // Verify assignment marked as completed
    await page.goto('/dashboard/assignments');
    const assignmentStatus = await page.textContent('[data-testid=assignment-status-0]');
    expect(assignmentStatus).toContain('Завершено');
  });

  test('R-2: Родитель может загрузить фото', async ({ page }) => {
    await page.goto('/dashboard/assignments');
    await page.click('[data-testid=complete-assignment-0]');
    
    // Test drag & drop
    const fileInput = page.locator('[data-testid=file-input]');
    await fileInput.setInputFiles('test-files/test-image.jpg');
    
    // Verify image preview
    await expect(page.locator('[data-testid=image-preview]')).toBeVisible();
    
    // Submit report with media
    await page.click('[data-testid=submit-report]');
    await page.waitForSelector('[data-testid=success-toast]');
  });

  test('R-3: Специалист может просмотреть отчет', async ({ page }) => {
    // Login as specialist
    await page.goto('/login');
    await page.fill('[data-testid=email]', 'specialist@neiro.dev');
    await page.fill('[data-testid=password]', 'password123');
    await page.click('[data-testid=login-button]');
    await page.waitForURL('/dashboard');
    
    // Navigate to reports
    await page.click('[data-testid=reports-menu]');
    await page.click('[data-testid=reports-link]');
    await page.waitForURL('/dashboard/reports');
    
    // Verify list
    await expect(page.locator('[data-testid=report-card]')).toHaveCount(3);
    
    // Click "Просмотреть"
    await page.click('[data-testid=view-report-0]');
    await page.waitForSelector('[data-testid=report-details]');
    
    // Verify media renders
    await expect(page.locator('[data-testid=report-media]')).toBeVisible();
  });

  test('R-4: Специалист может оставить отзыв', async ({ page }) => {
    // Login as specialist and navigate to report
    await page.goto('/login');
    await page.fill('[data-testid=email]', 'specialist@neiro.dev');
    await page.fill('[data-testid=password]', 'password123');
    await page.click('[data-testid=login-button]');
    
    await page.goto('/dashboard/reports');
    await page.click('[data-testid=view-report-0]');
    
    // Open review form
    await page.click('[data-testid=review-button]');
    await page.waitForSelector('[data-testid=review-dialog]');
    
    // Fill review form
    await page.click('[data-testid=approved-radio]');
    await page.fill('[data-testid=review-notes]', 'Отличная работа, продолжайте в том же духе!');
    
    // Submit review
    await page.click('[data-testid=save-review]');
    await page.waitForSelector('[data-testid=success-toast]');
    
    // Verify status changed to "reviewed"
    await page.reload();
    const status = await page.textContent('[data-testid=report-status-0]');
    expect(status).toContain('Проверено');
  });
});
```

#### Acceptance Criteria:

- [ ] 4/4 тестов проходят
- [ ] Coverage: create, media upload, review flow
- [ ] Screenshots on failure

#### Риски и митигация:

- **Риск:** Тесты могут быть нестабильны из-за таймингов
- **Митигация:** Добавить явные ожидания и retry механизмы

### 5.2 Progress/Analytics Tests

**Приоритет:** P1

**Время:** 3 часа

**Файл:** `nero_platform/apps/web/e2e/progress.spec.ts` - NEW

#### Решение:

```typescript
// Файл: apps/web/e2e/progress.spec.ts - NEW
import { test, expect } from '@playwright/test';

test.describe('Progress Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as parent
    await page.goto('/login');
    await page.fill('[data-testid=email]', 'parent1@example.com');
    await page.fill('[data-testid=password]', 'password123');
    await page.click('[data-testid=login-button]');
    await page.waitForURL('/dashboard');
  });

  test('PR-1: Родитель видит прогресс ребенка', async ({ page }) => {
    // Navigate to progress
    await page.click('[data-testid=progress-menu]');
    await page.click('[data-testid=progress-link]');
    await page.waitForURL('/dashboard/progress');
    
    // Verify KPI cards
    await expect(page.locator('[data-testid=kpi-card-completed]')).toBeVisible();
    await expect(page.locator('[data-testid=kpi-card-progress]')).toBeVisible();
    await expect(page.locator('[data-testid=kpi-card-mood]')).toBeVisible();
    await expect(page.locator('[data-testid=kpi-card-days]')).toBeVisible();
    
    // Verify charts loaded
    await expect(page.locator('[data-testid=line-chart]')).toBeVisible();
    await expect(page.locator('[data-testid=pie-chart]')).toBeVisible();
    
    // Verify goals section
    await expect(page.locator('[data-testid=goals-section]')).toBeVisible();
  });

  test('PR-2: Графики отображаются корректно', async ({ page }) => {
    await page.goto('/dashboard/progress');
    
    // Wait for charts to load
    await page.waitForSelector('[data-testid=line-chart]');
    
    // Test chart interactivity
    await page.hover('[data-testid=line-chart-point-0]');
    await expect(page.locator('[data-testid=chart-tooltip]')).toBeVisible();
    
    // Test pie chart
    await page.hover('[data-testid=pie-chart-segment-0]');
    await expect(page.locator('[data-testid=chart-tooltip]')).toBeVisible();
  });

  test('PR-3: Специалист видит обзор детей', async ({ page }) => {
    // Login as specialist
    await page.goto('/login');
    await page.fill('[data-testid=email]', 'specialist@neiro.dev');
    await page.fill('[data-testid=password]', 'password123');
    await page.click('[data-testid=login-button]');
    
    await page.click('[data-testid=analytics-menu]');
    await page.click('[data-testid=analytics-link]');
    await page.waitForURL('/dashboard/analytics');
    
    // Verify overview
    await expect(page.locator('[data-testid=children-overview]')).toBeVisible();
    
    // Verify top performers list
    await expect(page.locator('[data-testid=top-performers]')).toBeVisible();
  });
});
```

#### Acceptance Criteria:

- [ ] 3/3 тестов проходят
- [ ] Charts rendering verified
- [ ] Screenshot comparison для визуальных элементов

#### Риски и митигация:

- **Риск:** Визуальные элементы могут измениться
- **Митигация:** Использовать data-testid вместо CSS селекторов

### 5.3 Notifications Tests

**Приоритет:** P0

**Время:** 3 часа

**Файл:** `nero_platform/apps/web/e2e/notifications.spec.ts` - NEW

#### Решение:

```typescript
// Файл: apps/web/e2e/notifications.spec.ts - NEW
import { test, expect } from '@playwright/test';

test.describe('Notifications Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as parent
    await page.goto('/login');
    await page.fill('[data-testid=email]', 'parent1@example.com');
    await page.fill('[data-testid=password]', 'password123');
    await page.click('[data-testid=login-button]');
    await page.waitForURL('/dashboard');
  });

  test('N-1: Уведомления отображаются в bell', async ({ page }) => {
    // Verify notification bell visible in header
    await expect(page.locator('[data-testid=notification-bell]')).toBeVisible();
    
    // Verify unread badge shows count > 0
    await expect(page.locator('[data-testid=notification-badge]')).toContainText('3');
    
    // Click bell icon
    await page.click('[data-testid=notification-bell]');
    
    // Verify dropdown opens with notifications list
    await expect(page.locator('[data-testid=notification-dropdown]')).toBeVisible();
    await expect(page.locator('[data-testid=notification-item]')).toHaveCount(3);
  });

  test('N-2: Mark as read работает', async ({ page }) => {
    // Open notification dropdown
    await page.click('[data-testid=notification-bell]');
    
    // Click on unread notification
    await page.click('[data-testid=notification-item-0]');
    
    // Verify notification marked as read (visual change)
    await expect(page.locator('[data-testid=notification-item-0]')).toHaveClass(/read/);
    
    // Verify badge count decreases by 1
    await expect(page.locator('[data-testid=notification-badge]')).toContainText('2');
    
    // Verify "Mark all as read" button works
    await page.click('[data-testid=mark-all-read]');
    await expect(page.locator('[data-testid=notification-badge]')).toContainText('0');
  });

  test('N-3: Настройки уведомлений сохраняются', async ({ page }) => {
    // Navigate to profile settings
    await page.click('[data-testid=profile-menu]');
    await page.click('[data-testid=settings-link]');
    
    // Open notification preferences dialog
    await page.click('[data-testid=notification-settings]');
    await page.waitForSelector('[data-testid=preferences-dialog]');
    
    // Toggle email notifications OFF
    await page.click('[data-testid=email-toggle]');
    
    // Toggle assignment reminders OFF
    await page.click('[data-testid=assignments-toggle]');
    
    // Set quiet hours (22:00 - 08:00)
    await page.click('[data-testid=quiet-hours-toggle]');
    await page.fill('[data-testid=start-time]', '22:00');
    await page.fill('[data-testid=end-time]', '08:00');
    
    // Save settings
    await page.click('[data-testid=save-preferences]');
    await page.waitForSelector('[data-testid=success-toast]');
    
    // Reload page
    await page.reload();
    await page.click('[data-testid=notification-settings]');
    
    // Verify settings persisted
    await expect(page.locator('[data-testid=email-toggle]')).not.toBeChecked();
    await expect(page.locator('[data-testid=assignments-toggle]')).not.toBeChecked();
    await expect(page.locator('[data-testid=start-time]')).toHaveValue('22:00');
    await expect(page.locator('[data-testid=end-time]')).toHaveValue('08:00');
  });
});
```

#### Acceptance Criteria:

- [ ] 3/3 тестов проходят
- [ ] Coverage: bell UI, mark as read, preferences persistence
- [ ] Integration test: EventOutbox → UserNotification creation

#### Риски и митигация:

- **Риск:** Тесты зависят от порядка уведомлений
- **Митигация:** Создавать тестовые данные перед каждым тестом

---

## Последовательность выполнения

### День 1: Backend APIs (P0 блокеры)

**Время:** 6 часов

1. Фаза 1.1: MinIO Setup (10 мин)
2. Фаза 2.1: Analytics Endpoint Naming Fix (30 мин)
3. Фаза 2.2: Analytics Granular Endpoints (3 часа)
4. Фаза 2.3: Notification Preferences API (2 часа)

**Результат:** Все backend API готовы для frontend интеграции

### День 2: Reports Frontend (P0 + P1)

**Время:** 7 часов

5. Фаза 3.1.1: MediaUploader Component (4 часа)
6. Фаза 3.1.2: ReviewReportDialog Component (3 часа)

**Результат:** Reports flow полностью работает (create + review + media)

### День 3: Analytics Dashboard (P1)

**Время:** 10 часов

7. Фаза 3.2.1: Progress Dashboard Page (6 часов)
8. Фаза 3.2.2: Charts Implementation (4 часов)

**Результат:** Analytics dashboard с графиками работает

### День 4: Notifications + Pages (P0 + P1)

**Время:** 6 часов

9. Фаза 3.3.1: NotificationPreferencesDialog (3 часа)
10. Фаза 4.1: Reports List Page (3 часа)

**Результат:** Все frontend компоненты и страницы готовы

### День 5: E2E Testing (P0 + P1)

**Время:** 10 часов

11. Фаза 5.1: Reports E2E Tests (4 часа)
12. Фаза 5.2: Progress E2E Tests (3 часа)
13. Фаза 5.3: Notifications E2E Tests (3 часа)

**Результат:** 63 E2E теста проходят (53 existing + 10 new)

---

## Критические зависимости

- **MinIO → MediaUploader → Reports E2E Tests**
  - Без MinIO media upload не будет работать
  - Блокирует тесты R-2

- **Analytics Endpoint Fix → Progress Dashboard → Progress E2E Tests**
  - Несоответствие endpoint names сломает frontend integration
  - Должно быть исправлено до создания dashboard

---

## Технические риски и митигация

- **Recharts performance**: Проверить производительность на больших данных (>100 точек)
  - **Митигация:** Использовать React.memo и виртуализацию

- **MinIO buckets persistence**: Убедиться что buckets не удаляются при рестарте docker
  - **Митигация:** Использовать volume mapping в docker-compose.yml

- **Presigned URL expiration**: Обработать случай истечения URL во время upload
  - **Митигация:** Обновлять URL каждые 5 минут для больших файлов

---

## Acceptance Criteria для завершения Month 3

### Backend (100% done):

- [x] Reports Service работает на 4009
- [x] Analytics Service работает на 4010
- [x] Notifications Service работает на 4011
- [x] Database migrations применены
- [x] EventOutbox events публикуются
- [ ] Analytics endpoint naming fixed (P0)
- [ ] Analytics granular endpoints added (P0)
- [ ] Notification Preferences API added (P0)

### Frontend (35% → 100%):

- [x] CreateReportDialog реализован
- [x] ReportCard реализован
- [x] NotificationBell реализован
- [x] ChildStatsCard реализован
- [ ] MediaUploader реализован (P0)
- [ ] ReviewReportDialog реализован (P1)
- [ ] Progress Dashboard Page реализована (P1)
- [ ] Charts реализованы (P1)
- [ ] Reports List Page реализована (P1)

### E2E Tests (53 тестов → 63 теста):

- [x] 53 existing tests (CJM, auth, routes)
- [ ] 4 Reports tests (P0)
- [ ] 3 Progress tests (P1)
- [ ] 3 Notifications tests (P0)

### Infrastructure (95% → 100%):

- [x] Nginx routing настроен
- [x] Docker compose настроен
- [x] Redis работает
- [x] PostgreSQL работает
- [ ] MinIO buckets созданы (P0)

**Готовность к production:** После выполнения всех P0+P1 задач = 100%

---

## Итоговая оценка

**Текущее состояние:** 88% Month 3 выполнено

**После P0 задач (День 1-2):** 95% критичного функционала

**После P0+P1 задач (День 1-5):** 100% Month 3 завершен

**Общее время реализации:**

- P0 (критичное): ~20 часов (2.5 дня)
- P1 (важное): ~19 часов (2.5 дня)
- **Итого P0+P1:** ~39 часов (5 рабочих дней)
- P2 (опциональное): ~8 часов