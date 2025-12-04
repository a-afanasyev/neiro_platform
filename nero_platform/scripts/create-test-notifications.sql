-- Скрипт для создания тестовых уведомлений в БД
-- Используется для E2E тестирования

-- Находим ID пользователя parent1@example.com
DO $$
DECLARE parent_id UUID;
BEGIN
  SELECT id INTO parent_id FROM "users" WHERE email = 'parent1@example.com' LIMIT 1;
EXCEPTION WHEN NO_DATA_FOUND THEN
  RAISE EXCEPTION 'Пользователь parent1@example.com не найден';
END;
$$;

-- Создаем тестовые уведомления
INSERT INTO "user_notifications" (
  id, 
  user_id, 
  type, 
  title, 
  body, 
  link, 
  status, 
  notification_id, 
  created_at, 
  updated_at
) VALUES 
  (
    gen_random_uuid(), 
    parent_id, 
    'assignment_reminder', 
    'Новое назначение', 
    'Ребенку назначено новое упражнение "Формирование букв"', 
    '/dashboard/assignments', 
    'unread', 
    'notif_assignment_reminder_' || gen_random_uuid(), 
    NOW(), 
    NOW()
  ),
  (
    gen_random_uuid(), 
    parent_id, 
    'assignment_overdue', 
    'Просрочено задание', 
    'Упражнение "Рисование линий" не выполнено в срок', 
    '/dashboard/assignments', 
    'unread', 
    'notif_assignment_overdue_' || gen_random_uuid(), 
    NOW(), 
    NOW()
  ),
  (
    gen_random_uuid(), 
    parent_id, 
    'report_submitted', 
    'Отчет отправлен', 
    'Отчет за неделю готов и отправлен на проверку', 
    '/dashboard/reports', 
    'unread', 
    'notif_report_submitted_' || gen_random_uuid(), 
    NOW(), 
    NOW()
  ),
  (
    gen_random_uuid(), 
    parent_id, 
    'goal_achieved', 
    'Цель достигнута', 
    'Поздравляем! Ребенок выполнил все задания на этой неделе', 
    '/dashboard/progress', 
    'unread', 
    'notif_goal_achieved_' || gen_random_uuid(), 
    NOW(), 
    NOW()
  ),
  (
    gen_random_uuid(), 
    parent_id, 
    'route_updated', 
    'Маршрут обновлен', 
    'Специалист обновил индивидуальный маршрут', 
    '/dashboard/routes', 
    'unread', 
    'notif_route_updated_' || gen_random_uuid(), 
    NOW(), 
    NOW()
  );

-- Выводим результат
DO $$
BEGIN
  RAISE NOTICE 'Создано 5 тестовых уведомлений для пользователя parent1@example.com';
END;
$$;

