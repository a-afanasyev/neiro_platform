import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from '@neiro/database';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';
import diagnosticRoutes from './routes/diagnostics.routes';
import questionnaireRoutes from './routes/questionnaires.routes';

// Загружаем переменные окружения
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4004;

/**
 * Настройка middleware для безопасности и обработки запросов
 */
app.use(helmet()); // Защита заголовков HTTP
app.use(cors()); // Разрешаем кросс-доменные запросы
app.use(express.json()); // Парсинг JSON
app.use(express.urlencoded({ extended: true })); // Парсинг URL-encoded данных
app.use(requestLogger); // Логирование всех входящих запросов

/**
 * Health check endpoint
 * Используется для проверки работоспособности сервиса
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'diagnostics',
    timestamp: new Date().toISOString() 
  });
});

/**
 * API Routes
 * Все маршруты diagnostics API версии 1
 */
app.use('/diagnostics/v1', diagnosticRoutes);
app.use('/diagnostics/v1/questionnaires', questionnaireRoutes);

/**
 * Глобальный обработчик ошибок
 * Должен быть подключен последним
 */
app.use(errorHandler);

/**
 * Запуск сервера
 * Подключаемся к базе данных и запускаем Express сервер
 */
async function startServer() {
  try {
    // Проверяем подключение к базе данных
    await prisma.$connect();
    console.log('✅ Connected to database');

    // Запускаем сервер
    app.listen(PORT, () => {
      console.log(`🚀 Diagnostics Service running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 * Корректное завершение работы при получении сигналов SIGINT/SIGTERM
 */
process.on('SIGINT', async () => {
  console.log('⚠️  SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('⚠️  SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Запускаем сервер
startServer();

