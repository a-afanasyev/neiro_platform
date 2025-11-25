/**
 * Reports API Type Definitions & Validation Schemas
 *
 * Соответствует API_CONTRACTS_MVP.md v0.9 Section 7 (Reports Service)
 * Автоматически валидирует request/response согласно API контрактам
 */

import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

export const ReportStatusSchema = z.enum(['completed', 'partial', 'failed']);
export type ReportStatus = z.infer<typeof ReportStatusSchema>;

export const ChildMoodSchema = z.enum(['good', 'neutral', 'difficult']);
export type ChildMood = z.infer<typeof ChildMoodSchema>;

export const ReviewStatusSchema = z.enum(['approved', 'needs_attention', 'rejected']);
export type ReviewStatus = z.infer<typeof ReviewStatusSchema>;

export const MediaTypeSchema = z.enum(['photo', 'video', 'audio']);
export type MediaType = z.infer<typeof MediaTypeSchema>;

// ============================================================================
// Media Schemas
// ============================================================================

export const MediaAssetSchema = z.object({
  mediaId: z.string().uuid('Invalid media ID format'),
  type: MediaTypeSchema,
  url: z.string().url('Invalid media URL'),
  durationSeconds: z.number().int().min(0).optional(),
});
export type MediaAsset = z.infer<typeof MediaAssetSchema>;

// ============================================================================
// Request Schemas
// ============================================================================

/**
 * POST /reports/v1 - Create Report
 * API_CONTRACTS_MVP.md:746-762
 */
export const CreateReportRequestSchema = z.object({
  assignmentId: z.string().uuid('Invalid assignment ID'),
  durationMinutes: z.number()
    .int('Duration must be integer')
    .min(1, 'Duration must be at least 1 minute')
    .max(180, 'Duration cannot exceed 180 minutes'),
  status: ReportStatusSchema,
  childMood: ChildMoodSchema,
  feedbackText: z.string()
    .max(1024, 'Feedback text cannot exceed 1024 characters')
    .optional(),
  media: z.array(MediaAssetSchema)
    .max(5, 'Maximum 5 media files allowed')
    .optional(),
});
export type CreateReportRequest = z.infer<typeof CreateReportRequestSchema>;

/**
 * POST /reports/v1/:id/review - Submit Review
 * API_CONTRACTS_MVP.md:773
 */
export const SubmitReviewRequestSchema = z.object({
  reviewStatus: ReviewStatusSchema,
  notes: z.string()
    .max(512, 'Review notes cannot exceed 512 characters')
    .optional(),
});
export type SubmitReviewRequest = z.infer<typeof SubmitReviewRequestSchema>;

// ============================================================================
// Response Schemas
// ============================================================================

/**
 * Report Response
 * API_CONTRACTS_MVP.md:1620-1658
 */
export const ReportResponseSchema = z.object({
  id: z.string().uuid(),
  assignmentId: z.string().uuid(),
  childId: z.string().uuid(),
  parentId: z.string().uuid(),
  specialistId: z.string().uuid().nullable(),
  reportDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  durationMinutes: z.number().int().min(0),
  status: ReportStatusSchema,
  childMood: ChildMoodSchema,
  feedbackText: z.string().nullable(),
  media: z.array(MediaAssetSchema),
  reviewStatus: ReviewStatusSchema.nullable(),
  reviewNotes: z.string().nullable(),
  reviewedAt: z.string().datetime().nullable(),
  submittedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type ReportResponse = z.infer<typeof ReportResponseSchema>;

/**
 * Paginated Reports List Response
 */
export const ReportsListResponseSchema = z.object({
  data: z.array(ReportResponseSchema),
  pagination: z.object({
    total: z.number().int().min(0),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1).max(100),
    totalPages: z.number().int().min(0),
  }),
});
export type ReportsListResponse = z.infer<typeof ReportsListResponseSchema>;

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Валидирует request для создания отчета
 * Throws ZodError если validation не прошла
 */
export function validateCreateReportRequest(data: unknown): CreateReportRequest {
  return CreateReportRequestSchema.parse(data);
}

/**
 * Безопасная валидация request для создания отчета
 * Возвращает { success: true, data } или { success: false, error }
 */
export function safeValidateCreateReportRequest(data: unknown) {
  return CreateReportRequestSchema.safeParse(data);
}

/**
 * Валидирует request для review
 */
export function validateSubmitReviewRequest(data: unknown): SubmitReviewRequest {
  return SubmitReviewRequestSchema.parse(data);
}

/**
 * Безопасная валидация request для review
 */
export function safeValidateSubmitReviewRequest(data: unknown) {
  return SubmitReviewRequestSchema.safeParse(data);
}

// ============================================================================
// Usage Examples
// ============================================================================

/*
// Backend API handler example:
import { safeValidateCreateReportRequest } from '@neiro/types/reports';

export async function POST(req: Request) {
  const body = await req.json();

  const result = safeValidateCreateReportRequest(body);
  if (!result.success) {
    return Response.json(
      { error: 'Validation failed', details: result.error.flatten() },
      { status: 400 }
    );
  }

  // result.data is now type-safe and validated
  const report = await reportsService.create(result.data);
  return Response.json(report);
}

// Frontend form validation example:
import { CreateReportRequestSchema } from '@neiro/types/reports';

const formData = {
  assignmentId: '...',
  durationMinutes: 25,
  status: 'completed',
  childMood: 'good',
  feedbackText: 'Great progress today!',
};

const result = CreateReportRequestSchema.safeParse(formData);
if (!result.success) {
  // Show validation errors to user
  console.error(result.error.flatten());
} else {
  // Submit to API
  await fetch('/api/reports', {
    method: 'POST',
    body: JSON.stringify(result.data),
  });
}
*/
