#!/usr/bin/env node

/**
 * Скрипт для создания тестового уведомления через API
 */

const axios = require('axios');

async function createTestNotification() {
  try {
    // Сначала авторизуемся как admin
    const loginResponse = await axios.post('http://localhost:4001/api/v1/auth/login', {
      email: 'admin@neiro.dev',
      password: 'admin123'
    });

    if (!loginResponse.data || !loginResponse.data.success) {
      console.error('Ошибка авторизации:', loginResponse.data);
      process.exit(1);
    }

    const token = loginResponse.data.data.accessToken;

    // Находим ID пользователя parent1@example.com
    const usersResponse = await axios.get('http://localhost:4002/api/v1/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!usersResponse.data || !usersResponse.data.success) {
      console.error('Ошибка получения пользователей:', usersResponse.data);
      process.exit(1);
    }

    const parentUser = usersResponse.data.data.find(user => user.email === 'parent1@example.com');
    
    if (!parentUser) {
      console.error('Пользователь parent1@example.com не найден');
      process.exit(1);
    }

    console.log('Создание тестового уведомления для пользователя:', parentUser.id);

    // Создаем тестовое уведомление через API
    const notificationResponse = await axios.post('http://localhost:4011/api/v1/notifications/user', {
      userId: parentUser.id,
      type: 'assignment_reminder',
      title: 'Новое назначение',
      body: 'Ребенку назначено новое упражнение "Формирование букв"',
      link: '/dashboard/assignments',
      status: 'unread'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (notificationResponse.data && notificationResponse.data.success) {
      console.log('✅ Тестовое уведомление успешно создано');
    } else {
      console.error('Ошибка создания уведомления:', notificationResponse.data);
    }

  } catch (error) {
    console.error('Ошибка:', error.message);
    process.exit(1);
  }
}

createTestNotification();
