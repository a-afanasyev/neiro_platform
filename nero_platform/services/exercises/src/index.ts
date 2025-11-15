/**
 * Exercises Service
 * 
 * Сервис управления библиотекой упражнений для коррекционных маршрутов.
 * 
 * Функциональность:
 * - CRUD операции с упражнениями
 * - Загрузка медиа-файлов в MinIO
 * - Публикация событий в Postgres Outbox
 * - Фильтрация по категориям, возрасту, сложности
 * - Версионирование упражнений
 * 
 * Порт: 4007 (внутренний/внешний)
 * API: /exercises/v1
 */

import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import { exercisesRouter } from './routes/exercises.routes';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';
import { initializeBuckets } from './services/minio.client';

// Загрузка переменных окружения
dotenv.config();

const app: Application = express();
const PORT = process.env.EXERCISES_SERVICE_PORT || 4007;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3001';

// Middleware
app.use(helmet()); // Безопасность заголовков
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' })); // JSON парсинг с лимитом
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger); // Логирование запросов

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'exercises',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/exercises/v1', exercisesRouter);

// Error Handler (должен быть последним)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Запуск сервера с инициализацией MinIO
app.listen(PORT, async () => {
  console.log(`🚀 Exercises Service запущен на порту ${PORT}`);
  console.log(`📝 API доступен по адресу: http://localhost:${PORT}/exercises/v1`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  
  // Инициализация MinIO buckets
  try {
    await initializeBuckets();
  } catch (error) {
    console.error('⚠️  Предупреждение: MinIO не инициализирован, загрузка медиа будет недоступна');
  }
});

export default app;

