-- Rollback for Migration 0010
-- Date: 2025-01-24

-- ============================================================
-- 1. Drop trigger on users table
-- ============================================================

DROP TRIGGER IF EXISTS trg_create_notification_preferences ON users;

-- ============================================================
-- 2. Drop functions
-- ============================================================

DROP FUNCTION IF EXISTS create_default_notification_preferences();
DROP FUNCTION IF EXISTS get_default_notification_preferences();
DROP FUNCTION IF EXISTS is_notification_allowed(UUID, VARCHAR, VARCHAR, TIMESTAMPTZ);

-- ============================================================
-- 3. Drop indexes
-- ============================================================

DROP INDEX IF EXISTS idx_notification_preferences_user;
DROP INDEX IF EXISTS idx_notification_preferences_jsonb;

-- ============================================================
-- 4. Drop table
-- ============================================================

DROP TABLE IF EXISTS notification_preferences CASCADE;
