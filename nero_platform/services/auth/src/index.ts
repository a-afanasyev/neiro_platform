/**
 * Auth Service
 * 
 * Сервис аутентификации и авторизации
 * API Endpoints: /auth/v1/*
 * 
 * Responsibilities:
 * - JWT токены (access + refresh)
 * - Login/Logout
 * - User invitation
 * - Role-based access control (RBAC)
 * - Session management в Redis
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@neiro/database';
import * as dotenv from 'dotenv';
import authRouter from './routes/auth.routes';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';

// Загрузка переменных окружения
dotenv.config();

const app: Express = express();
const port = process.env.AUTH_SERVICE_PORT || 4001;

// Database client
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Middleware
app.use(helmet()); // Безопасность HTTP заголовков
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    service: 'auth-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/auth/v1', authRouter);

// Error handling
app.use(errorHandler);

// Start server
const server = app.listen(port, () => {
  console.log(`🔐 Auth Service запущен на порту ${port}`);
  console.log(`📡 Health check: http://localhost:${port}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
  });
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
  });
  await prisma.$disconnect();
  process.exit(0);
});

