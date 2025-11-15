/**
 * Assignments Service
 * 
 * Сервис управления назначениями упражнений для детей.
 * 
 * Функциональность:
 * - CRUD операции с назначениями
 * - Управление расписанием назначений
 * - Отслеживание просрочек (SLA)
 * - Календарь назначений
 * - История изменений
 * - Публикация событий в Postgres Outbox
 * 
 * Порт: 4006 (внутренний/внешний)
 * API: /assignments/v1
 */

import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import { assignmentsRouter } from './routes/assignments.routes';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';

// Загрузка переменных окружения
dotenv.config();

const app: Application = express();
const PORT = process.env.ASSIGNMENTS_SERVICE_PORT || 4006;
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
    service: 'assignments',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/assignments/v1', assignmentsRouter);

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
  console.log(`🚀 Assignments Service запущен на порту ${PORT}`);
  console.log(`📝 API доступен по адресу: http://localhost:${PORT}/assignments/v1`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});

export default app;

