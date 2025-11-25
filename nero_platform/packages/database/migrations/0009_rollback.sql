-- Rollback for Migration 0009
-- Date: 2025-01-24

-- ============================================================
-- 1. Drop view
-- ============================================================

DROP VIEW IF EXISTS user_notification_counts;

-- ============================================================
-- 2. Drop trigger and function
-- ============================================================

DROP TRIGGER IF EXISTS trg_user_notification_read_at ON user_notifications;
DROP FUNCTION IF EXISTS set_user_notification_read_at();

-- ============================================================
-- 3. Drop indexes
-- ============================================================

DROP INDEX IF EXISTS idx_user_notifications_user_status;
DROP INDEX IF EXISTS idx_user_notifications_user_created;
DROP INDEX IF EXISTS idx_user_notifications_type;
DROP INDEX IF EXISTS idx_user_notifications_notification_id;

-- ============================================================
-- 4. Drop table
-- ============================================================

DROP TABLE IF EXISTS user_notifications CASCADE;
