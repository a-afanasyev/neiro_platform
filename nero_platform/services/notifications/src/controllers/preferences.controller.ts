import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { preferencesService, UpdatePreferencesPayload } from '../services/preferences.service';
import { ValidationError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const isValidTime = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

export const getPreferences = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const preferences = await preferencesService.getPreferences(userId);

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error: any) {
    logger.error('Failed to load notification preferences', {
      userId: req.user?.userId,
      error: error.message,
    });
    throw error;
  }
};

export const updatePreferences = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const payload = req.body as UpdatePreferencesPayload;

    if (!payload || !payload.preferences) {
      throw new ValidationError('Preferences payload is required');
    }

    if (payload.quietHours) {
      const { startTime, endTime } = payload.quietHours;
      if (!isValidTime(startTime) || !isValidTime(endTime)) {
        throw new ValidationError('Quiet hours must use HH:MM format');
      }
    }

    const updated = await preferencesService.updatePreferences(userId, payload);

    res.json({
      success: true,
      message: 'Notification preferences updated',
      data: updated,
    });
  } catch (error: any) {
    logger.error('Failed to update notification preferences', {
      userId: req.user?.userId,
      error: error.message,
    });
    throw error;
  }
};

