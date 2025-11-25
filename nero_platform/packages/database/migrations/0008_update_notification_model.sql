-- Migration 0008: Update Notification Model (Delivery Layer)
-- Date: 2025-01-24
-- Purpose: Add explicit fields for queries and foreign keys (Hybrid Approach)
-- Based on: NOTIFICATIONS_SPLIT_PROPOSAL.md + DATA_MODEL_AND_EVENTS.md v0.5

-- ============================================================
-- 1. Add new columns to notifications table
-- ============================================================

ALTER TABLE notifications
  ADD COLUMN recipient_id UUID,
  ADD COLUMN template VARCHAR(100),
  ADD COLUMN last_error TEXT;

-- ============================================================
-- 2. Migrate existing data from payload to explicit fields
-- ============================================================

-- Extract recipient_id from payload (if exists)
UPDATE notifications
SET recipient_id = (payload->>'recipient_id')::uuid
WHERE
  payload ? 'recipient_id' AND
  (payload->>'recipient_id') ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Extract template from payload (if exists)
UPDATE notifications
SET template = payload->>'template'
WHERE payload ? 'template';

-- Extract last_error from payload (if exists)
UPDATE notifications
SET last_error = payload->>'last_error'
WHERE payload ? 'last_error';

-- ============================================================
-- 3. Add foreign key constraint
-- ============================================================

-- Add foreign key to users table
ALTER TABLE notifications
  ADD CONSTRAINT fk_notifications_recipient
  FOREIGN KEY (recipient_id)
  REFERENCES users(id)
  ON DELETE CASCADE;

-- Make recipient_id NOT NULL (after data migration)
ALTER TABLE notifications
  ALTER COLUMN recipient_id SET NOT NULL;

-- ============================================================
-- 4. Create performance indexes
-- ============================================================

-- Index for queries by recipient and status
CREATE INDEX idx_notifications_recipient_status
  ON notifications(recipient_id, status)
  WHERE status IN ('pending', 'failed');

-- Index for scheduled delivery queries
CREATE INDEX idx_notifications_scheduled
  ON notifications(status, scheduled_at)
  WHERE status = 'pending';

-- Index for template analytics
CREATE INDEX idx_notifications_template
  ON notifications(template)
  WHERE template IS NOT NULL;

-- Index for error monitoring
CREATE INDEX idx_notifications_last_error
  ON notifications(last_error)
  WHERE last_error IS NOT NULL;

-- ============================================================
-- 5. Add comments for documentation
-- ============================================================

COMMENT ON TABLE notifications IS 'Delivery layer: tracks email/SMS/push delivery status and queue';
COMMENT ON COLUMN notifications.recipient_id IS 'User who should receive the notification (FK to users.id)';
COMMENT ON COLUMN notifications.template IS 'Email template name (e.g., assignment_reminder, report_reviewed)';
COMMENT ON COLUMN notifications.last_error IS 'Last delivery error message (for monitoring and retry logic)';
COMMENT ON COLUMN notifications.payload IS 'Channel-specific data (email: subject/body, SMS: text, push: title/body)';

-- ============================================================
-- 6. Update event_outbox for comms.notification.sent event
-- ============================================================

-- This migration aligns with DATA_MODEL_AND_EVENTS.md v0.5 event:
-- comms.notification.sent { recipient_id, template, sent_at, status }
-- Now all these fields are explicit in the notifications table
