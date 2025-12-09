-- Скрипт для исправления связи между упражнениями и назначениями
-- Проблема: в базе есть упражнения и диагностические сессии, но они не связаны с назначениями

-- Обновляем существующие назначения, добавляя упражнения из шаблонов маршрутов
UPDATE assignments 
SET exercise_id = (
  SELECT te.exercise_id 
  FROM template_exercises te 
  JOIN route_templates rt ON te.template_id = rt.id 
  JOIN routes r ON r.template_id = rt.id 
  WHERE r.child_id = assignments.child_id 
    AND r.status = 'active'
    AND te.exercise_id IS NOT NULL
    AND assignments.exercise_id IS NULL
    ORDER BY r.created_at DESC, te.order_index
    LIMIT 1
  )
WHERE exercise_id IS NULL;

-- Выводим результат
DO $$
BEGIN
  RAISE NOTICE 'Обновлено назначений с упражнениями: ' || ROW_COUNT || '0';
END;
$$;
