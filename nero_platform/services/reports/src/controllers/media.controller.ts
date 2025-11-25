import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { MinioService } from '../services/minio.service';
import { z } from 'zod';

const minioService = new MinioService();

const generateUploadUrlSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileType: z.string().regex(/^(image|video|audio)\//),
  fileSize: z.number().int().positive().max(100 * 1024 * 1024) // 100MB max
});

const confirmUploadSchema = z.object({
  fileKey: z.string().min(1),
  checksum: z.string().optional()
});

export class MediaController {
  async generateUploadUrl(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validation = generateUploadUrlSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: validation.error.errors
          }
        });
      }

      const { fileName, fileType } = validation.data;
      const userId = req.user!.userId;

      const result = await minioService.generateUploadUrl(fileName, fileType, userId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async confirmUpload(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { mediaId } = req.params;
      const validation = confirmUploadSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: validation.error.errors
          }
        });
      }

      const { fileKey } = validation.data;

      // Verify file exists in MinIO
      const exists = await minioService.verifyFileExists(fileKey);

      if (!exists) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'FILE_NOT_FOUND',
            message: 'File not found in storage'
          }
        });
      }

      // Get file metadata
      const metadata = await minioService.getFileMetadata(fileKey);

      // Generate download URL
      const downloadUrl = await minioService.generateDownloadUrl(fileKey);

      res.status(200).json({
        success: true,
        data: {
          mediaId,
          fileKey,
          url: downloadUrl,
          size: metadata.size,
          contentType: metadata.contentType,
          uploadedAt: metadata.lastModified
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getDownloadUrl(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { mediaId } = req.params;
      const { fileKey } = req.query;

      if (!fileKey || typeof fileKey !== 'string') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'fileKey query parameter is required'
          }
        });
      }

      // Verify file exists
      const exists = await minioService.verifyFileExists(fileKey);

      if (!exists) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'FILE_NOT_FOUND',
            message: 'File not found in storage'
          }
        });
      }

      // Generate download URL (valid for 1 hour)
      const downloadUrl = await minioService.generateDownloadUrl(fileKey, 3600);

      res.status(200).json({
        success: true,
        data: {
          mediaId,
          downloadUrl,
          expiresIn: 3600
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
