-- Seed данные для notification моделей
-- Применять после миграций 0008, 0009, 0010

-- ============================================================
-- 1. Notifications (4 записи)
-- ============================================================

-- Notification 1: Email reminder для parent1 (SENT)
INSERT INTO notifications (id, recipient_id, channel, template, payload, status, attempts, scheduled_at, sent_at, created_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '66666666-6666-6666-6666-666666666666', -- parent1
  'email',
  'assignment_reminder',
  '{"subject": "Напоминание о занятии", "body": "Через 1 час начинается занятие Развитие внимания"}'::jsonb,
  'sent',
  1,
  '2025-11-20 08:00:00+00',
  '2025-11-20 08:00:15+00',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Notification 2: Push для parent1 (SENT)
INSERT INTO notifications (id, recipient_id, channel, template, payload, status, attempts, scheduled_at, sent_at, created_at)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '66666666-6666-6666-6666-666666666666', -- parent1
  'push',
  'report_reviewed',
  '{"title": "Отчет проверен", "body": "Специалист оставил комментарий к отчету"}'::jsonb,
  'sent',
  1,
  '2025-11-21 14:30:00+00',
  '2025-11-21 14:30:05+00',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Notification 3: Failed email для parent2
INSERT INTO notifications (id, recipient_id, channel, template, payload, status, attempts, last_error, scheduled_at, created_at)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  '77777777-7777-7777-7777-777777777777', -- parent2
  'email',
  'goal_achieved',
  '{"subject": "Достижение цели", "body": "Ваш ребенок достиг цели"}'::jsonb,
  'failed',
  3,
  'SMTP Error: Connection timeout',
  '2025-11-22 10:00:00+00',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Notification 4: Pending для parent1
INSERT INTO notifications (id, recipient_id, channel, template, payload, status, attempts, scheduled_at, created_at)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  '66666666-6666-6666-6666-666666666666', -- parent1
  'email',
  'route_updated',
  '{"subject": "Обновление маршрута", "body": "Специалист обновил маршрут вашего ребенка"}'::jsonb,
  'pending',
  0,
  NOW() + INTERVAL '1 hour',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. UserNotifications (5 записей)
-- ============================================================

-- UserNotification 1: Unread для parent1
INSERT INTO user_notifications (id, user_id, notification_id, type, title, body, link, status, created_at)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  '66666666-6666-6666-6666-666666666666', -- parent1
  '11111111-1111-1111-1111-111111111111', -- notification1
  'assignment_reminder',
  'Напоминание о занятии',
  'Через 1 час начинается занятие "Развитие внимания"',
  '/dashboard/assignments',
  'unread',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- UserNotification 2: Read для parent1
INSERT INTO user_notifications (id, user_id, notification_id, type, title, body, link, status, read_at, created_at)
VALUES (
  'a2222222-2222-2222-2222-222222222222',
  '66666666-6666-6666-6666-666666666666', -- parent1
  '22222222-2222-2222-2222-222222222222', -- notification2
  'report_reviewed',
  'Отчет проверен',
  'Специалист Анна Смирнова оставила комментарий к отчету',
  '/dashboard/reports',
  'read',
  '2025-11-21 15:00:00+00',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- UserNotification 3: System message (без связи с Notification)
INSERT INTO user_notifications (id, user_id, type, title, body, link, status, created_at)
VALUES (
  'a3333333-3333-3333-3333-333333333333',
  '66666666-6666-6666-6666-666666666666', -- parent1
  'system_message',
  'Добро пожаловать в Neiro Platform',
  'Ознакомьтесь с нашим руководством для родителей',
  '/help/guide',
  'unread',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- UserNotification 4: Goal achieved для parent2
INSERT INTO user_notifications (id, user_id, type, title, body, link, status, created_at)
VALUES (
  'a4444444-4444-4444-4444-444444444444',
  '77777777-7777-7777-7777-777777777777', -- parent2
  'goal_achieved',
  'Цель достигнута!',
  'Ваш ребенок успешно достиг цели',
  '/dashboard/goals',
  'unread',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- UserNotification 5: Archived для parent1
INSERT INTO user_notifications (id, user_id, type, title, body, link, status, read_at, created_at)
VALUES (
  'a5555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666', -- parent1
  'route_updated',
  'Маршрут обновлен',
  'Специалист внес изменения в маршрут',
  '/dashboard/routes',
  'archived',
  '2025-11-19 12:00:00+00',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. NotificationPreferences (3 записи)
-- ============================================================

-- Preferences для parent1 (все каналы включены + quiet hours)
INSERT INTO notification_preferences (id, user_id, preferences, quiet_hours, updated_at)
VALUES (
  'p1111111-1111-1111-1111-111111111111',
  '66666666-6666-6666-6666-666666666666', -- parent1
  '{
    "assignment_reminder": {"email": true, "push": true, "inApp": true},
    "report_reviewed": {"email": true, "push": true, "inApp": true},
    "goal_achieved": {"email": true, "push": true, "inApp": true},
    "route_updated": {"email": true, "push": false, "inApp": true},
    "system_message": {"email": false, "push": false, "inApp": true}
  }'::jsonb,
  '{
    "enabled": true,
    "start": "22:00",
    "end": "08:00",
    "timezone": "Asia/Tashkent"
  }'::jsonb,
  NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- Preferences для parent2 (только email)
INSERT INTO notification_preferences (id, user_id, preferences, quiet_hours, updated_at)
VALUES (
  'p2222222-2222-2222-2222-222222222222',
  '77777777-7777-7777-7777-777777777777', -- parent2
  '{
    "assignment_reminder": {"email": true, "push": false, "inApp": true},
    "report_reviewed": {"email": true, "push": false, "inApp": true},
    "goal_achieved": {"email": true, "push": false, "inApp": false},
    "route_updated": {"email": false, "push": false, "inApp": true}
  }'::jsonb,
  NULL,
  NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- Preferences для specialist1 (push отключен)
INSERT INTO notification_preferences (id, user_id, preferences, quiet_hours, updated_at)
VALUES (
  'p3333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333', -- specialist1
  '{
    "assignment_reminder": {"email": true, "push": false, "inApp": true},
    "report_reviewed": {"email": true, "push": false, "inApp": true},
    "goal_achieved": {"email": false, "push": false, "inApp": true},
    "new_assignment": {"email": true, "push": false, "inApp": true}
  }'::jsonb,
  NULL,
  NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- Проверка результатов
-- ============================================================

SELECT 'Notifications:' as table_name, COUNT(*) as count FROM notifications
UNION ALL
SELECT 'UserNotifications:', COUNT(*) FROM user_notifications
UNION ALL
SELECT 'NotificationPreferences:', COUNT(*) FROM notification_preferences;
