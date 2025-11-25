-- Migration 0009: Create UserNotification Table (UI Layer)
-- Date: 2025-01-24
-- Purpose: In-app notifications for user interface (read/unread tracking)
-- Based on: NOTIFICATIONS_SPLIT_PROPOSAL.md + API_CONTRACTS_MVP.md v0.9 Section 10.1

-- ============================================================
-- 0. Enable UUID extension
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. Create user_notifications table
-- ============================================================

CREATE TABLE user_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  notification_id UUID,  -- Optional link to delivery notification
  type VARCHAR(50) NOT NULL,
  title VARCHAR(150) NOT NULL,
  body TEXT NOT NULL,
  link VARCHAR(255),
  status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Foreign keys
  CONSTRAINT fk_user_notifications_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_user_notifications_notification
    FOREIGN KEY (notification_id)
    REFERENCES notifications(id)
    ON DELETE SET NULL
);

-- ============================================================
-- 2. Create indexes for performance
-- ============================================================

-- Primary query: user's unread notifications
CREATE INDEX idx_user_notifications_user_status
  ON user_notifications(user_id, status, created_at DESC)
  WHERE status = 'unread';

-- Query: all notifications for user (with pagination)
CREATE INDEX idx_user_notifications_user_created
  ON user_notifications(user_id, created_at DESC);

-- Query: notifications by type (for analytics)
CREATE INDEX idx_user_notifications_type
  ON user_notifications(type, created_at DESC);

-- Query: link to delivery notification (for tracking)
CREATE INDEX idx_user_notifications_notification_id
  ON user_notifications(notification_id)
  WHERE notification_id IS NOT NULL;

-- ============================================================
-- 3. Add table comments
-- ============================================================

COMMENT ON TABLE user_notifications IS 'UI layer: in-app notifications with read/unread status for user interface';
COMMENT ON COLUMN user_notifications.user_id IS 'Owner of the notification (parent, specialist, etc.)';
COMMENT ON COLUMN user_notifications.notification_id IS 'Optional link to delivery notification (if sent via email/SMS)';
COMMENT ON COLUMN user_notifications.type IS 'Notification type: assignment_reminder, report_reviewed, goal_achieved, route_update, system_message';
COMMENT ON COLUMN user_notifications.title IS 'Notification title for UI (short, 150 chars max)';
COMMENT ON COLUMN user_notifications.body IS 'Notification body text for UI';
COMMENT ON COLUMN user_notifications.link IS 'Deep link to relevant page (e.g., /dashboard/reports/:id)';
COMMENT ON COLUMN user_notifications.status IS 'Read status: unread (default), read, archived';
COMMENT ON COLUMN user_notifications.read_at IS 'Timestamp when user marked as read';

-- ============================================================
-- 4. Create notification types enum check (optional validation)
-- ============================================================

-- Valid notification types from API_CONTRACTS_MVP.md v0.9
ALTER TABLE user_notifications
  ADD CONSTRAINT chk_user_notifications_type
  CHECK (type IN (
    'assignment_reminder',
    'assignment_overdue',
    'report_submitted',
    'report_reviewed',
    'goal_achieved',
    'route_updated',
    'route_completed',
    'system_message',
    'account_update'
  ));

-- ============================================================
-- 5. Add trigger for automatic read_at timestamp
-- ============================================================

CREATE OR REPLACE FUNCTION set_user_notification_read_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically set read_at when status changes to 'read'
  IF NEW.status = 'read' AND OLD.status != 'read' AND NEW.read_at IS NULL THEN
    NEW.read_at = NOW();
  END IF;

  -- Clear read_at if status changes back to 'unread'
  IF NEW.status = 'unread' AND OLD.status = 'read' THEN
    NEW.read_at = NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_notification_read_at
  BEFORE UPDATE ON user_notifications
  FOR EACH ROW
  EXECUTE FUNCTION set_user_notification_read_at();

-- ============================================================
-- 6. Create view for unread count per user
-- ============================================================

CREATE OR REPLACE VIEW user_notification_counts AS
SELECT
  user_id,
  COUNT(*) FILTER (WHERE status = 'unread') as unread_count,
  COUNT(*) FILTER (WHERE status = 'read') as read_count,
  COUNT(*) FILTER (WHERE status = 'archived') as archived_count,
  COUNT(*) as total_count,
  MAX(created_at) FILTER (WHERE status = 'unread') as latest_unread_at
FROM user_notifications
GROUP BY user_id;

COMMENT ON VIEW user_notification_counts IS 'Aggregated notification counts per user for dashboard badge';
