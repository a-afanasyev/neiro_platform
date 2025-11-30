import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { emailService } from './services/email.service';
import deliveryRoutes from './routes/delivery.routes';
import userNotificationRoutes from './routes/user-notification.routes';
import preferencesRoutes from './routes/preferences.routes';
import { notificationProcessor } from './jobs/notification-processor';

// Load environment variables
config();

const app = express();
const PORT = process.env.NOTIFICATIONS_SERVICE_PORT || 4011;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', async (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'notifications',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    email: emailService ? 'configured' : 'disabled',
  });
});

// API routes
app.use('/notifications/v1/delivery', deliveryRoutes);
app.use('/notifications/v1/user', userNotificationRoutes);
app.use('/notifications/v1/preferences', preferencesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
    },
  });
});

// Error handler
app.use(errorHandler);

// Initialize services and start server
async function startServer() {
  try {
    // Initialize email service
    await emailService.initialize();

    // Start cron jobs for notification processing
    notificationProcessor.start();

    // Start HTTP server
    app.listen(PORT, () => {
      logger.info(`Notifications Service started on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  notificationProcessor.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  notificationProcessor.stop();
  process.exit(0);
});
