import { PrismaClient } from '@neiro/database';
import { logger } from '../utils/logger';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export interface NotificationChannelPreferences {
  emailEnabled: boolean;
  inAppEnabled: boolean;
  assignmentReminders: boolean;
  reportUpdates: boolean;
  routeChanges: boolean;
}

export interface QuietHoursSettings {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface UpdatePreferencesPayload {
  preferences: NotificationChannelPreferences;
  quietHours?: QuietHoursSettings;
}

const DEFAULT_PREFERENCES: NotificationChannelPreferences = {
  emailEnabled: true,
  inAppEnabled: true,
  assignmentReminders: true,
  reportUpdates: true,
  routeChanges: true,
};

const DEFAULT_QUIET_HOURS: QuietHoursSettings = {
  enabled: false,
  startTime: '22:00',
  endTime: '08:00',
};

export class PreferencesService {
  async getPreferences(userId: string) {
    const preference = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!preference) {
      return {
        userId,
        preferences: DEFAULT_PREFERENCES,
        quietHours: DEFAULT_QUIET_HOURS,
      };
    }

    return {
      userId,
      preferences: {
        ...DEFAULT_PREFERENCES,
        ...(preference.preferences as NotificationChannelPreferences),
      },
      quietHours: {
        ...DEFAULT_QUIET_HOURS,
        ...(preference.quietHours as QuietHoursSettings | null),
      },
    };
  }

  async updatePreferences(userId: string, payload: UpdatePreferencesPayload) {
    const preferences = {
      ...DEFAULT_PREFERENCES,
      ...(payload.preferences || {}),
    };

    const quietHours = payload.quietHours
      ? { ...DEFAULT_QUIET_HOURS, ...payload.quietHours }
      : DEFAULT_QUIET_HOURS;

    await prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        preferences,
        quietHours,
      },
      update: {
        preferences,
        quietHours,
      },
    });

    logger.info('Notification preferences updated', { userId });

    return {
      userId,
      preferences,
      quietHours,
    };
  }
}

export const preferencesService = new PreferencesService();

