import {
  createReportSchema,
  reviewReportSchema,
  listReportsQuerySchema
} from '../../validators/report.validator';

describe('Report Validators', () => {
  describe('createReportSchema', () => {
    it('should validate correct report data', () => {
      const validData = {
        assignmentId: '123e4567-e89b-12d3-a456-426614174000',
        status: 'completed',
        durationMinutes: 30,
        childMood: 'good',
        feedbackText: 'Child did great!'
      };

      const result = createReportSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const invalidData = {
        assignmentId: '123e4567-e89b-12d3-a456-426614174000',
        status: 'invalid_status',
        durationMinutes: 30,
        childMood: 'good',
        feedbackText: 'Test'
      };

      const result = createReportSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid childMood', () => {
      const invalidData = {
        assignmentId: '123e4567-e89b-12d3-a456-426614174000',
        status: 'completed',
        durationMinutes: 30,
        childMood: 'happy', // Should be 'good', 'neutral', or 'difficult'
        feedbackText: 'Test'
      };

      const result = createReportSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative duration', () => {
      const invalidData = {
        assignmentId: '123e4567-e89b-12d3-a456-426614174000',
        status: 'completed',
        durationMinutes: -10,
        childMood: 'good',
        feedbackText: 'Test'
      };

      const result = createReportSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept optional media array', () => {
      const dataWithMedia = {
        assignmentId: '123e4567-e89b-12d3-a456-426614174000',
        status: 'completed',
        durationMinutes: 30,
        childMood: 'good',
        feedbackText: 'Test',
        media: [
          {
            mediaId: 'media-123',
            fileKey: 'uploads/test.jpg',
            fileName: 'test.jpg',
            fileType: 'image/jpeg',
            fileSize: 1024
          }
        ]
      };

      const result = createReportSchema.safeParse(dataWithMedia);
      expect(result.success).toBe(true);
    });
  });

  describe('reviewReportSchema', () => {
    it('should validate correct review data', () => {
      const validData = {
        reviewStatus: 'approved',
        reviewComments: 'Great progress!',
        reviewScore: 8.5
      };

      const result = reviewReportSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid reviewStatus', () => {
      const invalidData = {
        reviewStatus: 'invalid_status',
        reviewComments: 'Test'
      };

      const result = reviewReportSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject score out of range', () => {
      const invalidData = {
        reviewStatus: 'approved',
        reviewScore: 15 // Max is 10
      };

      const result = reviewReportSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept optional fields', () => {
      const minimalData = {
        reviewStatus: 'approved'
      };

      const result = reviewReportSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });
  });

  describe('listReportsQuerySchema', () => {
    it('should validate correct query params', () => {
      const validQuery = {
        page: 1,
        limit: 20,
        childId: '123e4567-e89b-12d3-a456-426614174000',
        status: 'completed',
        reviewStatus: 'approved'
      };

      const result = listReportsQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it('should use default values', () => {
      const emptyQuery = {};

      const result = listReportsQuerySchema.safeParse(emptyQuery);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('should reject invalid page number', () => {
      const invalidQuery = {
        page: 0 // Min is 1
      };

      const result = listReportsQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });

    it('should reject limit exceeding max', () => {
      const invalidQuery = {
        limit: 150 // Max is 100
      };

      const result = listReportsQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });
  });
});
