/**
 * Children Service
 * 
 * Сервис управления профилями детей с РАС
 * API Endpoints: /children/v1/*
 * 
 * Responsibilities:
 * - CRUD операции с профилями детей
 * - Связи ребенок-родитель
 * - Связи ребенок-специалист
 * - История диагностик
 * - Коррекционные маршруты
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@neiro/database';
import * as dotenv from 'dotenv';
import childrenRouter from './routes/children.routes';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';

dotenv.config();

const app: Express = express();
const port = process.env.CHILDREN_SERVICE_PORT || 4003;

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Middleware
app.use(helmet());
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
    service: 'children-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/children/v1', childrenRouter);

// Error handling
app.use(errorHandler);

// Start server
const server = app.listen(port, () => {
  console.log(`👶 Children Service запущен на порту ${port}`);
  console.log(`📡 Health check: http://localhost:${port}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => console.log('HTTP server closed.'));
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => console.log('HTTP server closed.'));
  await prisma.$disconnect();
  process.exit(0);
});

