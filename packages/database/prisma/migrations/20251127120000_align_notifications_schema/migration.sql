-- Align notifications schema with application models

-- Extend delivery layer table with recipient, template and error tracking
ALTER TABLE "notifications"
  ADD COLUMN IF NOT EXISTS "recipient_id" UUID,
  ADD COLUMN IF NOT EXISTS "template" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "last_error" TEXT;

-- Add required indexes for delivery processing
CREATE INDEX IF NOT EXISTS "notifications_recipient_status_idx" ON "notifications"("recipient_id", "status");
CREATE INDEX IF NOT EXISTS "notifications_status_scheduled_at_idx" ON "notifications"("status", "scheduled_at");

-- Ensure FK to users for recipient
ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "notifications_recipient_id_fkey";
ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_recipient_id_fkey"
  FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- UI layer: in-app notifications
CREATE TABLE IF NOT EXISTS "user_notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "notification_id" UUID,
    "type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "body" TEXT NOT NULL,
    "link" VARCHAR(255),
    "status" VARCHAR(20) NOT NULL DEFAULT 'unread',
    "read_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "user_notifications_user_id_status_created_at_idx"
  ON "user_notifications"("user_id", "status", "created_at");
CREATE INDEX IF NOT EXISTS "user_notifications_user_id_created_at_idx"
  ON "user_notifications"("user_id", "created_at");

ALTER TABLE "user_notifications" DROP CONSTRAINT IF EXISTS "user_notifications_user_id_fkey";
ALTER TABLE "user_notifications"
  ADD CONSTRAINT "user_notifications_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_notifications" DROP CONSTRAINT IF EXISTS "user_notifications_notification_id_fkey";
ALTER TABLE "user_notifications"
  ADD CONSTRAINT "user_notifications_notification_id_fkey"
  FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Notification preferences
CREATE TABLE IF NOT EXISTS "notification_preferences" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "preferences" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "quiet_hours" JSONB,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notification_preferences_user_id_key" UNIQUE ("user_id")
);

ALTER TABLE "notification_preferences" DROP CONSTRAINT IF EXISTS "notification_preferences_user_id_fkey";
ALTER TABLE "notification_preferences"
  ADD CONSTRAINT "notification_preferences_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
