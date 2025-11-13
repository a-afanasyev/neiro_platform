/**
 * Redis Service
 * 
 * Клиент для работы с Redis (кэш и сессии)
 */

import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6380';

export const redisClient = new Redis(redisUrl, {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redisClient.on('connect', () => {
  console.log('✅ Redis подключен');
});

redisClient.on('error', (error) => {
  console.error('❌ Redis ошибка:', error);
});

redisClient.on('ready', () => {
  console.log('📡 Redis готов к работе');
});

