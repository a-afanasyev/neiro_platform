-- Rollback for Migration 0008
-- Date: 2025-01-24

-- ============================================================
-- 1. Drop indexes
-- ============================================================

DROP INDEX IF EXISTS idx_notifications_recipient_status;
DROP INDEX IF EXISTS idx_notifications_scheduled;
DROP INDEX IF EXISTS idx_notifications_template;
DROP INDEX IF EXISTS idx_notifications_last_error;

-- ============================================================
-- 2. Remove foreign key constraint
-- ============================================================

ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS fk_notifications_recipient;

-- ============================================================
-- 3. Migrate data back to payload (optional, for safety)
-- ============================================================

-- Move recipient_id back to payload
UPDATE notifications
SET payload = jsonb_set(
  payload,
  '{recipient_id}',
  to_jsonb(recipient_id::text)
)
WHERE recipient_id IS NOT NULL;

-- Move template back to payload
UPDATE notifications
SET payload = jsonb_set(
  payload,
  '{template}',
  to_jsonb(template)
)
WHERE template IS NOT NULL;

-- Move last_error back to payload
UPDATE notifications
SET payload = jsonb_set(
  payload,
  '{last_error}',
  to_jsonb(last_error)
)
WHERE last_error IS NOT NULL;

-- ============================================================
-- 4. Drop columns
-- ============================================================

ALTER TABLE notifications
  DROP COLUMN IF EXISTS recipient_id CASCADE,
  DROP COLUMN IF EXISTS template,
  DROP COLUMN IF EXISTS last_error;

-- ============================================================
-- 5. Remove comments
-- ============================================================

COMMENT ON TABLE notifications IS NULL;
COMMENT ON COLUMN notifications.payload IS NULL;
