#!/usr/bin/env ts-node

/**
 * Скрипт для создания тестовых уведомлений в БД
 * Используется для E2E тестирования
 */

import { PrismaClient } from '@prisma/client'
import { logger } from '../services/notifications/src/utils/logger'

const prisma = new PrismaClient()

async function createTestNotifications() {
  try {
    // Находим пользователя parent1@example.com
    const user = await prisma.user.findFirst({
      where: { email: 'parent1@example.com' }
    })

    if (!user) {
      logger.error('Пользователь parent1@example.com не найден')
      process.exit(1)
    }

    logger.info(`Создание тестовых уведомлений для пользователя: ${user.id}`)

    // Создаем тестовые уведомления
    const notifications = [
      {
        userId: user.id,
        type: 'assignment_reminder',
        title: 'Новое назначение',
        body: 'Ребенку назначено новое упражнение "Формирование букв"',
        link: '/dashboard/assignments',
        status: 'unread'
      },
      {
        userId: user.id,
        type: 'assignment_overdue',
        title: 'Просрочено задание',
        body: 'Упражнение "Рисование линий" не выполнено в срок',
        link: '/dashboard/assignments',
        status: 'unread'
      },
      {
        userId: user.id,
        type: 'report_submitted',
        title: 'Отчет отправлен',
        body: 'Отчет за неделю готов и отправлен на проверку',
        link: '/dashboard/reports',
        status: 'unread'
      },
      {
        userId: user.id,
        type: 'goal_achieved',
        title: 'Цель достигнута',
        body: 'Поздравляем! Ребенок выполнил все задания на этой неделе',
        link: '/dashboard/progress',
        status: 'unread'
      },
      {
        userId: user.id,
        type: 'route_updated',
        title: 'Маршрут обновлен',
        body: 'Специалист обновил индивидуальный маршрут',
        link: '/dashboard/routes',
        status: 'unread'
      }
    ]

    // Добавляем уведомления в БД
    for (const notificationData of notifications) {
      await prisma.userNotification.create({
        data: {
          ...notificationData,
          notificationId: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      })
    }

    logger.info(`Создано ${notifications.length} тестовых уведомлений`)
    console.log('✅ Тестовые уведомления успешно созданы')
  } catch (error) {
    logger.error('Ошибка при создании тестовых уведомлений', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createTestNotifications()
