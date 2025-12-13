-- Insert 5 completed assignments and reports for progress tests
-- Child: Алиса (a884a19f-e41a-42fb-b528-d7d3c3e0fa26)
-- Specialist: specialist1 (51111111-1111-1111-1111-111111111111)
-- Parent: parent1 (91111111-1111-1111-1111-111111111111)

-- Assignment 1: 10 days ago, good mood
INSERT INTO assignments (
  id, child_id, exercise_id, assigned_by_id, specialist_id, route_id, phase_id,
  planned_start_date, due_date, status, delivery_channel, frequency_per_week, expected_duration_minutes
) VALUES (
  '10000001-0000-0000-0000-000000000001'::uuid,
  'a884a19f-e41a-42fb-b528-d7d3c3e0fa26'::uuid,
  'd0de8dfc-f23b-4e2b-8363-4545bd925fd7'::uuid,
  '51111111-1111-1111-1111-111111111111'::uuid,
  '51111111-1111-1111-1111-111111111111'::uuid,
  'be3b07cf-4786-4e2d-b76c-8bb1b7e6d6da'::uuid,
  '0bc7c875-9481-487e-9070-f4b91987c81b'::uuid,
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '10 days',
  'completed',
  'home',
  3,
  25
) ON CONFLICT (id) DO NOTHING;

INSERT INTO reports (
  id, assignment_id, parent_id, submitted_at, status, duration_minutes,
  child_mood, feedback_text, auto_score, review_status, reviewed_by, reviewed_at
) VALUES (
  '20000001-0000-0000-0000-000000000001'::uuid,
  '10000001-0000-0000-0000-000000000001'::uuid,
  '91111111-1111-1111-1111-111111111111'::uuid,
  NOW() - INTERVAL '10 days',
  'completed',
  28,
  'good',
  'Отлично выполнено!',
  88.0,
  'approved',
  '51111111-1111-1111-1111-111111111111'::uuid,
  NOW() - INTERVAL '9 days'
) ON CONFLICT (id) DO NOTHING;

-- Assignment 2: 7 days ago, good mood
INSERT INTO assignments (
  id, child_id, exercise_id, assigned_by_id, specialist_id, route_id, phase_id,
  planned_start_date, due_date, status, delivery_channel, frequency_per_week, expected_duration_minutes
) VALUES (
  '10000002-0000-0000-0000-000000000002'::uuid,
  'a884a19f-e41a-42fb-b528-d7d3c3e0fa26'::uuid,
  'd0de8dfc-f23b-4e2b-8363-4545bd925fd7'::uuid,
  '51111111-1111-1111-1111-111111111111'::uuid,
  '51111111-1111-1111-1111-111111111111'::uuid,
  'be3b07cf-4786-4e2d-b76c-8bb1b7e6d6da'::uuid,
  '0bc7c875-9481-487e-9070-f4b91987c81b'::uuid,
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days',
  'completed',
  'home',
  3,
  25
) ON CONFLICT (id) DO NOTHING;

INSERT INTO reports (
  id, assignment_id, parent_id, submitted_at, status, duration_minutes,
  child_mood, feedback_text, auto_score, review_status, reviewed_by, reviewed_at
) VALUES (
  '20000002-0000-0000-0000-000000000002'::uuid,
  '10000002-0000-0000-0000-000000000002'::uuid,
  '91111111-1111-1111-1111-111111111111'::uuid,
  NOW() - INTERVAL '7 days',
  'completed',
  26,
  'good',
  'Хорошая работа!',
  85.0,
  'approved',
  '51111111-1111-1111-1111-111111111111'::uuid,
  NOW() - INTERVAL '6 days'
) ON CONFLICT (id) DO NOTHING;

-- Assignment 3: 5 days ago, neutral mood
INSERT INTO assignments (
  id, child_id, exercise_id, assigned_by_id, specialist_id, route_id, phase_id,
  planned_start_date, due_date, status, delivery_channel, frequency_per_week, expected_duration_minutes
) VALUES (
  '10000003-0000-0000-0000-000000000003'::uuid,
  'a884a19f-e41a-42fb-b528-d7d3c3e0fa26'::uuid,
  'd0de8dfc-f23b-4e2b-8363-4545bd925fd7'::uuid,
  '51111111-1111-1111-1111-111111111111'::uuid,
  '51111111-1111-1111-1111-111111111111'::uuid,
  'be3b07cf-4786-4e2d-b76c-8bb1b7e6d6da'::uuid,
  '0bc7c875-9481-487e-9070-f4b91987c81b'::uuid,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days',
  'completed',
  'home',
  3,
  25
) ON CONFLICT (id) DO NOTHING;

