/**
 * Notifications API Type Definitions & Validation Schemas
 *
 * Соответствует API_CONTRACTS_MVP.md v0.9 Section 10 (Communications Service)
 * Двухслойная архитектура:
 * - notifications (delivery tracking)
 * - user_notifications (in-app UI layer)
 */

import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

export const NotificationChannelSchema = z.enum(['email', 'sms', 'push', 'telegram']);
export type NotificationChannel = z.infer<typeof NotificationChannelSchema>;

export const NotificationStatusSchema = z.enum(['pending', 'sent', 'failed', 'bounced']);
export type NotificationStatus = z.infer<typeof NotificationStatusSchema>;

export const UserNotificationTypeSchema = z.enum([
  'assignment_reminder',
  'report_ready',
  'goal_achieved',
  'route_update',
  'system_message',
]);
export type UserNotificationType = z.infer<typeof UserNotificationTypeSchema>;

export const UserNotificationStatusSchema = z.enum(['unread', 'read', 'archived']);
export type UserNotificationStatus = z.infer<typeof UserNotificationStatusSchema>;

// ============================================================================
// User Notifications API (Section 10.1)
// ============================================================================

/**
 * User Notification (in-app UI layer)
 * API_CONTRACTS_MVP.md:798-840
 */
export const UserNotificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: UserNotificationTypeSchema,
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1000),
  link: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  status: UserNotificationStatusSchema,
  readAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});
export type UserNotification = z.infer<typeof UserNotificationSchema>;

/**
 * GET /user-notifications/v1 Response
 */
export const UserNotificationsListResponseSchema = z.object({
  data: z.object({
    items: z.array(UserNotificationSchema),
    total: z.number().int().min(0),
    unread: z.number().int().min(0),
    cursor: z.string().optional(),
  }),
});
export type UserNotificationsListResponse = z.infer<typeof UserNotificationsListResponseSchema>;

/**
 * PATCH /user-notifications/v1/:id/read Response
 */
export const MarkNotificationReadResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.literal('read'),
  readAt: z.string().datetime(),
});
export type MarkNotificationReadResponse = z.infer<typeof MarkNotificationReadResponseSchema>;

/**
 * PATCH /user-notifications/v1/read-all Response
 */
export const MarkAllNotificationsReadResponseSchema = z.object({
  markedAsRead: z.number().int().min(0),
  timestamp: z.string().datetime(),
});
export type MarkAllNotificationsReadResponse = z.infer<typeof MarkAllNotificationsReadResponseSchema>;

/**
 * DELETE /user-notifications/v1/:id Response
 */
export const ArchiveNotificationResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.literal('archived'),
});
export type ArchiveNotificationResponse = z.infer<typeof ArchiveNotificationResponseSchema>;

// ============================================================================
// Notification Preferences API (Section 10.2)
// ============================================================================

/**
 * Notification Channel Preferences
 */
export const NotificationChannelPreferencesSchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
  telegram: z.boolean(),
  inApp: z.boolean(),
});
export type NotificationChannelPreferences = z.infer<typeof NotificationChannelPreferencesSchema>;

/**
 * Quiet Hours Configuration
 */
export const QuietHoursSchema = z.object({
  enabled: z.boolean(),
  start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
  end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
  timezone: z.string().min(1),
});
export type QuietHours = z.infer<typeof QuietHoursSchema>;

/**
 * Notification Preferences
 * API_CONTRACTS_MVP.md:905-953
 */
export const NotificationPreferencesSchema = z.object({
  userId: z.string().uuid(),
  preferences: z.record(UserNotificationTypeSchema, NotificationChannelPreferencesSchema),
  quietHours: QuietHoursSchema,
  updatedAt: z.string().datetime(),
});
export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;

/**
 * PATCH /notification-preferences/v1 Request
 */
export const UpdateNotificationPreferencesRequestSchema = z.object({
  preferences: z.record(UserNotificationTypeSchema, NotificationChannelPreferencesSchema.partial()).optional(),
  quietHours: QuietHoursSchema.partial().optional(),
}).refine(
  (data) => data.preferences !== undefined || data.quietHours !== undefined,
  { message: 'At least one field (preferences or quietHours) must be provided' }
);
export type UpdateNotificationPreferencesRequest = z.infer<typeof UpdateNotificationPreferencesRequestSchema>;

// ============================================================================
// Delivery Layer (existing notifications table)
// ============================================================================

/**
 * Notification (delivery tracking layer)
 * API_CONTRACTS_MVP.md:784-792
 */
export const NotificationDeliverySchema = z.object({
  id: z.string().uuid(),
  recipientId: z.string().uuid(),
  channel: NotificationChannelSchema,
  template: z.string().min(1),
  payload: z.record(z.unknown()),
  status: NotificationStatusSchema,
  attempts: z.number().int().min(0),
  scheduledAt: z.string().datetime().nullable(),
  sentAt: z.string().datetime().nullable(),
  lastError: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type NotificationDelivery = z.infer<typeof NotificationDeliverySchema>;

/**
 * POST /comms/v1/notifications Request
 */
export const CreateNotificationRequestSchema = z.object({
  recipientId: z.string().uuid(),
  channel: NotificationChannelSchema,
  template: z.string().min(1),
  data: z.record(z.unknown()),
  scheduledAt: z.string().datetime().optional(),
});
export type CreateNotificationRequest = z.infer<typeof CreateNotificationRequestSchema>;

// ============================================================================
// Validation Helpers
// ============================================================================

export function validateUpdateNotificationPreferences(data: unknown): UpdateNotificationPreferencesRequest {
  return UpdateNotificationPreferencesRequestSchema.parse(data);
}

export function safeValidateUpdateNotificationPreferences(data: unknown) {
  return UpdateNotificationPreferencesRequestSchema.safeParse(data);
}

export function validateCreateNotification(data: unknown): CreateNotificationRequest {
  return CreateNotificationRequestSchema.parse(data);
}

export function safeValidateCreateNotification(data: unknown) {
  return CreateNotificationRequestSchema.safeParse(data);
}

// ============================================================================
// Usage Examples
// ============================================================================

/*
// Backend: Update notification preferences
import { safeValidateUpdateNotificationPreferences } from '@neiro/types/notifications';

export async function PATCH(req: Request) {
  const body = await req.json();
  const result = safeValidateUpdateNotificationPreferences(body);

  if (!result.success) {
    return Response.json(
      { error: 'Invalid preferences', details: result.error.flatten() },
      { status: 400 }
    );
  }

  const preferences = await notificationService.updatePreferences(
    req.user.id,
    result.data
  );
  return Response.json(preferences);
}

// Frontend: Fetch user notifications
import { UserNotificationsListResponseSchema } from '@neiro/types/notifications';

const response = await fetch('/api/user-notifications');
const data = await response.json();

const validated = UserNotificationsListResponseSchema.parse(data);
// validated.data.items is type-safe array of UserNotification
*/
