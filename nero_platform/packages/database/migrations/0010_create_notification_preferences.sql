-- Migration 0010: Create NotificationPreference Table
-- Date: 2025-01-24
-- Purpose: User notification preferences (channels and quiet hours)
-- Based on: NOTIFICATIONS_SPLIT_PROPOSAL.md + API_CONTRACTS_MVP.md v0.9 Section 10.2

-- ============================================================
-- 0. Enable UUID extension
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. Create notification_preferences table
-- ============================================================

CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL,
  preferences JSONB NOT NULL DEFAULT '{}',
  quiet_hours JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Foreign key
  CONSTRAINT fk_notification_preferences_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- ============================================================
-- 2. Create indexes
-- ============================================================

-- Unique index on user_id (enforces one preference per user)
CREATE UNIQUE INDEX idx_notification_preferences_user
  ON notification_preferences(user_id);

-- GIN index for JSONB queries (for filtering by specific preference)
CREATE INDEX idx_notification_preferences_jsonb
  ON notification_preferences USING GIN (preferences);

-- ============================================================
-- 3. Add table comments
-- ============================================================

COMMENT ON TABLE notification_preferences IS 'User notification preferences: channels, types, and quiet hours';
COMMENT ON COLUMN notification_preferences.user_id IS 'User who owns these preferences (one-to-one with users)';
COMMENT ON COLUMN notification_preferences.preferences IS 'JSONB object with notification type preferences (see schema below)';
COMMENT ON COLUMN notification_preferences.quiet_hours IS 'JSONB object with quiet hours settings: { enabled, start, end, timezone }';

-- ============================================================
-- 4. Add JSON schema validation
-- ============================================================

-- Preferences schema (from API_CONTRACTS_MVP.md v0.9):
-- {
--   "assignment_reminder": {
--     "email": true,
--     "push": false,
--     "telegram": false,
--     "inApp": true
--   },
--   "report_reviewed": { ... },
--   ...
-- }

-- Quiet hours schema:
-- {
--   "enabled": true,
--   "start": "22:00",
--   "end": "08:00",
--   "timezone": "Europe/Moscow"
-- }

-- Add check constraint for quiet_hours structure
ALTER TABLE notification_preferences
  ADD CONSTRAINT chk_quiet_hours_structure
  CHECK (
    quiet_hours IS NULL OR (
      quiet_hours ? 'enabled' AND
      quiet_hours ? 'start' AND
      quiet_hours ? 'end'
    )
  );

-- ============================================================
-- 5. Create function for default preferences
-- ============================================================

CREATE OR REPLACE FUNCTION get_default_notification_preferences()
RETURNS JSONB AS $$
BEGIN
  RETURN '{
    "assignment_reminder": {
      "email": true,
      "push": true,
      "telegram": false,
      "inApp": true
    },
    "assignment_overdue": {
      "email": true,
      "push": true,
      "telegram": false,
      "inApp": true
    },
    "report_submitted": {
      "email": true,
      "push": false,
      "telegram": false,
      "inApp": true
    },
    "report_reviewed": {
      "email": true,
      "push": true,
      "telegram": false,
      "inApp": true
    },
    "goal_achieved": {
      "email": true,
      "push": true,
      "telegram": false,
      "inApp": true
    },
    "route_updated": {
      "email": false,
      "push": false,
      "telegram": false,
      "inApp": true
    },
    "system_message": {
      "email": true,
      "push": false,
      "telegram": false,
      "inApp": true
    }
  }'::jsonb;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- 6. Create trigger for default preferences on user creation
-- ============================================================

CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-create notification preferences for new users
  INSERT INTO notification_preferences (user_id, preferences, quiet_hours)
  VALUES (
    NEW.id,
    get_default_notification_preferences(),
    '{"enabled": false, "start": "22:00", "end": "08:00", "timezone": "UTC"}'::jsonb
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_notification_preferences
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();

-- ============================================================
-- 7. Create function for checking if notification is allowed
-- ============================================================

CREATE OR REPLACE FUNCTION is_notification_allowed(
  p_user_id UUID,
  p_notification_type VARCHAR(50),
  p_channel VARCHAR(20),
  p_check_time TIMESTAMPTZ DEFAULT NOW()
)
RETURNS BOOLEAN AS $$
DECLARE
  v_preferences JSONB;
  v_quiet_hours JSONB;
  v_channel_enabled BOOLEAN;
  v_quiet_enabled BOOLEAN;
  v_is_quiet_time BOOLEAN;
BEGIN
  -- Get user preferences
  SELECT preferences, quiet_hours
  INTO v_preferences, v_quiet_hours
  FROM notification_preferences
  WHERE user_id = p_user_id;

  -- If no preferences found, allow notification (default behavior)
  IF v_preferences IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Check if channel is enabled for this notification type
  v_channel_enabled := COALESCE(
    (v_preferences -> p_notification_type ->> p_channel)::boolean,
    TRUE  -- Default to enabled if not specified
  );

  IF NOT v_channel_enabled THEN
    RETURN FALSE;
  END IF;

  -- Check quiet hours (only for email/push/sms, not in-app)
  IF p_channel IN ('email', 'push', 'sms', 'telegram') AND v_quiet_hours IS NOT NULL THEN
    v_quiet_enabled := (v_quiet_hours ->> 'enabled')::boolean;

    IF v_quiet_enabled THEN
      -- Simple time range check (simplified, production should handle timezone)
      v_is_quiet_time := (
        EXTRACT(HOUR FROM p_check_time AT TIME ZONE 'UTC')::int >=
        SPLIT_PART(v_quiet_hours ->> 'start', ':', 1)::int
        OR
        EXTRACT(HOUR FROM p_check_time AT TIME ZONE 'UTC')::int <
        SPLIT_PART(v_quiet_hours ->> 'end', ':', 1)::int
      );

      IF v_is_quiet_time THEN
        RETURN FALSE;
      END IF;
    END IF;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION is_notification_allowed IS 'Check if notification is allowed based on user preferences and quiet hours';

-- ============================================================
-- 8. Backfill existing users with default preferences
-- ============================================================

INSERT INTO notification_preferences (user_id, preferences, quiet_hours)
SELECT
  id,
  get_default_notification_preferences(),
  '{"enabled": false, "start": "22:00", "end": "08:00", "timezone": "UTC"}'::jsonb
FROM users
ON CONFLICT (user_id) DO NOTHING;