INSERT INTO reports (
  id, assignment_id, parent_id, submitted_at, status, duration_minutes,
  child_mood, feedback_text, auto_score, review_status, reviewed_by, reviewed_at
) VALUES (
  '20000003-0000-0000-0000-000000000003'::uuid,
  '10000003-0000-0000-0000-000000000003'::uuid,
  '91111111-1111-1111-1111-111111111111'::uuid,
  NOW() - INTERVAL '5 days',
  'completed',
  24,
  'neutral',
  'Нормально выполнено',
  75.0,
  'approved',
  '51111111-1111-1111-1111-111111111111'::uuid,
  NOW() - INTERVAL '4 days'
) ON CONFLICT (id) DO NOTHING;

-- Assignment 4: 3 days ago, good mood
INSERT INTO assignments (
  id, child_id, exercise_id, assigned_by_id, specialist_id, route_id, phase_id,
  planned_start_date, due_date, status, delivery_channel, frequency_per_week, expected_duration_minutes
) VALUES (
  '10000004-0000-0000-0000-000000000004'::uuid,
  'a884a19f-e41a-42fb-b528-d7d3c3e0fa26'::uuid,
  'd0de8dfc-f23b-4e2b-8363-4545bd925fd7'::uuid,
  '51111111-1111-1111-1111-111111111111'::uuid,
  '51111111-1111-1111-1111-111111111111'::uuid,
  'be3b07cf-4786-4e2d-b76c-8bb1b7e6d6da'::uuid,
  '0bc7c875-9481-487e-9070-f4b91987c81b'::uuid,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days',
  'completed',
  'home',
  3,
  25
) ON CONFLICT (id) DO NOTHING;

INSERT INTO reports (
  id, assignment_id, parent_id, submitted_at, status, duration_minutes,
  child_mood, feedback_text, auto_score, review_status, reviewed_by, reviewed_at
) VALUES (
  '20000004-0000-0000-0000-000000000004'::uuid,
  '10000004-0000-0000-0000-000000000004'::uuid,
  '91111111-1111-1111-1111-111111111111'::uuid,
  NOW() - INTERVAL '3 days',
  'completed',
  27,
  'good',
  'Отлично!',
  90.0,
  'approved',
  '51111111-1111-1111-1111-111111111111'::uuid,
  NOW() - INTERVAL '2 days'
) ON CONFLICT (id) DO NOTHING;

-- Assignment 5: 1 day ago, difficult mood
INSERT INTO assignments (
  id, child_id, exercise_id, assigned_by_id, specialist_id, route_id, phase_id,
  planned_start_date, due_date, status, delivery_channel, frequency_per_week, expected_duration_minutes
) VALUES (
  '10000005-0000-0000-0000-000000000005'::uuid,
  'a884a19f-e41a-42fb-b528-d7d3c3e0fa26'::uuid,
  'd0de8dfc-f23b-4e2b-8363-4545bd925fd7'::uuid,
  '51111111-1111-1111-1111-111111111111'::uuid,
  '51111111-1111-1111-1111-111111111111'::uuid,
  'be3b07cf-4786-4e2d-b76c-8bb1b7e6d6da'::uuid,
  '0bc7c875-9481-487e-9070-f4b91987c81b'::uuid,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day',
  'completed',
  'home',
  3,
  25
) ON CONFLICT (id) DO NOTHING;

INSERT INTO reports (
  id, assignment_id, parent_id, submitted_at, status, duration_minutes,
  child_mood, feedback_text, auto_score, review_status, reviewed_by, reviewed_at
) VALUES (
  '20000005-0000-0000-0000-000000000005'::uuid,
  '10000005-0000-0000-0000-000000000005'::uuid,
  '91111111-1111-1111-1111-111111111111'::uuid,
  NOW() - INTERVAL '1 day',
  'completed',
  30,
  'difficult',
  'Было сложно, но справились',
  70.0,
  'approved',
  '51111111-1111-1111-1111-111111111111'::uuid,
  NOW()
) ON CONFLICT (id) DO NOTHING;
