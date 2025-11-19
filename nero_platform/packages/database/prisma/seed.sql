/**
 * Seed SQL для тестовых данных CJM
 * Хэши паролей:
 * admin123: $2b$12$oz7lY6kq3rQ3NhlVGCyUXOUZKoBWZTJDNtuWLK.mEJMkWHcum5ts.
 * parent123: $2b$12$ZaKuSCTzW2ZqjQRIhlj2P.ouOAgZGP88S1SR5AUan6htWKX5EUlIq
 */

-- ============================================================
-- 1. Пользователи
-- ============================================================

INSERT INTO users (id, email, password, first_name, last_name, role, status, timezone, created_at, updated_at) VALUES
  -- Admin
  ('11111111-1111-1111-1111-111111111111', 'admin@neiro.dev', '$2b$12$oz7lY6kq3rQ3NhlVGCyUXOUZKoBWZTJDNtuWLK.mEJMkWHcum5ts.', 'Admin', 'Adminov', 'admin', 'active', 'Asia/Tashkent', NOW(), NOW()),
  -- Supervisor
  ('22222222-2222-2222-2222-222222222222', 'supervisor@neiro.dev', '$2b$12$oz7lY6kq3rQ3NhlVGCyUXOUZKoBWZTJDNtuWLK.mEJMkWHcum5ts.', 'Ольга', 'Супервизорова', 'supervisor', 'active', 'Europe/Moscow', NOW(), NOW()),
  -- Specialists
  ('33333333-3333-3333-3333-333333333333', 'specialist1@example.com', '$2b$12$oz7lY6kq3rQ3NhlVGCyUXOUZKoBWZTJDNtuWLK.mEJMkWHcum5ts.', 'Анна', 'Смирнова', 'specialist', 'active', 'Asia/Tashkent', NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444444', 'specialist2@example.com', '$2b$12$oz7lY6kq3rQ3NhlVGCyUXOUZKoBWZTJDNtuWLK.mEJMkWHcum5ts.', 'Елена', 'Кузнецова', 'specialist', 'active', 'Asia/Tashkent', NOW(), NOW()),
  ('55555555-5555-5555-5555-555555555555', 'specialist3@example.com', '$2b$12$oz7lY6kq3rQ3NhlVGCyUXOUZKoBWZTJDNtuWLK.mEJMkWHcum5ts.', 'Дмитрий', 'Соколов', 'specialist', 'active', 'Asia/Tashkent', NOW(), NOW()),
  -- Parents
  ('66666666-6666-6666-6666-666666666666', 'parent1@example.com', '$2b$12$ZaKuSCTzW2ZqjQRIhlj2P.ouOAgZGP88S1SR5AUan6htWKX5EUlIq', 'Анвар', 'Иванов', 'parent', 'active', 'Asia/Tashkent', NOW(), NOW()),
  ('77777777-7777-7777-7777-777777777777', 'parent2@example.com', '$2b$12$ZaKuSCTzW2ZqjQRIhlj2P.ouOAgZGP88S1SR5AUan6htWKX5EUlIq', 'Наталья', 'Петрова', 'parent', 'active', 'Europe/Moscow', NOW(), NOW()),
  ('88888888-8888-8888-8888-888888888888', 'parent3@example.com', '$2b$12$ZaKuSCTzW2ZqjQRIhlj2P.ouOAgZGP88S1SR5AUan6htWKX5EUlIq', 'Дмитрий', 'Сидоров', 'parent', 'active', 'Asia/Tashkent', NOW(), NOW()),
  ('99999999-9999-9999-9999-999999999999', 'parent4@example.com', '$2b$12$ZaKuSCTzW2ZqjQRIhlj2P.ouOAgZGP88S1SR5AUan6htWKX5EUlIq', 'Елена', 'Михайлова', 'parent', 'active', 'Europe/Moscow', NOW(), NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'parent5@example.com', '$2b$12$ZaKuSCTzW2ZqjQRIhlj2P.ouOAgZGP88S1SR5AUan6htWKX5EUlIq', 'Сергей', 'Козлов', 'parent', 'active', 'Asia/Tashkent', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. Специалисты (профили)
-- ============================================================

INSERT INTO specialist (id, user_id, specialty, license_number, license_valid_until, experience_years, bio, created_at, updated_at) VALUES
  ('bbb11111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'neuropsychologist', 'NP-2024-001', '2026-12-31', 8, 'Опытный нейропсихолог', NOW(), NOW()),
  ('ccc22222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'speech_therapist', 'SP-2024-002', '2026-06-30', 5, 'Логопед с опытом', NOW(), NOW()),
  ('ddd33333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 'aba', 'ABA-2024-003', '2025-12-31', 3, 'Сертифицированный ABA-терапевт', NOW(), NOW()),
  ('eee44444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'supervisor', 'SUP-2024-004', '2027-12-31', 15, 'Супервизор с большим опытом', NOW(), NOW())
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- 3. Дети
-- ============================================================

INSERT INTO child (id, first_name, last_name, birth_date, gender, diagnosis_summary, notes, created_at, updated_at) VALUES
  ('aaaa1111-1111-1111-1111-111111111111', 'Алиса', 'Иванова', '2018-05-15', 'female', 'РАС, средняя степень тяжести', 'Любит конструкторы', NOW(), NOW()),
  ('bbbb2222-2222-2222-2222-222222222222', 'Борис', 'Петров', '2019-11-20', 'male', 'РАС легкой степени', 'Интересуется рисованием', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. Связь детей с родителями
-- ============================================================

INSERT INTO children_parents (id, child_id, parent_user_id, relationship, legal_guardian, linked_at) VALUES
  (gen_random_uuid(), 'aaaa1111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'father', true, NOW()),
  (gen_random_uuid(), 'bbbb2222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'father', true, NOW())
ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. Назначение специалистов детям
-- ============================================================

INSERT INTO children_specialists (id, child_id, specialist_id, specialization, is_primary, role_description, assigned_at) VALUES
  -- Алиса: specialist1 (lead), specialist2 (speech), specialist3 (aba)
  (gen_random_uuid(), 'aaaa1111-1111-1111-1111-111111111111', 'bbb11111-1111-1111-1111-111111111111', 'lead', true, 'Ведущий специалист', NOW()),
  (gen_random_uuid(), 'aaaa1111-1111-1111-1111-111111111111', 'ccc22222-2222-2222-2222-222222222222', 'speech', false, 'Коррекция речевого развития', NOW()),
  (gen_random_uuid(), 'aaaa1111-1111-1111-1111-111111111111', 'ddd33333-3333-3333-3333-333333333333', 'aba', false, 'Поведенческая терапия', NOW()),
  -- Борис: specialist1 (lead), specialist2 (speech)
  (gen_random_uuid(), 'bbbb2222-2222-2222-2222-222222222222', 'bbb11111-1111-1111-1111-111111111111', 'lead', true, 'Ведущий специалист', NOW()),
  (gen_random_uuid(), 'bbbb2222-2222-2222-2222-222222222222', 'ccc22222-2222-2222-2222-222222222222', 'speech', false, 'Развитие коммуникативных навыков', NOW())
ON CONFLICT DO NOTHING;

-- Примечание: остальные данные (упражнения, маршруты, назначения и т.д.)
-- будут созданы через seed.ts после того как TypeScript seed заработает
