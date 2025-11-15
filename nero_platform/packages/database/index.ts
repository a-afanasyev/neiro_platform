/**
 * Экспорт PrismaClient для использования в сервисах
 */
export { PrismaClient } from '@prisma/client'

// Создаем глобальный экземпляр Prisma для избежания множественных подключений
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
