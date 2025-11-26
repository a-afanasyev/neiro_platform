import Redis from 'ioredis';
import { logger } from '../utils/logger';

class RedisService {
  private client: Redis;
  private readonly DEFAULT_TTL = 300; // 5 minutes

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    this.client = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    this.client.on('connect', () => {
      logger.info('Redis connected');
    });

    this.client.on('error', (err) => {
      logger.error('Redis error', { error: err.message });
    });
  }

  /**
   * Получить значение из кэша
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Redis get error', { key, error });
      return null;
    }
  }

  /**
   * Сохранить значение в кэш
   */
  async set(key: string, value: any, ttl: number = this.DEFAULT_TTL): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      await this.client.setex(key, ttl, serialized);
      return true;
    } catch (error) {
      logger.error('Redis set error', { key, error });
      return false;
    }
  }

  /**
   * Удалить значение из кэша
   */
  async del(key: string): Promise<boolean> {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis del error', { key, error });
      return false;
    }
  }

  /**
   * Удалить значения по паттерну
   */
  async delPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;

      await this.client.del(...keys);
      return keys.length;
    } catch (error) {
      logger.error('Redis delPattern error', { pattern, error });
      return 0;
    }
  }

  /**
   * Проверить существование ключа
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis exists error', { key, error });
      return false;
    }
  }

  /**
   * Инкремент счетчика
   */
  async incr(key: string, ttl?: number): Promise<number> {
    try {
      const value = await this.client.incr(key);
      if (ttl) {
        await this.client.expire(key, ttl);
      }
      return value;
    } catch (error) {
      logger.error('Redis incr error', { key, error });
      return 0;
    }
  }

  /**
   * Получить TTL ключа
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error('Redis ttl error', { key, error });
      return -1;
    }
  }

  /**
   * Закрыть соединение
   */
  async disconnect(): Promise<void> {
    await this.client.quit();
  }

  /**
   * Генерация ключа для кэша
   */
  static generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `analytics:${prefix}:${parts.join(':')}`;
  }
}

export const redisService = new RedisService();
