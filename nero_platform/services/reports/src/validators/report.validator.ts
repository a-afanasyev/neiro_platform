import { z } from 'zod';

// Media item schema
const mediaItemSchema = z.object({
  mediaId: z.string().uuid(),
  type: z.enum(['photo', 'video', 'audio']),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  durationSeconds: z.number().int().positive().optional(),
  fileSizeBytes: z.number().int().positive().optional()
});

// Create report request
export const createReportSchema = z.object({
  assignmentId: z.string().uuid(),
  durationMinutes: z.number().int().min(1).max(240),
  status: z.enum(['completed', 'partial', 'failed']),
  childMood: z.enum(['good', 'neutral', 'difficult']),
  feedbackText: z.string().min(1).max(1024),
  media: z.array(mediaItemSchema).optional()
});

export type CreateReportInput = z.infer<typeof createReportSchema>;

// Update report request
export const updateReportSchema = z.object({
  durationMinutes: z.number().int().min(1).max(240).optional(),
  status: z.enum(['completed', 'partial', 'failed']).optional(),
  childMood: z.enum(['good', 'neutral', 'difficult']).optional(),
  feedbackText: z.string().min(1).max(1024).optional(),
  media: z.array(mediaItemSchema).optional()
});

export type UpdateReportInput = z.infer<typeof updateReportSchema>;

// Review report request
export const reviewReportSchema = z.object({
  reviewStatus: z.enum(['approved', 'needs_attention', 'rejected']),
  notes: z.string().max(512).optional()
});

export type ReviewReportInput = z.infer<typeof reviewReportSchema>;

// Query parameters for list reports
export const listReportsQuerySchema = z.object({
  assignmentId: z.string().uuid().optional(),
  childId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  status: z.enum(['completed', 'partial', 'failed']).optional(),
  reviewStatus: z.enum(['not_reviewed', 'approved', 'needs_attention', 'rejected']).optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export type ListReportsQuery = z.infer<typeof listReportsQuerySchema>;
