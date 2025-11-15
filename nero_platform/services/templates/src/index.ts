/**
 * Templates Service
 * 
 * Сервис управления шаблонами коррекционных маршрутов.
 * 
 * Функциональность:
 * - CRUD операции с шаблонами маршрутов
 * - Версионирование шаблонов
 * - Публикация и архивация шаблонов
 * - Клонирование шаблонов
 * - Применение шаблонов к маршрутам
 * - Публикация событий в Postgres Outbox
 * 
 * Порт: 4008 (внутренний/внешний)
 * API: /templates/v1
 */

import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import { templatesRouter } from './routes/templates.routes';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';

// Загрузка переменных окружения
dotenv.config();

const app: Application = express();
const PORT = process.env.TEMPLATES_SERVICE_PORT || 4008;
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
    service: 'templates',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/templates/v1', templatesRouter);

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

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Templates Service запущен на порту ${PORT}`);
  console.log(`📝 API доступен по адресу: http://localhost:${PORT}/templates/v1`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});

export default app;


